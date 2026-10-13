/**
 * DiscrepancyPanel — Midnight Intelligence Discrepancy & Risk Assessment.
 * Highlights contradictions and unsupported claims with cybersecurity-grade
 * severity meters, log-completeness verification, and granular findings.
 */
export default function DiscrepancyPanel({ discrepancySummary }) {
  if (!discrepancySummary) return null;

  const { highlights, riskLevel, logCompleteness, contradictedCount, unverifiedCount } = discrepancySummary;

  if (contradictedCount === 0 && unverifiedCount === 0) {
    return (
      <div className="flex items-center gap-3.5 p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-emerald-300">Zero Discrepancies Detected</h4>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            Every verbal claim matches verified kernel execution events. Telemetry audit passed.
          </p>
        </div>
      </div>
    );
  }

  const riskConfig = {
    LOW: {
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
      dotClass: 'bg-emerald-400',
      label: 'LOW RISK',
    },
    MEDIUM: {
      badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
      dotClass: 'bg-amber-400',
      label: 'MEDIUM RISK',
    },
    HIGH: {
      badgeClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
      dotClass: 'bg-rose-400',
      label: 'HIGH RISK',
    },
  };

  const risk = riskConfig[riskLevel] ?? riskConfig.MEDIUM;

  const completenessNote = {
    COMPLETE: 'Log completeness: COMPLETE — absence of tool events for claimed targets conclusively indicates non-execution.',
    PARTIAL: 'Log completeness: PARTIAL — missing events cannot alone prove failure without external log synchronization.',
    UNKNOWN: 'Log completeness: UNKNOWN — treat absent event telemetry with caution.',
  }[logCompleteness];

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#101625] border border-rose-500/30 p-6 shadow-xl">
      {/* Decorative ambient alert glow */}
      <div className="absolute top-0 right-0 w-72 h-32 bg-gradient-to-l from-rose-500/10 to-transparent blur-2xl pointer-events-none" />

      {/* Header with Risk Level and Completeness Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#241C2B] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F1F5FF] tracking-wide">
              Discrepancy Analysis & Accountability Report
            </h3>
            <p className="text-xs text-[#98A5BD] mt-0.5">
              Identified {contradictedCount} contradiction{contradictedCount === 1 ? '' : 's'} and {unverifiedCount} unverified assertion{unverifiedCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Risk Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border uppercase ${risk.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${risk.dotClass} animate-pulse`} />
            {risk.label}
          </span>
        </div>
      </div>

      {/* Log Completeness Principle Callout */}
      {completenessNote && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-[#141B2D] border border-[#222E4A] text-xs font-mono text-[#43D9F5] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#43D9F5] shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-5-2a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25 3a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0V9Z" clipRule="evenodd" />
          </svg>
          <span>{completenessNote}</span>
        </div>
      )}

      {/* Highlights List */}
      <ul className="space-y-2.5 relative z-10" aria-label="Detailed Discrepancies">
        {highlights.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-[#161726] border border-[#2A2336] text-xs leading-relaxed text-[#F1F5FF]"
          >
            <span className="w-5 h-5 rounded-md bg-rose-950/70 border border-rose-500/40 text-rose-300 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span className="text-[#D3DDEE]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
