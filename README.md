# PromiseLedger

> **AI agent accountability dashboard** — cross-references an agent's natural-language claims against its recorded tool execution events.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (no API keys needed for demo mode)
npm run dev
```

Open **http://localhost:5173** and click **▶ Run Demo**.

---

## Running Modes

| Mode | When active | API keys needed |
|------|-------------|-----------------|
| **Mock** (◎) | Default — no `.env.local` set | No |
| **Live** (●) | Both `VITE_EXTRACTOR_*` and `VITE_VERIFIER_*` are set | Yes |

The mode badge in the header always shows the current mode.

---

## Build for Production

```bash
npm run build
npm run preview   # local preview of prod build
```

---

## Project Structure

```
src/
├── components/
│   ├── AgentStatementPanel.jsx  # Displays raw agent statement
│   ├── CinematicHero.jsx        # Two-frame light cyberpunk scroll crossfade hero
│   ├── ClaimsTable.jsx          # Claims × verdicts table
│   ├── DiscrepancyPanel.jsx     # Discrepancy highlights + risk level
│   ├── ErrorBanner.jsx          # Error state with retry
│   ├── EvidenceModal.jsx        # Per-claim evidence inspector (modal)
│   ├── LoadingSpinner.jsx       # Loading state with radar animation
│   ├── SummaryCards.jsx         # VERIFIED / CONTRADICTED / UNVERIFIED tiles
│   ├── ToolTimeline.jsx         # Chronological tool event timeline
│   └── VerdictBadge.jsx         # Pill badge (color + icon + text)
├── mock/
│   └── demoData.js              # Sample scenario (no network required)
├── pages/
│   └── Dashboard.jsx            # Top-level page / state machine
└── services/
    ├── api.js                   # High-level facade (runDemo, runAnalysis)
    ├── claimExtractor.js        # Adapter A: statement → claims
    └── claimVerifier.js         # Adapter B: claims + events → verdicts
```

---

## Integration Guide

### A. Claim Extraction

**Endpoint:** `POST VITE_EXTRACTOR_ENDPOINT`
**Auth:** `Authorization: Bearer VITE_EXTRACTOR_API_KEY`

**Request body:**
```json
{
  "statement": {
    "id": "stmt-001",
    "text": "I inspected all five files and generated the report.",
    "timestamp": "2024-01-15T14:30:00Z",
    "agentId": "agent-alpha-v2"
  }
}
```

**Expected response:**
```json
{
  "claims": [
    {
      "id": "clm-001",
      "statementId": "stmt-001",
      "description": "Inspected all five files",
      "action": "read_file",
      "expectedCount": 5,
      "confidence": 0.95
    }
  ]
}
```

Service file: `src/services/claimExtractor.js`

---

### B. Claim Verification

**Endpoint:** `POST VITE_VERIFIER_ENDPOINT`
**Auth:** `Authorization: Bearer VITE_VERIFIER_API_KEY`

**Request body:**
```json
{
  "claims": [],
  "toolEvents": [
    {
      "id": "evt-001",
      "tool": "read_file",
      "target": "config.yaml",
      "status": "success",
      "timestamp": "2024-01-15T14:28:01Z",
      "durationMs": 45,
      "metadata": {}
    }
  ]
}
```

**Expected response:**
```json
{
  "results": [
    {
      "claimId": "clm-001",
      "verdict": "CONTRADICTED",
      "summary": "Only 3 of 5 reads succeeded.",
      "supportingEventIds": ["evt-001", "evt-002", "evt-003"],
      "contradictingEventIds": ["evt-004", "evt-005"],
      "note": "Log is COMPLETE.",
      "evidence": [
        { "eventId": "evt-001", "role": "supporting", "detail": "read_file(config.yaml) → success" }
      ]
    }
  ],
  "discrepancySummary": {
    "totalClaims": 2,
    "verifiedCount": 1,
    "contradictedCount": 1,
    "unverifiedCount": 0,
    "logCompleteness": "COMPLETE",
    "highlights": ["Agent claimed 5 files; only 3 read."],
    "riskLevel": "MEDIUM"
  }
}
```

**Verdict values:** `"VERIFIED"` | `"CONTRADICTED"` | `"UNVERIFIED"`
**Log completeness:** `"COMPLETE"` | `"PARTIAL"` | `"UNKNOWN"`
**Risk levels:** `"LOW"` | `"MEDIUM"` | `"HIGH"`

NOTE: Do NOT return CONTRADICTED solely because a tool event is absent unless logCompleteness is "COMPLETE".

Service file: `src/services/claimVerifier.js`

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
VITE_EXTRACTOR_ENDPOINT=https://your-backend/api/extract
VITE_EXTRACTOR_API_KEY=your-key

VITE_VERIFIER_ENDPOINT=https://your-backend/api/verify
VITE_VERIFIER_API_KEY=your-key
```

Never commit `.env.local` or real API keys.

---

## Tech Stack

- React 19 + Vite 6 — fast dev server and HMR
- Tailwind CSS v4 — utility-first styling via @tailwindcss/vite plugin
- No additional UI libraries — zero unnecessary dependencies

---

## Sample Scenario

**Agent statement:**
> *"I inspected all five files, generated the report, and dispatched an alert to the security webhook."*

**Recorded telemetry events:**
- Successful reads of `config.yaml`, `main.py`, `utils.py`
- Skipped reads of `tests/test_main.py` and `README.md` (HTTP 429 quota limit)
- Successful execution of `generate_report` (`analysis_report.pdf`, 12 pages)
- Webhook notification event stream not attached in this session

| Claim Assertion | Verdict | Audit Finding & Rationale |
|-----------------|---------|---------------------------|
| **Inspected all five files** | `CONTRADICTED` | Only 3 of 5 reads succeeded; 2 skipped due to quota limits. Execution log is `COMPLETE`, disproving full inspection. |
| **Generated the report** | `VERIFIED` | `generate_report` event succeeded; `analysis_report.pdf` created with checksum verification. |
| **Dispatched alert to security webhook** | `UNVERIFIED` | No webhook dispatch events found in telemetry stream. Cannot confirm execution without external webhook auditor. |

---

## Files Changed

| File | Purpose |
|------|---------|
| vite.config.js | Vite + Tailwind config |
| index.html | HTML template |
| src/index.css | Global styles |
| src/App.jsx | Root component |
| src/main.jsx | Entry point |
| src/mock/demoData.js | Sample scenario data |
| src/services/api.js | Orchestration facade |
| src/services/claimExtractor.js | Extractor adapter (mock + live) |
| src/services/claimVerifier.js | Verifier adapter (mock + live) |
| src/pages/Dashboard.jsx | Main dashboard page |
| src/components/AgentStatementPanel.jsx | Statement display |
| src/components/SummaryCards.jsx | Metric tiles |
| src/components/ClaimsTable.jsx | Claims x verdicts table |
| src/components/EvidenceModal.jsx | Per-claim evidence dialog |
| src/components/ToolTimeline.jsx | Event timeline |
| src/components/DiscrepancyPanel.jsx | Discrepancy highlights |
| src/components/VerdictBadge.jsx | Status badge |
| src/components/LoadingSpinner.jsx | Loading state |
| src/components/ErrorBanner.jsx | Error state |
| .env.example | Environment variable template |
