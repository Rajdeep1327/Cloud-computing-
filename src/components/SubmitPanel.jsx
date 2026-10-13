/**
 * SubmitPanel — PromiseLedger
 * ─────────────────────────────────────────────────────────────────
 * Allows the user to submit a custom agent statement + JSON tool-event
 * log to the real backend, or run the built-in demo scenario.
 *
 * In LIVE mode (VITE_API_BASE_URL set):   submits to /verify endpoint.
 * In MOCK mode (no env vars):             runs the demo mock path.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';

const PLACEHOLDER_STATEMENT =
  'I inspected all five files and generated the report.';

const PLACEHOLDER_EVENTS = JSON.stringify(
  [
    {
      id: 'evt-001',
      tool: 'read_file',
      target: 'config.yaml',
      status: 'success',
      durationMs: 45,
      metadata: { bytes: 1024 },
    },
    {
      id: 'evt-002',
      tool: 'read_file',
      target: 'main.py',
      status: 'success',
      durationMs: 62,
      metadata: { bytes: 4200 },
    },
  ],
  null,
  2,
);

/**
 * @param {{
 *   onSubmit: (statement: string, toolEvents: object[], loggingComplete: boolean) => void,
 *   onRunDemo: () => void,
 *   isRunning: boolean,
 *   isLive: boolean,
 * }} props
 */
export default function SubmitPanel({ onSubmit, onRunDemo, isRunning, isLive }) {
  const [statement, setStatement] = useState('');
  const [eventsJson, setEventsJson] = useState('');
  const [loggingComplete, setLoggingComplete] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [expanded, setExpanded] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonError('');

    if (!statement.trim()) return;

    let toolEvents = [];
    if (eventsJson.trim()) {
      try {
        const parsed = JSON.parse(eventsJson.trim());
        toolEvents = Array.isArray(parsed) ? parsed : [parsed];
      } catch (err) {
        setJsonError(`Invalid JSON: ${err.message}`);
        return;
      }
    }

    onSubmit(statement.trim(), toolEvents, loggingComplete);
  }

  return (
    <div className="cyber-card rounded-3xl overflow-hidden shadow-sm border border-slate-200/90">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-2xs" aria-hidden="true" />
          <h2 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
            Submit Audit Run
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Live / Mock badge */}
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${
              isLive
                ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {isLive ? '● Live API' : '● Mock Demo'}
          </span>
          {/* Expand / collapse toggle */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-mono text-slate-500 hover:text-slate-900 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? '▲ Collapse' : '▼ Expand Custom Input'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7 space-y-5">
        {/* Quick Demo button — always visible */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRunDemo}
            disabled={isRunning}
            className="cyber-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            aria-busy={isRunning}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Auditing…</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
                <span>Run Demo Scenario</span>
              </>
            )}
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {isLive
              ? 'Runs demo data through the real backend pipeline'
              : 'Runs pre-built mock scenario (no backend required)'}
          </span>
        </div>

        {/* Custom input (collapsible) */}
        {expanded && (
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-5">
            {/* Agent Statement */}
            <div className="space-y-1.5">
              <label
                htmlFor="agent-statement"
                className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wide"
              >
                Agent Statement
                <span className="ml-1 text-pink-500">*</span>
              </label>
              <textarea
                id="agent-statement"
                rows={3}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder={PLACEHOLDER_STATEMENT}
                required
                disabled={isRunning}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-mono resize-y shadow-2xs focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-60 transition"
              />
              <p className="text-[11px] text-slate-400">
                The natural-language summary the AI agent reported.
              </p>
            </div>

            {/* Tool Events JSON */}
            <div className="space-y-1.5">
              <label
                htmlFor="tool-events"
                className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wide"
              >
                Tool Events
                <span className="ml-1 text-slate-400">(JSON array)</span>
              </label>
              <textarea
                id="tool-events"
                rows={8}
                value={eventsJson}
                onChange={(e) => { setEventsJson(e.target.value); setJsonError(''); }}
                placeholder={PLACEHOLDER_EVENTS}
                disabled={isRunning}
                className={`w-full rounded-xl border px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 font-mono resize-y shadow-2xs focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-60 transition ${
                  jsonError ? 'border-pink-400 bg-pink-50/40' : 'border-slate-200 bg-white/80'
                }`}
              />
              {jsonError && (
                <p className="text-[11px] text-pink-600 font-mono">{jsonError}</p>
              )}
              <p className="text-[11px] text-slate-400">
                Each event needs: <code className="bg-slate-100 px-1 rounded">id</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">tool</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">target</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">status</code>{' '}
                (<code className="bg-slate-100 px-1 rounded">success</code> |{' '}
                <code className="bg-slate-100 px-1 rounded">failed</code> |{' '}
                <code className="bg-slate-100 px-1 rounded">skipped</code>).
                Leave blank to submit with no events.
              </p>
            </div>

            {/* Logging complete toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={loggingComplete}
                  onChange={(e) => setLoggingComplete(e.target.checked)}
                  disabled={isRunning}
                />
                <div className="w-10 h-5 rounded-full bg-slate-200 peer-checked:bg-cyan-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                  Mark log as COMPLETE
                </span>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                  When ON, missing expected actions are CONTRADICTED not UNVERIFIED.
                </p>
              </div>
            </label>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isRunning || !statement.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.98] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-busy={isRunning}
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Auditing…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span>Audit This Statement</span>
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                Sends to {isLive ? 'live backend' : 'mock service'}
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
