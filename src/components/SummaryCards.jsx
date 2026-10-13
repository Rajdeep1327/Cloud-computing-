/**
 * SummaryCards — three metric tiles: VERIFIED, CONTRADICTED, UNVERIFIED
 */
export default function SummaryCards({ discrepancySummary }) {
  if (!discrepancySummary) return null;

  const { verifiedCount, contradictedCount, unverifiedCount, totalClaims } = discrepancySummary;

  const cards = [
    {
      label: 'Verified',
      icon: '✓',
      count: verifiedCount,
      of: totalClaims,
      border: 'border-l-emerald-500',
      countColor: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Contradicted',
      icon: '✕',
      count: contradictedCount,
      of: totalClaims,
      border: 'border-l-red-500',
      countColor: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      label: 'Unverified',
      icon: '?',
      count: unverifiedCount,
      of: totalClaims,
      border: 'border-l-amber-500',
      countColor: 'text-amber-700',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map(({ label, icon, count, of: total, border, countColor, bg }) => (
        <div
          key={label}
          className={`${bg} border border-slate-200 border-l-4 ${border} rounded-xl p-5 flex items-center gap-4 shadow-sm`}
          role="region"
          aria-label={`${label} claims: ${count} of ${total}`}
        >
          <span className={`text-3xl font-bold ${countColor}`} aria-hidden="true">
            {icon}
          </span>
          <div>
            <div className={`text-3xl font-bold ${countColor}`}>{count}</div>
            <div className="text-sm text-slate-500 mt-0.5">
              {label} <span className="text-slate-400">/ {total} claims</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
