import { useState, useCallback } from 'react';
import { runDemo, runAnalysis, MODE, IS_LIVE_API } from '../services/api.js';

import CinematicHero       from '../components/CinematicHero.jsx';
import SubmitPanel         from '../components/SubmitPanel.jsx';
import AgentStatementPanel from '../components/AgentStatementPanel.jsx';
import SummaryCards       from '../components/SummaryCards.jsx';
import ClaimsTable        from '../components/ClaimsTable.jsx';
import ToolTimeline       from '../components/ToolTimeline.jsx';
import DiscrepancyPanel   from '../components/DiscrepancyPanel.jsx';
import LoadingSpinner     from '../components/LoadingSpinner.jsx';
import ErrorBanner        from '../components/ErrorBanner.jsx';

/** Light Cyberpunk Section wrapper */
function Section({ title, badge, children }) {
  return (
    <section className="cyber-card rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 transition-all duration-200">
      <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-2xs" aria-hidden="true" />
          <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
            {title}
          </h2>
        </div>
        {badge && (
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white text-cyan-800 border border-cyan-200 shadow-2xs font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6 sm:p-7">{children}</div>
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
      // Smoothly scroll down to results after running
      setTimeout(() => {
        const resultsEl = document.getElementById('audit-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setState({ status: 'error', data: null, error: err });
    }
  }, []);

  const handleCustomSubmit = useCallback(async (statementText, toolEvents, loggingComplete) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await runAnalysis({
        statement: {
          id: `stmt-${Date.now().toString(36)}`,
          text: statementText,
          timestamp: new Date().toISOString(),
          agentId: 'user-agent-custom',
        },
        toolEvents,
        loggingComplete,
      });
      setState({ status: 'done', data, error: null });
      setTimeout(() => {
        const resultsEl = document.getElementById('audit-results');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setState({ status: 'error', data: null, error: err });
    }
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { status, data, error } = state;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] bg-cyber-grid relative">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-cyan-500/20 select-none shrink-0"
              aria-hidden="true"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Promise<span className="text-cyan-600">Ledger</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                  LIGHT CYBERPUNK
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                AI Agent Accountability · Claim vs. Telemetry
              </p>
            </div>
          </div>

          {/* Action & Mode Controls */}
          <div className="flex items-center gap-3">
            {/* Mode badge */}
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wide transition-all ${
                MODE === 'LIVE'
                  ? 'bg-cyan-50 text-cyan-900 border-cyan-300 shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
              }`}
              aria-label={`Running in ${MODE} mode`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  MODE === 'LIVE' ? 'bg-cyan-500' : 'bg-amber-500'
                } animate-pulse`}
              />
              <span>{MODE === 'LIVE' ? 'Live API' : 'Mock Demo'}</span>
            </span>

            {/* Run Demo / Re-run button with Glitch Hover */}
            <button
              type="button"
              onClick={handleRunDemo}
              disabled={status === 'loading'}
              className="cyber-btn cyber-glitch-hover relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-md shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
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
                type="button"
                onClick={handleReset}
                title="Reset dashboard to hero"
                className="hidden sm:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Phase 3: Two-Frame Cinematic Hero */}
        <CinematicHero
          onRunDemo={handleRunDemo}
          isRunning={status === 'loading'}
        />

        {/* Custom Audit Run & Pipeline Launcher */}
        <SubmitPanel
          onSubmit={handleCustomSubmit}
          onRunDemo={handleRunDemo}
          isRunning={status === 'loading'}
          isLive={IS_LIVE_API}
        />

        {/* Loading State */}
        {status === 'loading' && (
          <LoadingSpinner message="Extracting structured claims and cross-examining against recorded tool telemetry events…" />
        )}

        {/* Error State */}
        {status === 'error' && (
          <ErrorBanner error={error} onRetry={handleRunDemo} />
        )}

        {/* Active Analysis Results Screen */}
        {status === 'done' && data && (
          <div id="audit-results" className="space-y-8 animate-tech-reveal scroll-mt-20">
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
      <footer className="border-t border-slate-200/90 bg-white/90 mt-20 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PromiseLedger</span>
            <span>·</span>
            <span>Light Cyberpunk AI Agent Observability Platform</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className={MODE === 'LIVE' ? 'text-cyan-700 font-bold' : 'text-amber-700 font-bold'}>
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
