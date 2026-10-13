/**
 * VerdictBadge — Premium Midnight Intelligence status badge.
 * Renders VERIFIED / CONTRADICTED / UNVERIFIED with both distinct SVG icons,
 * high-contrast typography, and luminescent dark theme styling.
 * Never relies on color alone.
 */
export default function VerdictBadge({ verdict, size = 'md' }) {
  const config = {
    VERIFIED: {
      label: 'VERIFIED',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ),
      containerClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      dotClass: 'bg-emerald-400',
    },
    CONTRADICTED: {
      label: 'CONTRADICTED',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      ),
      containerClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      dotClass: 'bg-rose-400',
    },
    UNVERIFIED: {
      label: 'UNVERIFIED',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 6.5a1.5 1.5 0 1 1 2.5 1.118l-.5.5A1 1 0 0 0 8 9.5v.25a.75.75 0 0 0 1.5 0V9.5a2.5 2.5 0 0 1 1.25-2.165 3 3 0 1 0-4.25-2.585.75.75 0 0 0 1.5 0c0 .414.336.75.75.75ZM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      ),
      containerClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      dotClass: 'bg-amber-400',
    },
  };

  const current = config[verdict] ?? {
    label: verdict || 'UNKNOWN',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
    containerClass: 'bg-[#101625] text-slate-300 border-[#222B40]',
    dotClass: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1.5 font-medium'
    : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span
      className={`inline-flex items-center tracking-wider uppercase rounded-full border backdrop-blur-sm transition-all duration-200 ${current.containerClass} ${sizeClasses}`}
      aria-label={`Verdict: ${current.label}`}
    >
      <span className="shrink-0" aria-hidden="true">
        {current.icon}
      </span>
      <span>{current.label}</span>
    </span>
  );
}
