/**
 * ORCHESTRATION API — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * High-level facade that sequences:
 *   1. extractClaims(statement)
 *   2. verifyClaims(claims, toolEvents)
 *
 * Components should import from here, not directly from the
 * lower-level services.
 * ─────────────────────────────────────────────────────────────────
 */

import { extractClaims, IS_LIVE_EXTRACTOR } from './claimExtractor.js';
import { verifyClaims, IS_LIVE_VERIFIER } from './claimVerifier.js';
import { DEMO_TOOL_EVENTS, DEMO_STATEMENT } from '../mock/demoData.js';

export const MODE = IS_LIVE_EXTRACTOR && IS_LIVE_VERIFIER ? 'LIVE' : 'MOCK';

/**
 * Run a full analysis pipeline.
 *
 * @param {{
 *   statement: import('./claimExtractor').AgentStatement,
 *   toolEvents: import('./claimVerifier').ToolEvent[]
 * }} params
 * @returns {Promise<{
 *   statement: import('./claimExtractor').AgentStatement,
 *   claims: import('./claimExtractor').Claim[],
 *   toolEvents: import('./claimVerifier').ToolEvent[],
 *   results: import('./claimVerifier').VerificationResult[],
 *   discrepancySummary: import('./claimVerifier').DiscrepancySummary
 * }>}
 */
export async function runAnalysis({ statement, toolEvents }) {
  const claims = await extractClaims(statement);
  const { results, discrepancySummary } = await verifyClaims(claims, toolEvents);
  return { statement, claims, toolEvents, results, discrepancySummary };
}

/**
 * Convenience: run the built-in demo scenario.
 * @returns {Promise<ReturnType<runAnalysis>>}
 */
export async function runDemo() {
  return runAnalysis({
    statement: DEMO_STATEMENT,
    toolEvents: DEMO_TOOL_EVENTS,
  });
}
