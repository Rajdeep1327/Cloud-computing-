/**
 * Verdict badge — renders VERIFIED / CONTRADICTED / UNVERIFIED
 * with both color AND icon/label so it is never color-only.
 */
export default function VerdictBadge({ verdict, size = 'md' }) {
  const config = {
    VERIFIED:     { label: 'Verified',     icon: '✓', classes: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    CONTRADICTED: { label: 'Contradicted', icon: '✕', classes: 'bg-red-100 text-red-800 border-red-300' },
    UNVERIFIED:   { label: 'Unverified',   icon: '?', classes: 'bg-amber-100 text-amber-800 border-amber-300' },
  };

  const { label, icon, classes } = config[verdict] ?? {
    label: verdict, icon: '·', classes: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${classes} ${sizeClasses}`}
      aria-label={`Verdict: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
