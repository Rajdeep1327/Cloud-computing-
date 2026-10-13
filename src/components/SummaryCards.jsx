/**
 * SummaryCards — Light Cyberpunk Telemetry Metrics.
 *
 * Visual design:
 * - Layered translucent white surfaces (cyber-card)
 * - Restrained cyan (VERIFIED), magenta (CONTRADICTED), and amber (UNVERIFIED) accents
 * - Deep navy typography with high contrast
 * - Precision ratio progress bars with subtle cyber glow on hover
 */
export default function SummaryCards({ discrepancySummary }) {
  if (!discrepancySummary) return null;

  const { verifiedCount, contradictedCount, unverifiedCount, totalClaims } = discrepancySummary;

  const calculatePct = (count) => {
    if (!totalClaims || totalClaims === 0) return 0;
    return Math.round((count / totalClaims) * 100);
  };

  const cards = [
    {
      type: 'VERIFIED',
      label: 'Verified Claims',
      statusNote: 'Evidence fully confirmed',
      count: verifiedCount,
      pct: calculatePct(verifiedCount),
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-50/70',
      borderColor: 'border-cyan-200 hover:border-cyan-400',
      barColor: 'bg-gradient-to-r from-cyan-500 to-teal-500',
      glowHover: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
      iconContainer: 'bg-cyan-100 text-cyan-800 border border-cyan-300',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      type: 'CONTRADICTED',
      label: 'Contradicted Claims',
      statusNote: 'Direct telemetry conflict',
      count: contradictedCount,
      pct: calculatePct(contradictedCount),
      textColor: 'text-pink-700',
      bgColor: 'bg-pink-50/70',
      borderColor: 'border-pink-200 hover:border-pink-400',
      barColor: 'bg-gradient-to-r from-pink-500 to-rose-500',
      glowHover: 'hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)]',
      iconContainer: 'bg-pink-100 text-pink-800 border border-pink-300',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      type: 'UNVERIFIED',
      label: 'Unverified Claims',
      statusNote: 'Insufficient event log',
      count: unverifiedCount,
      pct: calculatePct(unverifiedCount),
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-200 hover:border-amber-400',
      barColor: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      glowHover: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]',
      iconContainer: 'bg-amber-100 text-amber-800 border border-amber-300',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75 1.5 1.5 0 1 0-1.06-2.56ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" role="region" aria-label="Claims Verification Summary">
      {cards.map((card) => (
        <div
          key={card.type}
          className={`cyber-card relative overflow-hidden rounded-2xl p-6 ${card.borderColor} ${card.glowHover} flex flex-col justify-between`}
        >
          {/* Subtle Cyber Corner Bracket */}
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
            <div className={`absolute transform rotate-45 ${card.bgColor} w-8 h-8 -top-4 -right-4 border-b border-l ${card.borderColor}`} />
          </div>

          {/* Card Top: Label & Icon */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500">
                {card.label}
              </span>
              <div className="text-xs text-slate-400 mt-0.5">
                {card.statusNote}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${card.iconContainer}`}>
              {card.icon}
            </div>
          </div>

          {/* Card Middle: Count & Ratio */}
          <div className="mt-5 mb-3 relative z-10 flex items-baseline justify-between">
            <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${card.textColor}`}>
              {card.count}
            </div>
            <div className="text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-700">{card.count}</span> / {totalClaims} assertions
            </div>
          </div>

          {/* Card Bottom: Progress Bar */}
          <div className="relative z-10 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono text-slate-500">
              <span>Ledger Ratio</span>
              <span className={`font-bold ${card.textColor}`}>{card.pct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${card.barColor}`}
                style={{ width: `${card.pct}%` }}
                role="progressbar"
                aria-valuenow={card.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${card.label} percentage: ${card.pct}%`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
