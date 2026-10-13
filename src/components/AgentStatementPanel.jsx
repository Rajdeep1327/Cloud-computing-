/**
 * AgentStatementPanel — Midnight Intelligence Agent Statement Hero.
 * Prominently presents the AI agent's raw verbal statement,
 * metadata credentials (Agent ID, Timestamp, Statement ID),
 * and an audit banner highlighting the verification target.
 */
export default function AgentStatementPanel({ statement }) {
  if (!statement) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#101625] border border-[#222B40] p-6 shadow-lg">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#7667FF]/10 via-[#43D9F5]/5 to-transparent blur-2xl pointer-events-none" />

      {/* Meta header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#1C253B] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#162036] border border-[#293754] text-xs font-mono text-[#F1F5FF]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-[#98A5BD]">AGENT:</span>
            <span className="font-semibold text-[#43D9F5]">{statement.agentId}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#7667FF] bg-[#7667FF]/10 border border-[#7667FF]/25">
            {statement.id}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5BD]">
          <svg className="w-3.5 h-3.5 text-[#5E6C84]" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
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
      <div className="relative pl-5 border-l-2 border-[#7667FF] my-2 z-10">
        <div className="text-xs uppercase tracking-wider text-[#7667FF] font-semibold mb-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z" />
          </svg>
          Unverified Agent Assertion
        </div>
        <blockquote className="text-lg sm:text-xl font-medium text-[#F1F5FF] leading-relaxed tracking-normal font-sans">
          "{statement.text}"
        </blockquote>
      </div>

      {/* Footer context pill */}
      <div className="mt-4 pt-3 border-t border-[#1C253B] flex flex-wrap items-center justify-between text-xs text-[#98A5BD] gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43D9F5]" aria-hidden="true" />
          <span>Audit Target: Natural-language claim extraction mapped to execution telemetry</span>
        </div>
        <span className="text-[#5E6C84] font-mono text-[11px]">
          Status: Cross-Examination Active
        </span>
      </div>
    </div>
  );
}
