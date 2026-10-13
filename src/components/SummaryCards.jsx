/**
 * SummaryCards — Midnight Intelligence Metric Cards.
 * Displays VERIFIED, CONTRADICTED, and UNVERIFIED claims with
 * cybernetic dark panels, gradient accents, distinct SVG icons,
 * and high-contrast telemetry indicators.
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
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
      barColor: 'bg-emerald-400',
      glowClass: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      iconContainer: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30',
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
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-950/20',
      borderColor: 'border-rose-500/30 hover:border-rose-400/60',
      barColor: 'bg-rose-400',
      glowClass: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      iconContainer: 'bg-rose-900/30 text-rose-400 border border-rose-500/30',
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
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/20',
      borderColor: 'border-amber-500/30 hover:border-amber-400/60',
      barColor: 'bg-amber-400',
      glowClass: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      iconContainer: 'bg-amber-900/30 text-amber-400 border border-amber-500/30',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3 3 0 1 1 2.871 5.026v.345a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75 1.5 1.5 0 1 0-1.06-2.56ZM10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="region" aria-label="Claims Verification Summary">
      {cards.map((card) => (
        <div
          key={card.type}
          className={`relative overflow-hidden rounded-xl bg-[#101625] border border-[#222B40] ${card.borderColor} p-5 transition-all duration-300 ${card.glowClass} flex flex-col justify-between`}
        >
          {/* Subtle background glow pill */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${card.bgColor} blur-xl pointer-events-none`} />

          {/* Card Top: Label & Icon */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[#98A5BD]">
                {card.label}
              </span>
              <div className="text-[11px] text-[#5E6C84] mt-0.5">
                {card.statusNote}
              </div>
            </div>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.iconContainer}`}>
              {card.icon}
            </div>
          </div>

          {/* Card Middle: Count & Ratio */}
          <div className="mt-4 mb-3 relative z-10 flex items-baseline justify-between">
            <div className={`text-4xl font-extrabold font-mono tracking-tight ${card.textColor}`}>
              {card.count}
            </div>
            <div className="text-xs font-mono text-[#98A5BD]">
              {card.count} <span className="text-[#5E6C84]">/ {totalClaims} total</span>
            </div>
          </div>

          {/* Card Bottom: Progress Bar Indicator */}
          <div className="relative z-10 pt-2 border-t border-[#1C2438]">
            <div className="flex justify-between items-center text-[11px] mb-1.5 font-mono text-[#98A5BD]">
              <span>Coverage Ratio</span>
              <span className={card.textColor}>{card.pct}%</span>
            </div>
            <div className="w-full bg-[#172033] h-1.5 rounded-full overflow-hidden">
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
