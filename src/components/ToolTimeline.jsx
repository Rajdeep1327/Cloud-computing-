/**
 * ToolTimeline — vertical timeline of all recorded tool events.
 */
export default function ToolTimeline({ toolEvents }) {
  if (!toolEvents?.length) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No tool events recorded.
      </div>
    );
  }

  const statusConfig = {
    success: { icon: '✓', label: 'Success', dot: 'bg-emerald-500', row: 'border-emerald-200 bg-emerald-50' },
    failure: { icon: '✕', label: 'Failure', dot: 'bg-red-500',     row: 'border-red-200 bg-red-50' },
    skipped: { icon: '⊘', label: 'Skipped', dot: 'bg-amber-400',   row: 'border-amber-200 bg-amber-50' },
  };

  return (
    <ol className="relative ml-3" aria-label="Tool execution timeline">
      {toolEvents.map((evt, idx) => {
        const cfg = statusConfig[evt.status] ?? {
          icon: '·', label: evt.status, dot: 'bg-slate-400', row: 'border-slate-200 bg-slate-50',
        };

        return (
          <li key={evt.id} className="flex gap-4 mb-0 last:mb-0">
            {/* Connector line + dot */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ring-2 ring-white ${cfg.dot}`} aria-hidden="true" />
              {idx < toolEvents.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 mt-1" aria-hidden="true" />
              )}
            </div>

            {/* Event card */}
            <div className={`border rounded-lg px-4 py-3 mb-3 flex-1 ${cfg.row}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span aria-hidden="true" className="font-bold">{cfg.icon}</span>
                <code className="text-xs bg-white/70 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                  {evt.tool}
                </code>
                <span className="text-sm font-medium text-slate-700">{evt.target}</span>
                <span className="ml-auto text-xs text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  Status:{' '}
                  <strong className="capitalize" aria-label={`Status: ${cfg.label}`}>
                    {cfg.icon} {cfg.label}
                  </strong>
                </span>
                {evt.durationMs > 0 && <span>Duration: {evt.durationMs} ms</span>}
                {evt.metadata && Object.entries(evt.metadata).map(([k, v]) => (
                  <span key={k}>{k}: <strong>{String(v)}</strong></span>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
