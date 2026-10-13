import { useState, useCallback } from 'react';
import { runDemo, MODE } from '../services/api.js';

import AgentStatementPanel from '../components/AgentStatementPanel.jsx';
import SummaryCards       from '../components/SummaryCards.jsx';
import ClaimsTable        from '../components/ClaimsTable.jsx';
import ToolTimeline       from '../components/ToolTimeline.jsx';
import DiscrepancyPanel   from '../components/DiscrepancyPanel.jsx';
import LoadingSpinner     from '../components/LoadingSpinner.jsx';
import ErrorBanner        from '../components/ErrorBanner.jsx';

/** Section wrapper */
function Section({ title, children }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
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

  const { status, data, error } = state;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div
              className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg select-none"
              aria-hidden="true"
            >
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">PromiseLedger</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">
                AI agent accountability · claim vs. evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode badge */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wide ${
                MODE === 'LIVE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
              aria-label={`Running in ${MODE} mode`}
            >
              {MODE === 'LIVE' ? '● Live' : '◎ Mock'} Mode
            </span>

            {/* Run Demo button */}
            <button
              onClick={handleRunDemo}
              disabled={status === 'loading'}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
              aria-busy={status === 'loading'}
            >
              {status === 'loading' ? 'Running…' : '▶ Run Demo'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Loading */}
        {status === 'loading' && (
          <LoadingSpinner message="Extracting claims and verifying against tool events…" />
        )}

        {/* Error */}
        {status === 'error' && (
          <ErrorBanner error={error} onRetry={handleRunDemo} />
        )}

        {/* Idle / empty state */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-5xl" aria-hidden="true">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">No analysis yet</h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Press <strong>Run Demo</strong> to analyze the sample scenario — no API key needed.
              </p>
            </div>
            <button
              onClick={handleRunDemo}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-colors"
            >
              ▶ Run Demo
            </button>
          </div>
        )}

        {/* Results */}
        {status === 'done' && data && (
          <>
            {/* Agent statement */}
            <Section title="Agent Statement">
              <AgentStatementPanel statement={data.statement} />
            </Section>

            {/* Summary cards */}
            <Section title="Claim Summary">
              <SummaryCards discrepancySummary={data.discrepancySummary} />
            </Section>

            {/* Discrepancy panel */}
            <Section title="Discrepancy Analysis">
              <DiscrepancyPanel discrepancySummary={data.discrepancySummary} />
            </Section>

            {/* Claims table */}
            <Section title="Claims & Verdicts">
              <ClaimsTable
                claims={data.claims}
                results={data.results}
                toolEvents={data.toolEvents}
              />
            </Section>

            {/* Tool timeline */}
            <Section title="Tool Execution Timeline">
              <ToolTimeline toolEvents={data.toolEvents} />
            </Section>
          </>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white mt-12 py-5 text-center text-xs text-slate-400">
        PromiseLedger · Hackathon Prototype ·{' '}
        <span className={MODE === 'LIVE' ? 'text-emerald-600' : 'text-amber-600'}>
          {MODE} mode
        </span>
        {' '}· No real backend connected in mock mode.
      </footer>
    </div>
  );
}
