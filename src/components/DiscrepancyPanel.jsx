/**
 * DiscrepancyPanel — highlights unsupported / contradicted claims
 * and overall risk level.
 */
export default function DiscrepancyPanel({ discrepancySummary }) {
  if (!discrepancySummary) return null;

  const { highlights, riskLevel, logCompleteness, contradictedCount, unverifiedCount } = discrepancySummary;

  if (contradictedCount === 0 && unverifiedCount === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <span className="text-2xl" aria-hidden="true">✓</span>
        <p className="text-emerald-800 font-medium text-sm">
          No discrepancies detected. All claims are supported by tool events.
        </p>
      </div>
    );
  }

  const riskConfig = {
    LOW:    { classes: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'LOW RISK' },
    MEDIUM: { classes: 'bg-amber-100 text-amber-800 border-amber-300',    label: 'MEDIUM RISK' },
    HIGH:   { classes: 'bg-red-100 text-red-800 border-red-300',          label: 'HIGH RISK' },
  };

  const risk = riskConfig[riskLevel] ?? riskConfig.MEDIUM;

  const completenessNote = {
    COMPLETE: null,
    PARTIAL: '⚠ Execution log is PARTIAL — absence of an event does not conclusively prove failure.',
    UNKNOWN: '⚠ Log completeness is UNKNOWN — treat missing events with caution.',
  }[logCompleteness];

  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-semibold text-red-900 flex items-center gap-2">
          <span aria-hidden="true">⚠</span> Discrepancies Detected
        </h3>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wide ${risk.classes}`}
          aria-label={`Risk level: ${risk.label}`}
        >
          {risk.label}
        </span>
      </div>

      {completenessNote && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {completenessNote}
        </p>
      )}

      <ul className="space-y-2" aria-label="Discrepancy highlights">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-red-800">
            <span className="mt-0.5 shrink-0" aria-hidden="true">•</span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
