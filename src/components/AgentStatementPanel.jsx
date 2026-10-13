/**
 * AgentStatementPanel — Light Cyberpunk Audited Agent Statement.
 * Displays the verbal claim under examination with technical metadata tags,
 * agent identifier, and precision light-mode typography.
 */
export default function AgentStatementPanel({ statement }) {
  if (!statement) return null;

  return (
    <div className="cyber-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-cyan-500/25 shadow-md">
      {/* Subtle top-right cyber tech label */}
      <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-50 border-b border-l border-cyan-200/80 text-[10px] font-mono text-cyan-800 font-semibold tracking-wider uppercase rounded-bl-xl">
        RAW INGESTION BUFFER
      </div>

      {/* Meta header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" aria-hidden="true" />
            <span className="text-slate-500">AGENT ID:</span>
            <span className="font-bold text-cyan-700">{statement.agentId}</span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200">
            {statement.id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0v4.25c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5V3.75Z" clipRule="evenodd" />
          </svg>
          <time dateTime={statement.timestamp}>
            {new Date(statement.timestamp).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'medium',
            })}
          </time>
        </div>
      </div>

      {/* Agent Statement Blockquote */}
      <div className="relative pl-5 sm:pl-6 border-l-3 border-cyan-500 my-2 z-10">
        <div className="text-[11px] uppercase tracking-wider text-cyan-700 font-mono font-bold mb-1.5 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
          </svg>
          VERBAL COMMITMENT UNDER AUDIT
        </div>
        <blockquote className="text-xl sm:text-2xl font-bold text-[#0F172A] leading-relaxed tracking-tight font-sans">
          "{statement.text}"
        </blockquote>
      </div>

      {/* Footer Audit Context */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-mono">Audit Objective: Cross-examine claimed file operations & tool executions</span>
        </div>
        <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
          Target: Complete Telemetry Log
        </span>
      </div>
    </div>
  );
}
