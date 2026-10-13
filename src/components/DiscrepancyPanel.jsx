/**
 * DiscrepancyPanel — Light Cyberpunk Discrepancy & Risk Assessment.
 * Highlights telemetry contradictions, undisclosed quota skips, and
 * log-completeness guarantees with high-contrast cybersecurity formatting.
 */
export default function DiscrepancyPanel({ discrepancySummary }) {
  if (!discrepancySummary) return null;

  const { highlights, riskLevel, logCompleteness, contradictedCount, unverifiedCount } = discrepancySummary;

  if (contradictedCount === 0 && unverifiedCount === 0) {
    return (
      <div className="flex items-center gap-3.5 p-5 bg-cyan-50/80 border border-cyan-300 rounded-2xl shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-800 shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-cyan-900">Zero Discrepancies Detected</h4>
          <p className="text-xs text-cyan-800/80 mt-0.5">
            Every verbal assertion matches verified execution telemetry. The agent's claims are fully substantiated.
          </p>
        </div>
      </div>
    );
  }

  const riskConfig = {
    LOW: {
      badgeClass: 'bg-cyan-50 text-cyan-900 border-cyan-300',
      dotClass: 'bg-cyan-500',
      label: 'LOW RISK',
    },
    MEDIUM: {
      badgeClass: 'bg-pink-50 text-pink-900 border-pink-300',
      dotClass: 'bg-pink-500',
      label: 'MEDIUM RISK',
    },
    HIGH: {
      badgeClass: 'bg-rose-50 text-rose-900 border-rose-300',
      dotClass: 'bg-rose-500',
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
    <div className="cyber-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-pink-300/80 shadow-md">
      {/* Header with Risk Level and Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-800 shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Discrepancy Analysis & Risk Assessment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified {contradictedCount} contradiction{contradictedCount === 1 ? '' : 's'} and {unverifiedCount} unverified assertion{unverifiedCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Risk Level Pill */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border uppercase shadow-2xs ${risk.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${risk.dotClass} animate-pulse`} />
            {risk.label}
          </span>
        </div>
      </div>

      {/* Log Completeness Principle Callout */}
      {completenessNote && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs font-mono text-cyan-900 flex items-center gap-2.5">
          <svg className="w-4 h-4 text-cyan-700 shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-5-2a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25 3a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0V9Z" clipRule="evenodd" />
          </svg>
          <span>{completenessNote}</span>
        </div>
      )}

      {/* Highlight Bullet Items */}
      <ul className="space-y-3 relative z-10" aria-label="Detailed Discrepancy Findings">
        {highlights.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/90 text-xs leading-relaxed text-slate-800"
          >
            <span className="w-5 h-5 rounded-md bg-pink-100 border border-pink-300 text-pink-800 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span className="font-medium text-slate-800">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
