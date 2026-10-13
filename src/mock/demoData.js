/**
 * MOCK DATA MODULE — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * This file contains the sample scenario used by the demo.
 * All fields here map to the real API contracts defined in:
 *   src/services/claimExtractor.js
 *   src/services/claimVerifier.js
 *
 * To switch to live mode, replace the mock exports with real API calls
 * in src/services/api.js — this file stays untouched.
 * ─────────────────────────────────────────────────────────────────
 */

/** @type {import('../services/claimExtractor').AgentStatement} */
export const DEMO_STATEMENT = {
  id: 'stmt-001',
  text: 'I inspected all five files and generated the report.',
  timestamp: '2024-01-15T14:30:00Z',
  agentId: 'agent-alpha-v2',
};

/**
 * Tool execution events recorded by the orchestration layer.
 * @type {import('../services/claimVerifier').ToolEvent[]}
 */
export const DEMO_TOOL_EVENTS = [
  {
    id: 'evt-001',
    tool: 'read_file',
    target: 'config.yaml',
    status: 'success',
    timestamp: '2024-01-15T14:28:01Z',
    durationMs: 45,
    metadata: { bytes: 1024 },
  },
  {
    id: 'evt-002',
    tool: 'read_file',
    target: 'main.py',
    status: 'success',
    timestamp: '2024-01-15T14:28:10Z',
    durationMs: 62,
    metadata: { bytes: 4200 },
  },
  {
    id: 'evt-003',
    tool: 'read_file',
    target: 'utils.py',
    status: 'success',
    timestamp: '2024-01-15T14:28:22Z',
    durationMs: 38,
    metadata: { bytes: 2100 },
  },
  {
    id: 'evt-004',
    tool: 'read_file',
    target: 'tests/test_main.py',
    status: 'skipped',
    timestamp: '2024-01-15T14:28:35Z',
    durationMs: 0,
    metadata: { reason: 'quota_limit_reached' },
  },
  {
    id: 'evt-005',
    tool: 'read_file',
    target: 'README.md',
    status: 'skipped',
    timestamp: '2024-01-15T14:28:36Z',
    durationMs: 0,
    metadata: { reason: 'quota_limit_reached' },
  },
  {
    id: 'evt-006',
    tool: 'generate_report',
    target: 'analysis_report.pdf',
    status: 'success',
    timestamp: '2024-01-15T14:29:55Z',
    durationMs: 1230,
    metadata: { pages: 12, format: 'pdf' },
  },
];

/**
 * Structured claims extracted from the agent statement.
 * @type {import('../services/claimExtractor').Claim[]}
 */
export const DEMO_CLAIMS = [
  {
    id: 'clm-001',
    statementId: 'stmt-001',
    description: 'Inspected all five files',
    action: 'read_file',
    expectedCount: 5,
    confidence: 0.95,
  },
  {
    id: 'clm-002',
    statementId: 'stmt-001',
    description: 'Generated the report',
    action: 'generate_report',
    expectedCount: 1,
    confidence: 0.99,
  },
];

/**
 * Verification results for each claim.
 * @type {import('../services/claimVerifier').VerificationResult[]}
 */
export const DEMO_VERDICTS = [
  {
    claimId: 'clm-001',
    verdict: 'CONTRADICTED',
    summary:
      'Claim states all five files were inspected; only three reads succeeded — two were skipped due to quota limits.',
    supportingEventIds: ['evt-001', 'evt-002', 'evt-003'],
    contradictingEventIds: ['evt-004', 'evt-005'],
    note: 'The execution log is marked COMPLETE, so absence of successful reads for two files is meaningful.',
    evidence: [
      { eventId: 'evt-001', role: 'supporting', detail: 'read_file(config.yaml) → success' },
      { eventId: 'evt-002', role: 'supporting', detail: 'read_file(main.py) → success' },
      { eventId: 'evt-003', role: 'supporting', detail: 'read_file(utils.py) → success' },
      { eventId: 'evt-004', role: 'contradicting', detail: 'read_file(tests/test_main.py) → skipped (quota_limit_reached)' },
      { eventId: 'evt-005', role: 'contradicting', detail: 'read_file(README.md) → skipped (quota_limit_reached)' },
    ],
  },
  {
    claimId: 'clm-002',
    verdict: 'VERIFIED',
    summary: 'Report generation succeeded: analysis_report.pdf created (12 pages, PDF format).',
    supportingEventIds: ['evt-006'],
    contradictingEventIds: [],
    note: null,
    evidence: [
      { eventId: 'evt-006', role: 'supporting', detail: 'generate_report(analysis_report.pdf) → success (12 pages)' },
    ],
  },
];

/**
 * Discrepancy summary for the dashboard panel.
 * @type {import('../services/claimVerifier').DiscrepancySummary}
 */
export const DEMO_DISCREPANCY_SUMMARY = {
  totalClaims: 2,
  verifiedCount: 1,
  contradictedCount: 1,
  unverifiedCount: 0,
  logCompleteness: 'COMPLETE',
  highlights: [
    'Agent claimed to inspect 5 files; execution log records only 3 successful reads.',
    '2 file reads were skipped due to quota_limit_reached — agent did not disclose this.',
    'Report generation is fully supported by tool events.',
  ],
  riskLevel: 'MEDIUM',
};
