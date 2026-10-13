/**
 * VerdictBadge — Light Cyberpunk Status Badge.
 *
 * Verdict color mapping:
 * - VERIFIED: Cyan / Teal (#00C2D6 / #0891B2)
 * - CONTRADICTED: Magenta / Rose (#EC4899 / #E11D48)
 * - UNVERIFIED: Amber (#D97706 / #B45309)
 *
 * Always pairs color with distinct SVG icons, high-contrast text,
 * and technical monospace borders. Never relies on color alone.
 */
export default function VerdictBadge({ verdict, size = 'md' }) {
  const config = {
    VERIFIED: {
      label: 'VERIFIED',
      icon: (
        <svg className="w-3.5 h-3.5 text-cyan-700 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ),
      containerClass: 'bg-cyan-50/90 text-cyan-900 border-cyan-300 shadow-xs hover:border-cyan-400',
      dotClass: 'bg-cyan-500',
    },
    CONTRADICTED: {
      label: 'CONTRADICTED',
      icon: (
        <svg className="w-3.5 h-3.5 text-pink-700 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      ),
      containerClass: 'bg-pink-50/90 text-pink-900 border-pink-300 shadow-xs hover:border-pink-400',
      dotClass: 'bg-pink-500',
    },
    UNVERIFIED: {
      label: 'UNVERIFIED',
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 6.5a1.5 1.5 0 1 1 2.5 1.118l-.5.5A1 1 0 0 0 8 9.5v.25a.75.75 0 0 0 1.5 0V9.5a2.5 2.5 0 0 1 1.25-2.165 3 3 0 1 0-4.25-2.585.75.75 0 0 0 1.5 0c0 .414.336.75.75.75ZM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      ),
      containerClass: 'bg-amber-50/90 text-amber-900 border-amber-300 shadow-xs hover:border-amber-400',
      dotClass: 'bg-amber-500',
    },
  };

  const current = config[verdict] ?? {
    label: verdict || 'UNKNOWN',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />,
    containerClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm'
    ? 'text-[11px] px-2 py-0.5 gap-1.5 font-semibold'
    : 'text-xs px-2.5 py-1 gap-1.5 font-bold';

  return (
    <span
      className={`inline-flex items-center tracking-wider uppercase rounded-full border transition-all duration-200 ${current.containerClass} ${sizeClasses}`}
      aria-label={`Verdict: ${current.label}`}
    >
      <span aria-hidden="true">{current.icon}</span>
      <span>{current.label}</span>
    </span>
  );
}
