"""PromiseLedger — Backend API Server
────────────────────────────────────────────────────────────────────
Single-process FastAPI server that sequences:
  1. Rishav's claim_extractor  →  structured claims
  2. Rajdeep's verify_run()    →  verdicts + evidence

Endpoints
─────────
POST /verify    — full pipeline (extract + verify)
POST /extract   — extraction only (debug / incremental UI)
GET  /health    — liveness probe

Environment Variables (server-side only — never sent to React)
──────────────────────────────────────────────────────────────
OPEN_WEIGHT_API_KEY   — HuggingFace / Groq token for live LLM extraction
GROQ_API_KEY          — Groq token (alternative)
EXTRACTOR_FORCE_FALLBACK=1  — force deterministic extraction (no LLM)
PROMISELEDGER_API_KEY — optional static key to protect the API
CORS_ORIGINS          — comma-separated allowed origins (default: *)
────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import os
import sys
import uuid
import logging
from typing import Any, Dict, List, Optional

# ── Ensure repo root is on the import path ────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# ── Import teammate modules (do NOT modify these files) ───────────────
from hacktober.backend.claim_extractor import ClaimExtractor, ClaimValidationError
from verifier.engine import verify_run

# ── FastAPI ───────────────────────────────────────────────────────────
from fastapi import FastAPI, HTTPException, Request, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

# ── Logging ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("promiseledger.api")

# ── Optional static API key guard ────────────────────────────────────
_API_KEY = os.environ.get("PROMISELEDGER_API_KEY", "")

# ── CORS ──────────────────────────────────────────────────────────────
_raw_origins = os.environ.get("CORS_ORIGINS", "*")
CORS_ORIGINS: List[str] = (
    ["*"] if _raw_origins.strip() == "*"
    else [o.strip() for o in _raw_origins.split(",") if o.strip()]
)

# ─────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="PromiseLedger API",
    version="1.0.0",
    description="AI agent accountability: claim extraction → deterministic verification.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Lazy-initialise extractor once ───────────────────────────────────
_extractor: Optional[ClaimExtractor] = None


def get_extractor() -> ClaimExtractor:
    global _extractor
    if _extractor is None:
        _extractor = ClaimExtractor()
    return _extractor


# ─────────────────────────────────────────────────────────────────────
# Pydantic request / response models
# ─────────────────────────────────────────────────────────────────────

class ExpectedAction(BaseModel):
    action_id: Optional[str] = None
    type: Optional[str] = None          # used by extractor
    action: Optional[str] = None        # used by verifier
    target: str


class ToolEventRequest(BaseModel):
    """
    Incoming tool event from the frontend.
    Frontend uses `tool` for the action name and `id` for the event ID;
    the verifier expects `action` and `event_id`.
    This model normalises both shapes.
    """
    id: Optional[str] = None
    event_id: Optional[str] = None
    tool: Optional[str] = None
    action: Optional[str] = None
    target: str
    status: str  # 'success' | 'failed' | 'skipped'
    timestamp: Optional[str] = None
    duration_ms: Optional[int] = Field(None, alias="durationMs")
    details: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

    model_config = {"populate_by_name": True}

    @field_validator("status")
    @classmethod
    def normalise_status(cls, v: str) -> str:
        """Map frontend 'failure'/'skipped' → verifier 'failed'/'failed'."""
        mapping = {"failure": "failed", "skipped": "failed"}
        return mapping.get(v.lower(), v.lower())


class VerifyRequest(BaseModel):
    run_id: Optional[str] = None
    agent_statement: str = Field(..., min_length=1)
    tool_events: List[ToolEventRequest]
    expected_actions: Optional[List[ExpectedAction]] = None
    logging_complete: bool = False
    force_fallback: bool = False


class ExtractRequest(BaseModel):
    agent_statement: str = Field(..., min_length=1)
    expected_actions: Optional[List[ExpectedAction]] = None
    force_fallback: bool = False


# ─────────────────────────────────────────────────────────────────────
# Helpers: schema adapters
# ─────────────────────────────────────────────────────────────────────

def _adapt_tool_events_for_verifier(
    raw_events: List[ToolEventRequest],
) -> List[Dict[str, Any]]:
    """
    Convert frontend ToolEvent shape → verifier engine shape.

    Frontend  : { id, tool, target, status, durationMs, metadata }
    Verifier  : { event_id, action, target, status, details }
    """
    adapted = []
    for evt in raw_events:
        event_id = evt.event_id or evt.id or str(uuid.uuid4())
        action = evt.action or evt.tool or "unknown_action"
        details = evt.details or evt.metadata or {}
        adapted.append({
            "event_id": event_id,
            "action": action,
            "target": evt.target,
            "status": evt.status,          # already normalised by validator
            "details": details,
        })
    return adapted


def _adapt_claims_for_verifier(
    extractor_claims: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Extractor output  → verifier input.
    Both already use `claim_id`, `action`, `target` — no renaming needed.
    We strip extra extractor-only keys (source_text, confidence) for cleanliness.
    """
    return [
        {
            "claim_id": c["claim_id"],
            "action": c["action"],
            "target": c["target"],
        }
        for c in extractor_claims
    ]


def _build_frontend_results(
    extractor_claims: List[Dict[str, Any]],
    verifier_results: List[Dict[str, Any]],
    original_events: List[ToolEventRequest],
) -> List[Dict[str, Any]]:
    """
    Merge extractor + verifier output into the shape the React frontend expects.

    Frontend VerificationResult shape:
      { claimId, verdict, summary, supportingEventIds, contradictingEventIds,
        note, evidence: [{eventId, role, detail}] }
    """
    # Build a map from event_id → original frontend id (so evidence links back to
    # frontend event ids that the ToolTimeline component can highlight).
    event_id_to_frontend_id: Dict[str, str] = {}
    for evt in original_events:
        eid = evt.event_id or evt.id or ""
        fid = evt.id or evt.event_id or eid
        event_id_to_frontend_id[eid] = fid

    # Build a lookup: claim_id → extractor claim data
    claim_lookup: Dict[str, Dict[str, Any]] = {c["claim_id"]: c for c in extractor_claims}

    results = []
    for vr in verifier_results:
        claim_id = vr["claim_id"]
        status = vr["status"]          # VERIFIED | CONTRADICTED | UNVERIFIED
        explanation = vr.get("explanation", "")
        reason_code = vr.get("reason_code", "")
        raw_evidence = vr.get("evidence", [])   # list of full event dicts

        # Map evidence items → frontend EvidenceItem shape
        frontend_evidence = []
        supporting_ids = []
        contradicting_ids = []

        for ev in raw_evidence:
            ev_event_id = ev.get("event_id", "")
            frontend_eid = event_id_to_frontend_id.get(ev_event_id, ev_event_id)
            ev_status = ev.get("status", "")
            ev_action = ev.get("action", "")
            ev_target = ev.get("target", "")

            # Supporting = success, contradicting = failed
            if ev_status == "success":
                role = "supporting"
                supporting_ids.append(frontend_eid)
            else:
                role = "contradicting"
                contradicting_ids.append(frontend_eid)

            detail = f"{ev_action}({ev_target}) → {ev_status}"
            if ev.get("details"):
                extra = ", ".join(f"{k}: {v}" for k, v in ev["details"].items())
                if extra:
                    detail += f" ({extra})"

            frontend_evidence.append({
                "eventId": frontend_eid,
                "role": role,
                "detail": detail,
            })

        # Build a human-readable summary
        claim_desc = claim_lookup.get(claim_id, {}).get("source_text", "")
        summary = explanation or f"{status}: {claim_desc}"

        # Note for edge cases
        note: Optional[str] = None
        if reason_code == "INSUFFICIENT_EVIDENCE":
            note = "No matching events found; log completeness is not confirmed — verdict is UNVERIFIED."
        elif reason_code == "AMBIGUOUS_EVIDENCE":
            note = "A matching event has a missing ID or unknown outcome."
        elif reason_code == "CONFLICTING_EVENTS":
            note = "Matching events contain both success and failure outcomes."

        results.append({
            "claimId": claim_id,
            "verdict": status,
            "summary": summary,
            "supportingEventIds": supporting_ids,
            "contradictingEventIds": contradicting_ids,
            "note": note,
            "evidence": frontend_evidence,
        })

    return results


def _build_discrepancy_summary(
    verifier_summary: Dict[str, Any],
    verifier_results: List[Dict[str, Any]],
    logging_complete: bool,
) -> Dict[str, Any]:
    """Build the DiscrepancySummary object the frontend DiscrepancyPanel expects."""
    total = verifier_summary.get("total", len(verifier_results))
    verified = verifier_summary.get("verified", 0)
    contradicted = verifier_summary.get("contradicted", 0)
    unverified = verifier_summary.get("unverified", 0)

    # Risk level
    if contradicted > 0:
        risk = "HIGH" if contradicted >= total / 2 else "MEDIUM"
    elif unverified > 0:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    log_completeness = "COMPLETE" if logging_complete else "PARTIAL"

    # Build highlight bullets from reason codes
    highlights: List[str] = []
    for vr in verifier_results:
        rc = vr.get("reason_code", "")
        claim_id = vr.get("claim_id", "?")
        status = vr.get("status", "?")
        if rc == "EXPECTED_ACTION_MISSING":
            highlights.append(
                f"Claim '{claim_id}' is CONTRADICTED: expected action absent in a complete log."
            )
        elif rc == "EXPLICIT_FAILURE":
            highlights.append(
                f"Claim '{claim_id}' is CONTRADICTED: a recorded tool event explicitly failed."
            )
        elif rc == "CONFLICTING_EVENTS":
            highlights.append(
                f"Claim '{claim_id}' is UNVERIFIED: conflicting success and failure events."
            )
        elif rc == "INSUFFICIENT_EVIDENCE" and status == "UNVERIFIED":
            highlights.append(
                f"Claim '{claim_id}' is UNVERIFIED: no matching events found."
            )

    if not highlights:
        highlights.append("All claims were processed. Review individual verdicts above.")

    return {
        "totalClaims": total,
        "verifiedCount": verified,
        "contradictedCount": contradicted,
        "unverifiedCount": unverified,
        "logCompleteness": log_completeness,
        "highlights": highlights,
        "riskLevel": risk,
    }


def _build_frontend_claims(
    extractor_claims: List[Dict[str, Any]],
    statement_id: str,
) -> List[Dict[str, Any]]:
    """
    Convert extractor claims → frontend Claim shape.

    Frontend Claim: { id, statementId, description, action, expectedCount, confidence }
    """
    return [
        {
            "id": c["claim_id"],
            "statementId": statement_id,
            "description": c.get("source_text", c["action"] + " on " + c["target"]),
            "action": c["action"],
            "expectedCount": 1,
            "confidence": c.get("confidence", 1.0),
        }
        for c in extractor_claims
    ]


# ─────────────────────────────────────────────────────────────────────
# Middleware: optional API key check
# ─────────────────────────────────────────────────────────────────────

@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    if not _API_KEY:
        return await call_next(request)
    if request.method in ("OPTIONS",) or request.url.path == "/health":
        return await call_next(request)
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer ") or auth[7:] != _API_KEY:
        return JSONResponse({"detail": "Unauthorized"}, status_code=401)
    return await call_next(request)


# ─────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    """Liveness probe."""
    return {"status": "ok", "service": "promiseledger-api"}


@app.post("/extract")
async def extract_endpoint(body: ExtractRequest):
    """
    Step 1 only: extract structured claims from an agent statement.
    Useful for incremental UI or debugging the extractor.
    """
    logger.info("POST /extract  statement_len=%d  force_fallback=%s",
                len(body.agent_statement), body.force_fallback)
    try:
        ext = get_extractor()
        result = ext.extract(
            body.agent_statement,
            expected_actions=[ea.model_dump() for ea in (body.expected_actions or [])],
            force_fallback=body.force_fallback,
        )
        return {
            "claims": result["claims"],
            "extraction_meta": result.get("extraction_meta", {}),
        }
    except ClaimValidationError as exc:
        logger.warning("ClaimValidationError: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error in /extract")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {exc}")


@app.post("/verify")
async def verify_endpoint(body: VerifyRequest):
    """
    Full pipeline: extract claims → verify against tool events.

    Request body matches the shape the React frontend submits.
    Response body matches VerificationResponse expected by claimVerifier.js.
    """
    run_id = body.run_id or f"run-{uuid.uuid4().hex[:8]}"
    logger.info(
        "POST /verify  run_id=%s  statement_len=%d  events=%d  logging_complete=%s",
        run_id, len(body.agent_statement), len(body.tool_events), body.logging_complete,
    )

    # ── Step 1: Extract claims (Rishav's module) ──────────────────────
    try:
        ext = get_extractor()
        expected_dicts = [ea.model_dump() for ea in (body.expected_actions or [])]
        extraction_result = ext.extract(
            body.agent_statement,
            expected_actions=expected_dicts if expected_dicts else None,
            force_fallback=body.force_fallback,
        )
    except ClaimValidationError as exc:
        logger.warning("ClaimValidationError during extraction: %s", exc)
        raise HTTPException(
            status_code=422,
            detail=f"Claim extraction failed schema validation: {exc}",
        )
    except Exception as exc:
        logger.exception("Unexpected error during claim extraction")
        raise HTTPException(
            status_code=500,
            detail=f"Claim extraction error: {type(exc).__name__}: {exc}",
        )

    extractor_claims: List[Dict[str, Any]] = extraction_result.get("claims", [])
    extraction_meta: Dict[str, Any] = extraction_result.get("extraction_meta", {})

    if not extractor_claims:
        logger.info("run_id=%s: no claims extracted — returning empty results", run_id)
        return {
            "run_id": run_id,
            "results": [],
            "discrepancySummary": {
                "totalClaims": 0,
                "verifiedCount": 0,
                "contradictedCount": 0,
                "unverifiedCount": 0,
                "logCompleteness": "COMPLETE" if body.logging_complete else "PARTIAL",
                "highlights": ["No checkable action claims found in the agent statement."],
                "riskLevel": "LOW",
            },
            "claims": [],
            "statement": {
                "id": run_id,
                "text": body.agent_statement,
                "timestamp": None,
                "agentId": "agent-live",
            },
            "toolEvents": [e.model_dump(by_alias=True) for e in body.tool_events],
            "extractionMeta": extraction_meta,
        }

    # ── Step 2: Adapt events + claims for Rajdeep's verifier ─────────
    verifier_events = _adapt_tool_events_for_verifier(body.tool_events)
    verifier_claims = _adapt_claims_for_verifier(extractor_claims)

    verifier_expected = []
    for ea in (body.expected_actions or []):
        verifier_expected.append({
            "action": ea.action or ea.type or "",
            "target": ea.target,
        })

    run_data = {
        "run_id": run_id,
        "claims": verifier_claims,
        "tool_events": verifier_events,
        "expected_actions": verifier_expected,
        "logging_complete": body.logging_complete,
    }

    # ── Step 3: Verify (Rajdeep's module) ─────────────────────────────
    try:
        verification_output = verify_run(run_data)
    except Exception as exc:
        logger.exception("Unexpected error during verification")
        raise HTTPException(
            status_code=500,
            detail=f"Verification engine error: {type(exc).__name__}: {exc}",
        )

    verifier_results: List[Dict[str, Any]] = verification_output.get("results", [])
    verifier_summary: Dict[str, Any] = verification_output.get("summary", {})

    # ── Step 4: Adapt output → frontend shapes ────────────────────────
    statement_id = run_id
    frontend_claims = _build_frontend_claims(extractor_claims, statement_id)
    frontend_results = _build_frontend_results(
        extractor_claims, verifier_results, body.tool_events
    )
    discrepancy_summary = _build_discrepancy_summary(
        verifier_summary, verifier_results, body.logging_complete
    )

    # Re-serialise tool events for frontend (preserve original field names)
    frontend_tool_events = []
    for evt in body.tool_events:
        fe = {
            "id": evt.id or evt.event_id,
            "tool": evt.tool or evt.action,
            "target": evt.target,
            "status": evt.status,
            "timestamp": evt.timestamp,
            "durationMs": evt.duration_ms,
            "metadata": evt.metadata or evt.details or {},
        }
        frontend_tool_events.append(fe)

    logger.info(
        "run_id=%s  verified=%d  contradicted=%d  unverified=%d  fallback=%s",
        run_id,
        discrepancy_summary["verifiedCount"],
        discrepancy_summary["contradictedCount"],
        discrepancy_summary["unverifiedCount"],
        extraction_meta.get("is_fallback", False),
    )

    return {
        "run_id": run_id,
        # ── Frontend VerificationResponse shape ──
        "results": frontend_results,
        "discrepancySummary": discrepancy_summary,
        # ── Extra context the React runAnalysis() also needs ──
        "claims": frontend_claims,
        "statement": {
            "id": statement_id,
            "text": body.agent_statement,
            "timestamp": None,
            "agentId": "agent-live",
        },
        "toolEvents": frontend_tool_events,
        # ── Diagnostics ──
        "extractionMeta": extraction_meta,
    }


# ─────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info("Starting PromiseLedger API on port %d", port)
    uvicorn.run("api.server:app", host="0.0.0.0", port=port, reload=True)
