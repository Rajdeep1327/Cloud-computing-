/**
 * ORCHESTRATION API — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * High-level facade that sequences:
 *   1. extractClaims(statement)
 *   2. verifyClaims(claims, toolEvents)
 *
 * LIVE MODE (VITE_API_BASE_URL is set):
 *   A single POST /verify call handles both steps server-side.
 *   The React frontend never sees API keys.
 *
 * MOCK MODE (no env vars set):
 *   Uses local demo data with simulated latency.
 *
 * Components should import from here, not directly from the
 * lower-level services.
 * ─────────────────────────────────────────────────────────────────
 */

import { extractClaims, IS_LIVE_EXTRACTOR } from './claimExtractor.js';
import { verifyClaims, IS_LIVE_VERIFIER } from './claimVerifier.js';
import { DEMO_TOOL_EVENTS, DEMO_STATEMENT } from '../mock/demoData.js';

// ── Live unified API (single backend endpoint) ────────────────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? null;

export const IS_LIVE_API = !!API_BASE;

// MODE: LIVE if either the unified API or both individual endpoints are set
export const MODE =
  IS_LIVE_API || (IS_LIVE_EXTRACTOR && IS_LIVE_VERIFIER) ? 'LIVE' : 'MOCK';

/**
 * Run a full analysis pipeline.
 *
 * In LIVE mode (VITE_API_BASE_URL set): sends one POST /verify to the
 * Python backend which calls Rishav's extractor then Rajdeep's verifier.
 *
 * In MOCK mode: calls the individual service adapters (which use demo data).
 *
 * @param {{
 *   statement: import('./claimExtractor').AgentStatement,
 *   toolEvents: import('./claimVerifier').ToolEvent[],
 *   expectedActions?: Array<{type: string, target: string}>,
 *   loggingComplete?: boolean,
 * }} params
 * @returns {Promise<{
 *   statement: import('./claimExtractor').AgentStatement,
 *   claims: import('./claimExtractor').Claim[],
 *   toolEvents: import('./claimVerifier').ToolEvent[],
 *   results: import('./claimVerifier').VerificationResult[],
 *   discrepancySummary: import('./claimVerifier').DiscrepancySummary,
 *   extractionMeta?: object,
 * }>}
 */
export async function runAnalysis({
  statement,
  toolEvents,
  expectedActions = [],
  loggingComplete = false,
}) {
  if (IS_LIVE_API) {
    return runAnalysisLive({ statement, toolEvents, expectedActions, loggingComplete });
  }

  // Fallback: individual adapter services (handles VITE_EXTRACTOR_ENDPOINT etc.)
  const claims = await extractClaims(statement);
  const { results, discrepancySummary } = await verifyClaims(claims, toolEvents);
  return { statement, claims, toolEvents, results, discrepancySummary };
}

/**
 * Live path: single POST /verify to Python backend.
 * @private
 */
async function runAnalysisLive({ statement, toolEvents, expectedActions, loggingComplete }) {
  const body = {
    agent_statement: statement.text ?? statement,
    tool_events: toolEvents,
    expected_actions: expectedActions,
    logging_complete: loggingComplete,
  };

  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Backend API error ${res.status}: ${text}`);
  }

  /**
   * Backend returns:
   * { run_id, results, discrepancySummary, claims, statement, toolEvents, extractionMeta }
   */
  const data = await res.json();

  // Validate shape
  if (!Array.isArray(data.results) || !data.discrepancySummary) {
    throw new Error('Backend /verify returned unexpected shape');
  }

  // Reconstruct the AgentStatement object the dashboard expects
  const agentStatement = data.statement ?? {
    id: data.run_id,
    text: statement.text ?? statement,
    timestamp: new Date().toISOString(),
    agentId: 'agent-live',
  };

  return {
    statement: agentStatement,
    claims: data.claims ?? [],
    toolEvents: data.toolEvents ?? toolEvents,
    results: data.results,
    discrepancySummary: data.discrepancySummary,
    extractionMeta: data.extractionMeta ?? null,
  };
}

/**
 * Convenience: run the built-in demo scenario.
 * In LIVE mode: submits demo statement + events to the real backend.
 * In MOCK mode: returns hard-coded demo verdicts.
 * @returns {Promise<ReturnType<runAnalysis>>}
 */
export async function runDemo() {
  return runAnalysis({
    statement: DEMO_STATEMENT,
    toolEvents: DEMO_TOOL_EVENTS,
    loggingComplete: true,
  });
}
