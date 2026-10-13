/**
 * CLAIM EXTRACTOR SERVICE — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * Adapter layer: converts an agent's natural-language statement
 * into structured Claim objects.
 *
 * CONTRACT
 * ────────
 * Input  → AgentStatement  (see typedef below)
 * Output → Promise<Claim[]>
 *
 * INTEGRATION NOTES (for backend team)
 * ─────────────────────────────────────
 * 1. Replace the `LIVE_ENDPOINT` constant with your actual endpoint.
 * 2. The live implementation must return an array matching Claim[].
 * 3. Do NOT change the field names below; dashboard components
 *    depend on them.
 * 4. Keep your API key in VITE_EXTRACTOR_API_KEY (env var, never
 *    committed).
 *
 * RUNNING MODES
 * ─────────────
 * MOCK  – returns pre-built demo data immediately (no network, no key)
 * LIVE  – calls VITE_EXTRACTOR_ENDPOINT with a Bearer token
 * ─────────────────────────────────────────────────────────────────
 */

// ── Type definitions (JSDoc — no TypeScript required) ──────────────

/**
 * @typedef {Object} AgentStatement
 * @property {string} id          - Unique statement identifier
 * @property {string} text        - Raw natural-language statement from agent
 * @property {string} timestamp   - ISO 8601 creation timestamp
 * @property {string} agentId     - Identifier of the AI agent
 */

/**
 * @typedef {Object} Claim
 * @property {string} id            - Unique claim identifier
 * @property {string} statementId   - Parent statement ID
 * @property {string} description   - Human-readable claim description
 * @property {string} action        - Tool/action type claimed (e.g. 'read_file')
 * @property {number} expectedCount - How many times the action was claimed
 * @property {number} confidence    - Extractor confidence [0–1]
 */

// ── Configuration ──────────────────────────────────────────────────

const LIVE_ENDPOINT = import.meta.env.VITE_EXTRACTOR_ENDPOINT ?? null;
const LIVE_API_KEY  = import.meta.env.VITE_EXTRACTOR_API_KEY  ?? null;

export const IS_LIVE_EXTRACTOR = !!(LIVE_ENDPOINT && LIVE_API_KEY);

// ── Mock implementation ────────────────────────────────────────────

import { DEMO_CLAIMS } from '../mock/demoData.js';

async function extractClaimsMock(_statement) {
  // Simulate network latency so loading states are visible
  await new Promise(r => setTimeout(r, 600));
  return DEMO_CLAIMS;
}

// ── Live implementation ────────────────────────────────────────────

async function extractClaimsLive(statement) {
  const res = await fetch(LIVE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LIVE_API_KEY}`,
    },
    body: JSON.stringify({ statement }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Extractor API error ${res.status}: ${text}`);
  }

  /** @type {{ claims: Claim[] }} */
  const data = await res.json();

  if (!Array.isArray(data.claims)) {
    throw new Error('Extractor API returned unexpected shape (expected { claims: [] })');
  }

  return data.claims;
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Extract structured claims from an agent statement.
 * @param {AgentStatement} statement
 * @returns {Promise<Claim[]>}
 */
export async function extractClaims(statement) {
  if (IS_LIVE_EXTRACTOR) {
    return extractClaimsLive(statement);
  }
  return extractClaimsMock(statement);
}
