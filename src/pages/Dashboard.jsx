import { useState, useCallback } from 'react';
import { runDemo, MODE } from '../services/api.js';

import AgentStatementPanel from '../components/AgentStatementPanel.jsx';
import SummaryCards       from '../components/SummaryCards.jsx';
import ClaimsTable        from '../components/ClaimsTable.jsx';
import ToolTimeline       from '../components/ToolTimeline.jsx';
import DiscrepancyPanel   from '../components/DiscrepancyPanel.jsx';
import LoadingSpinner     from '../components/LoadingSpinner.jsx';
import ErrorBanner        from '../components/ErrorBanner.jsx';

/** Sleek dark section wrapper with cyberpunk/Linear style header */
function Section({ title, badge, children }) {
  return (
    <section className="rounded-2xl bg-[#101625] border border-[#222B40] overflow-hidden shadow-xl transition-all duration-200 hover:border-[#2D3A56]">
      <div className="px-6 py-4 border-b border-[#1D263B] bg-[#0D121F] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#7667FF]" aria-hidden="true" />
          <h2 className="text-xs font-mono font-bold text-[#F1F5FF] uppercase tracking-wider">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#162036] text-[#43D9F5] border border-[#233352]">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [state, setState] = useState({
    status: 'idle', // 'idle' | 'loading' | 'done' | 'error'
    data: null,
    error: null,
  });

  const handleRunDemo = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await runDemo();
      setState({ status: 'done', data, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err });
    }
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  const { status, data, error } = state;

  return (
    <div className="min-h-screen bg-[#080B14] text-[#F1F5FF] selection:bg-[#7667FF]/30 selection:text-white bg-grid-pattern relative">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#080B14]/85 backdrop-blur-md border-b border-[#222B40]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7667FF] to-[#43D9F5] flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(118,103,255,0.4)] select-none shrink-0"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#F1F5FF]">
                  Promise<span className="text-[#43D9F5]">Ledger</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#162036] text-[#7667FF] border border-[#2B3A5A]">
                  v1.0 BETA
                </span>
              </div>
              <p className="text-xs text-[#98A5BD] leading-none mt-0.5">
                AI Agent Accountability · Claim vs. Telemetry
              </p>
            </div>
          </div>

          {/* Action & Mode Controls */}
          <div className="flex items-center gap-3">
            {/* Mode badge */}
            <span
              className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wide transition-all ${
                MODE === 'LIVE'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}
              aria-label={`Running in ${MODE} mode`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  MODE === 'LIVE' ? 'bg-emerald-400' : 'bg-amber-400'
                } animate-pulse`}
              />
              <span>{MODE === 'LIVE' ? 'Live API' : 'Mock Demo'}</span>
            </span>

            {/* Run Demo / Re-run button */}
            <button
              onClick={handleRunDemo}
              disabled={status === 'loading'}
              className="relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7667FF] to-[#5848EE] hover:from-[#8577FF] hover:to-[#6757FF] border border-[#8577FF]/40 shadow-[0_0_20px_rgba(118,103,255,0.35)] hover:shadow-[0_0_25px_rgba(118,103,255,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7667FF] focus:ring-offset-2 focus:ring-offset-[#080B14]"
              aria-busy={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Auditing Telemetry…</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                  </svg>
                  <span>{status === 'done' ? 'Re-run Demo' : 'Run Demo'}</span>
                </>
              )}
            </button>

            {status === 'done' && (
              <button
                onClick={handleReset}
                title="Reset dashboard"
                className="hidden sm:inline-flex p-2 rounded-lg text-[#98A5BD] hover:text-[#F1F5FF] hover:bg-[#151D30] border border-[#222B40] transition-colors"
                aria-label="Reset audit view"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Loading State */}
        {status === 'loading' && (
          <LoadingSpinner message="Extracting structured claims and cross-examining against recorded tool telemetry events…" />
        )}

        {/* Error State */}
        {status === 'error' && (
          <ErrorBanner error={error} onRetry={handleRunDemo} />
        )}

        {/* Empty / Idle State: High-Impact Hero Presentation */}
        {status === 'idle' && (
          <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center animate-fade-in">
            {/* Subtle Hero Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101625] border border-[#222B40] text-xs font-mono text-[#43D9F5] mb-6 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#7667FF] animate-pulse" />
              <span>Autonomous AI Telemetry Cross-Examiner</span>
            </div>

            {/* Core Value Proposition Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F1F5FF] tracking-tight max-w-4xl leading-[1.15]">
              Catch the gap between what an AI says and what it{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#43D9F5] via-[#7667FF] to-[#A093FF]">
                actually does.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#98A5BD] max-w-2xl leading-relaxed">
              PromiseLedger maps verbal assertions into verifiable claims, cross-references raw tool execution events, and reveals silent omissions, skipped actions, and fabricated successes.
            </p>

            {/* Big Action Call */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleRunDemo}
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#7667FF] via-[#6555FF] to-[#43D9F5] hover:opacity-95 shadow-[0_0_30px_rgba(118,103,255,0.45)] hover:shadow-[0_0_40px_rgba(67,217,245,0.5)] active:scale-[0.98] transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
                <span>Run Interactive Sample Audit</span>
              </button>
            </div>

            <p className="mt-3 text-xs text-[#5E6C84] font-mono">
              Zero configuration · No API key required for demo mode
            </p>

            {/* 3 Step Accountability Explanation Grid */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full text-left">
              <div className="p-5 rounded-xl bg-[#101625] border border-[#222B40] hover:border-[#2F3C59] transition-all shadow-lg">
                <div className="w-9 h-9 rounded-lg bg-[#162036] text-[#43D9F5] border border-[#293A5C] flex items-center justify-center font-mono font-bold text-sm mb-3.5">
                  01
                </div>
                <h3 className="text-sm font-bold text-[#F1F5FF] mb-1.5">
                  1. Claim Extraction
                </h3>
                <p className="text-xs text-[#98A5BD] leading-relaxed">
                  Extracts specific verbal commitments, target file paths, and claimed execution counts from agent output.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#101625] border border-[#222B40] hover:border-[#2F3C59] transition-all shadow-lg">
                <div className="w-9 h-9 rounded-lg bg-[#162036] text-[#7667FF] border border-[#293A5C] flex items-center justify-center font-mono font-bold text-sm mb-3.5">
                  02
                </div>
                <h3 className="text-sm font-bold text-[#F1F5FF] mb-1.5">
                  2. Telemetry Ingestion
                </h3>
                <p className="text-xs text-[#98A5BD] leading-relaxed">
                  Ingests timestamped tool calls, execution statuses, latencies, and kernel-level skip/failure logs.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#101625] border border-[#222B40] hover:border-[#2F3C59] transition-all shadow-lg">
                <div className="w-9 h-9 rounded-lg bg-[#162036] text-emerald-400 border border-[#293A5C] flex items-center justify-center font-mono font-bold text-sm mb-3.5">
                  03
                </div>
                <h3 className="text-sm font-bold text-[#F1F5FF] mb-1.5">
                  3. Deterministic Ledger
                </h3>
                <p className="text-xs text-[#98A5BD] leading-relaxed">
                  Flags contradictions, verifies truthfulness, and computes risk scores based on complete audit logs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Analysis Results Screen */}
        {status === 'done' && data && (
          <div className="space-y-7 animate-fade-in">
            {/* 1. Agent Statement Panel */}
            <Section title="Audited Agent Statement" badge={`ID: ${data.statement?.id}`}>
              <AgentStatementPanel statement={data.statement} />
            </Section>

            {/* 2. Verification Metric Cards */}
            <Section title="Accountability Metrics" badge={`${data.discrepancySummary?.totalClaims} CLAIMS TOTAL`}>
              <SummaryCards discrepancySummary={data.discrepancySummary} />
            </Section>

            {/* 3. Discrepancy & Risk Panel */}
            <Section title="Discrepancy Analysis & Risk Assessment" badge={`RISK: ${data.discrepancySummary?.riskLevel}`}>
              <DiscrepancyPanel discrepancySummary={data.discrepancySummary} />
            </Section>

            {/* 4. Claims Investigation Ledger */}
            <Section title="Claims Investigation Ledger" badge={`${data.claims?.length} ASSERTIONS`}>
              <ClaimsTable
                claims={data.claims}
                results={data.results}
                toolEvents={data.toolEvents}
              />
            </Section>

            {/* 5. Tool Execution Telemetry Timeline */}
            <Section title="Recorded Tool Execution Telemetry" badge={`${data.toolEvents?.length} EVENTS RECORDED`}>
              <ToolTimeline toolEvents={data.toolEvents} />
            </Section>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1D263B] bg-[#090D17] mt-16 py-6 text-center text-xs text-[#5E6C84]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#98A5BD]">PromiseLedger</span>
            <span>·</span>
            <span>AI Agent Observability & Accountability Platform</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className={MODE === 'LIVE' ? 'text-emerald-400' : 'text-amber-400'}>
              ● {MODE} MODE ACTIVE
            </span>
            <span>·</span>
            <span>ZERO-TRUST TELEMETRY AUDIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
