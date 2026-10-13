import { useState, useMemo } from 'react';

/**
 * ToolTimeline — Midnight Intelligence Execution Telemetry Timeline.
 * Chronologically tracks recorded tool events with glowing node connectors,
 * tool signature badges, target resources, and deep metadata telemetry chips.
 */
export default function ToolTimeline({ toolEvents }) {
  const [filter, setFilter] = useState('ALL');

  const filteredEvents = useMemo(() => {
    if (!toolEvents) return [];
    if (filter === 'ALL') return toolEvents;
    return toolEvents.filter((e) => e.status === filter);
  }, [toolEvents, filter]);

  if (!toolEvents?.length) {
    return (
      <div className="text-center py-10 text-[#98A5BD] text-sm bg-[#101625] rounded-xl border border-[#222B40]">
        No execution telemetry events recorded.
      </div>
    );
  }

  const counts = {
    ALL: toolEvents.length,
    success: toolEvents.filter((e) => e.status === 'success').length,
    skipped: toolEvents.filter((e) => e.status === 'skipped').length,
    failure: toolEvents.filter((e) => e.status === 'failure').length,
  };

  const statusConfig = {
    success: {
      label: 'Success',
      icon: (
        <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ),
      dotBg: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]',
      lineColor: 'border-emerald-500/30',
      badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
    },
    failure: {
      label: 'Failure',
      icon: (
        <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      ),
      dotBg: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]',
      lineColor: 'border-rose-500/30',
      badgeClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
    },
    skipped: {
      label: 'Skipped',
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
        </svg>
      ),
      dotBg: 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]',
      lineColor: 'border-amber-500/30',
      badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    },
  };

  return (
    <div className="space-y-4">
      {/* Event Filter & Counter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#1D263B]">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0D121F] border border-[#222B40]" role="tablist" aria-label="Filter timeline events">
          {[
            { id: 'ALL', label: 'All Telemetry', count: counts.ALL },
            { id: 'success', label: 'Success', count: counts.success, cls: 'text-emerald-400' },
            { id: 'skipped', label: 'Skipped', count: counts.skipped, cls: 'text-amber-400' },
            ...(counts.failure > 0 ? [{ id: 'failure', label: 'Failed', count: counts.failure, cls: 'text-rose-400' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filter === item.id
                  ? 'bg-[#18233A] text-[#F1F5FF] border border-[#2B3A5A] font-semibold'
                  : 'text-[#98A5BD] hover:text-[#F1F5FF]'
              }`}
            >
              <span>{item.label}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${item.cls ? item.cls : 'text-[#7667FF]'} bg-[#0E1524]`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#5E6C84]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Execution Log: COMPLETE AUDIT TRAIL</span>
        </div>
      </div>

      {/* Chronological Vertical Timeline */}
      <ol className="relative pl-6 space-y-4" aria-label="Chronological tool execution stream">
        {filteredEvents.map((evt, idx) => {
          const cfg = statusConfig[evt.status] ?? statusConfig.success;
          const isLast = idx === filteredEvents.length - 1;

          return (
            <li key={evt.id} className="relative group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-6 bottom-[-20px] w-[2px] bg-gradient-to-b from-[#222B40] via-[#222B40] to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Status node dot */}
              <div
                className={`absolute -left-6 top-4 w-4 h-4 rounded-full border-2 border-[#080B14] flex items-center justify-center ${cfg.dotBg} transition-transform group-hover:scale-125 duration-200 z-10`}
                aria-hidden="true"
              />

              {/* Event Card */}
              <div className="rounded-xl bg-[#101625] border border-[#222B40] group-hover:border-[#2D3A57] p-4 transition-all duration-200 shadow-md">
                {/* Event Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tool Badge */}
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#141C30] text-[#43D9F5] border border-[#233352] flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-[#7667FF]" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM13 5h-3a1 1 0 0 1-1-1V1L13 5Z" clipRule="evenodd" />
                      </svg>
                      {evt.tool}
                    </span>

                    {/* Target Resource */}
                    <span className="text-sm font-semibold text-[#F1F5FF] font-mono group-hover:text-[#43D9F5] transition-colors">
                      {evt.target}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-semibold border ${cfg.badgeClass}`}>
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </span>

                    {/* Timestamp */}
                    <time dateTime={evt.timestamp} className="text-xs font-mono text-[#98A5BD]">
                      {new Date(evt.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </time>
                  </div>
                </div>

                {/* Metadata & telemetry details */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1C253B] text-xs font-mono text-[#98A5BD]">
                  <span className="text-[#5E6C84]">ID: <span className="text-[#98A5BD]">{evt.id}</span></span>
                  {evt.durationMs !== undefined && (
                    <span className="text-[#5E6C84]">
                      LATENCY: <span className="text-[#F1F5FF]">{evt.durationMs}ms</span>
                    </span>
                  )}

                  {evt.metadata && Object.entries(evt.metadata).map(([key, val]) => {
                    const isSkippedReason = key === 'reason';
                    const isHttpError = key === 'http_status';

                    return (
                      <span
                        key={key}
                        className={`px-2 py-0.5 rounded text-[11px] border ${
                          isSkippedReason || isHttpError
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                            : 'bg-[#0D121F] text-[#98A5BD] border-[#222B40]'
                        }`}
                      >
                        <span className="text-[#5E6C84]">{key}:</span>{' '}
                        <strong className="font-semibold">{String(val)}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
