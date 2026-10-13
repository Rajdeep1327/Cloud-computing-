/**
 * CLAIM VERIFIER SERVICE — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * Adapter layer: cross-references structured Claims against recorded
 * ToolEvents and returns VerificationResults + a DiscrepancySummary.
 *
 * CONTRACT
 * ────────
 * Input  → { claims: Claim[], toolEvents: ToolEvent[] }
 * Output → Promise<VerificationResponse>
 *
 * INTEGRATION NOTES (for backend team)
 * ─────────────────────────────────────
 * 1. Replace VITE_VERIFIER_ENDPOINT with your actual endpoint.
 * 2. The live response must match VerificationResponse below.
 * 3. Do NOT rename verdict values; dashboard uses them directly.
 *    Allowed verdicts: 'VERIFIED' | 'CONTRADICTED' | 'UNVERIFIED'
 * 4. Do not return CONTRADICTED solely because an event is absent
 *    unless logCompleteness === 'COMPLETE'.
 * 5. Keep your API key in VITE_VERIFIER_API_KEY (env var).
 *
 * RUNNING MODES
 * ─────────────
 * MOCK  – returns demo verdicts immediately (no network, no key)
 * LIVE  – calls VITE_VERIFIER_ENDPOINT with a Bearer token
 * ─────────────────────────────────────────────────────────────────
 */

// ── Type definitions (JSDoc) ───────────────────────────────────────

/**
 * @typedef {Object} ToolEvent
 * @property {string} id          - Unique event identifier
 * @property {string} tool        - Tool name (e.g. 'read_file')
 * @property {string} target      - Target resource
 * @property {'success'|'failure'|'skipped'} status
 * @property {string} timestamp   - ISO 8601 timestamp
 * @property {number} durationMs  - Execution duration in milliseconds
 * @property {Object} [metadata]  - Tool-specific extra data
 */

/**
 * @typedef {Object} EvidenceItem
 * @property {string} eventId    - References ToolEvent.id
 * @property {'supporting'|'contradicting'} role
 * @property {string} detail     - Human-readable description
 */

/**
 * @typedef {Object} VerificationResult
 * @property {string} claimId
 * @property {'VERIFIED'|'CONTRADICTED'|'UNVERIFIED'} verdict
 * @property {string} summary
 * @property {string[]} supportingEventIds
 * @property {string[]} contradictingEventIds
 * @property {string|null} note
 * @property {EvidenceItem[]} evidence
 */

/**
 * @typedef {Object} DiscrepancySummary
 * @property {number} totalClaims
 * @property {number} verifiedCount
 * @property {number} contradictedCount
 * @property {number} unverifiedCount
 * @property {'COMPLETE'|'PARTIAL'|'UNKNOWN'} logCompleteness
 * @property {string[]} highlights
 * @property {'LOW'|'MEDIUM'|'HIGH'} riskLevel
 */

/**
 * @typedef {Object} VerificationResponse
 * @property {VerificationResult[]} results
 * @property {DiscrepancySummary} discrepancySummary
 */

// ── Configuration ──────────────────────────────────────────────────

const LIVE_ENDPOINT = import.meta.env.VITE_VERIFIER_ENDPOINT ?? null;
const LIVE_API_KEY  = import.meta.env.VITE_VERIFIER_API_KEY  ?? null;

export const IS_LIVE_VERIFIER = !!(LIVE_ENDPOINT && LIVE_API_KEY);

// ── Mock implementation ────────────────────────────────────────────

import { DEMO_VERDICTS, DEMO_DISCREPANCY_SUMMARY } from '../mock/demoData.js';

async function verifyCaimsMock(_claims, _toolEvents) {
  await new Promise(r => setTimeout(r, 900));
  return {
    results: DEMO_VERDICTS,
    discrepancySummary: DEMO_DISCREPANCY_SUMMARY,
  };
}

// ── Live implementation ────────────────────────────────────────────

async function verifyClaimsLive(claims, toolEvents) {
  const res = await fetch(LIVE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LIVE_API_KEY}`,
    },
    body: JSON.stringify({ claims, toolEvents }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Verifier API error ${res.status}: ${text}`);
  }

  /** @type {VerificationResponse} */
  const data = await res.json();

  if (!Array.isArray(data.results) || !data.discrepancySummary) {
    throw new Error(
      'Verifier API returned unexpected shape (expected { results: [], discrepancySummary: {} })'
    );
  }

  return data;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Verify claims against tool events.
 * @param {import('./claimExtractor').Claim[]} claims
 * @param {ToolEvent[]} toolEvents
 * @returns {Promise<VerificationResponse>}
 */
export async function verifyClaims(claims, toolEvents) {
  if (IS_LIVE_VERIFIER) {
    return verifyClaimsLive(claims, toolEvents);
  }
  return verifyCaimsMock(claims, toolEvents);
}
