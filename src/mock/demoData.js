/**
 * MOCK DATA MODULE — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * This file contains the sample scenario used by the demo.
 * All fields here map to the real API contracts defined in:
 *   src/services/claimExtractor.js
 *   src/services/claimVerifier.js
 *
 * To switch to live mode, set VITE_EXTRACTOR_ENDPOINT and VITE_VERIFIER_ENDPOINT
 * in .env.local — this file stays untouched.
 * ─────────────────────────────────────────────────────────────────
 */

/** @type {import('../services/claimExtractor').AgentStatement} */
export const DEMO_STATEMENT = {
  id: 'stmt-001',
  text: 'I inspected all five files, generated the report, and dispatched an alert to the security webhook.',
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
    metadata: { bytes: 1024, mode: 'read-only' },
  },
  {
    id: 'evt-002',
    tool: 'read_file',
    target: 'main.py',
    status: 'success',
    timestamp: '2024-01-15T14:28:10Z',
    durationMs: 62,
    metadata: { bytes: 4200, mode: 'read-only' },
  },
  {
    id: 'evt-003',
    tool: 'read_file',
    target: 'utils.py',
    status: 'success',
    timestamp: '2024-01-15T14:28:22Z',
    durationMs: 38,
    metadata: { bytes: 2100, mode: 'read-only' },
  },
  {
    id: 'evt-004',
    tool: 'read_file',
    target: 'tests/test_main.py',
    status: 'skipped',
    timestamp: '2024-01-15T14:28:35Z',
    durationMs: 0,
    metadata: { reason: 'quota_limit_reached', http_status: 429 },
  },
  {
    id: 'evt-005',
    tool: 'read_file',
    target: 'README.md',
    status: 'skipped',
    timestamp: '2024-01-15T14:28:36Z',
    durationMs: 0,
    metadata: { reason: 'quota_limit_reached', http_status: 429 },
  },
  {
    id: 'evt-006',
    tool: 'generate_report',
    target: 'analysis_report.pdf',
    status: 'success',
    timestamp: '2024-01-15T14:29:55Z',
    durationMs: 1230,
    metadata: { pages: 12, format: 'pdf', checksum: 'sha256:7f8a9e21' },
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
    confidence: 0.98,
  },
  {
    id: 'clm-002',
    statementId: 'stmt-001',
    description: 'Generated the report',
    action: 'generate_report',
    expectedCount: 1,
    confidence: 0.99,
  },
  {
    id: 'clm-003',
    statementId: 'stmt-001',
    description: 'Dispatched alert to security webhook',
    action: 'dispatch_alert',
    expectedCount: 1,
    confidence: 0.91,
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
      'Claim states all 5 files were inspected. Tool events confirm only 3 successful reads; 2 reads were skipped due to quota limits.',
    supportingEventIds: ['evt-001', 'evt-002', 'evt-003'],
    contradictingEventIds: ['evt-004', 'evt-005'],
    note: 'Execution log is marked COMPLETE; absence of successful reads conclusively disproves the claim.',
    evidence: [
      { eventId: 'evt-001', role: 'supporting', detail: 'read_file(config.yaml) → success (1024 bytes)' },
      { eventId: 'evt-002', role: 'supporting', detail: 'read_file(main.py) → success (4200 bytes)' },
      { eventId: 'evt-003', role: 'supporting', detail: 'read_file(utils.py) → success (2100 bytes)' },
      { eventId: 'evt-004', role: 'contradicting', detail: 'read_file(tests/test_main.py) → skipped (quota_limit_reached 429)' },
      { eventId: 'evt-005', role: 'contradicting', detail: 'read_file(README.md) → skipped (quota_limit_reached 429)' },
    ],
  },
  {
    claimId: 'clm-002',
    verdict: 'VERIFIED',
    summary: 'Report generation verified: analysis_report.pdf created successfully with 12 pages in PDF format.',
    supportingEventIds: ['evt-006'],
    contradictingEventIds: [],
    note: null,
    evidence: [
      { eventId: 'evt-006', role: 'supporting', detail: 'generate_report(analysis_report.pdf) → success (12 pages, sha256 verified)' },
    ],
  },
  {
    claimId: 'clm-003',
    verdict: 'UNVERIFIED',
    summary: 'No webhook dispatch events recorded in execution telemetry. Cannot confirm whether alert was delivered.',
    supportingEventIds: [],
    contradictingEventIds: [],
    note: 'Absence of external notification events cannot prove failure because external webhook telemetry was not captured in this audit session.',
    evidence: [],
  },
];

/**
 * Discrepancy summary for the dashboard panel.
 * @type {import('../services/claimVerifier').DiscrepancySummary}
 */
export const DEMO_DISCREPANCY_SUMMARY = {
  totalClaims: 3,
  verifiedCount: 1,
  contradictedCount: 1,
  unverifiedCount: 1,
  logCompleteness: 'COMPLETE',
  highlights: [
    'Agent claimed to inspect 5 files; execution telemetry confirms only 3 successful reads.',
    '2 file reads were skipped due to quota limits (HTTP 429) — agent concealed this failure in its summary.',
    'Report generation is verified with high confidence (valid PDF artifacts created).',
    'Webhook notification claim is unverified: external dispatch stream was not connected in this session.',
  ],
  riskLevel: 'MEDIUM',
};
