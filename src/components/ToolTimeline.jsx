import { useState, useMemo } from 'react';

/**
 * ToolTimeline — Light Cyberpunk Execution Telemetry Timeline.
 * Chronologically tracks recorded tool events with luminous node connectors,
 * interactive event selection, latency chips, and metadata badges.
 */
export default function ToolTimeline({ toolEvents }) {
  const [filter, setFilter] = useState('ALL');
  const [selectedEventId, setSelectedEventId] = useState(null);

  const filteredEvents = useMemo(() => {
    if (!toolEvents) return [];
    if (filter === 'ALL') return toolEvents;
    return toolEvents.filter((e) => e.status === filter);
  }, [toolEvents, filter]);

  if (!toolEvents?.length) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
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
        <svg className="w-3.5 h-3.5 text-cyan-800" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      ),
      dotBg: 'bg-cyan-500 border-2 border-white shadow-xs',
      badgeClass: 'text-cyan-900 bg-cyan-50 border-cyan-300',
    },
    failure: {
      label: 'Failure',
      icon: (
        <svg className="w-3.5 h-3.5 text-pink-800" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
        </svg>
      ),
      dotBg: 'bg-pink-500 border-2 border-white shadow-xs',
      badgeClass: 'text-pink-900 bg-pink-50 border-pink-300',
    },
    skipped: {
      label: 'Skipped',
      icon: (
        <svg className="w-3.5 h-3.5 text-amber-800" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
        </svg>
      ),
      dotBg: 'bg-amber-500 border-2 border-white shadow-xs',
      badgeClass: 'text-amber-900 bg-amber-50 border-amber-300',
    },
  };

  return (
    <div className="space-y-5">
      {/* Event Filter & Counter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs"
          role="tablist"
          aria-label="Filter timeline events"
        >
          {[
            { id: 'ALL', label: 'All Telemetry', count: counts.ALL },
            { id: 'success', label: 'Success', count: counts.success, cls: 'text-cyan-800' },
            { id: 'skipped', label: 'Skipped', count: counts.skipped, cls: 'text-amber-800' },
            ...(counts.failure > 0 ? [{ id: 'failure', label: 'Failed', count: counts.failure, cls: 'text-pink-800' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filter === item.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{item.label}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${item.cls ? item.cls : 'text-indigo-700'} bg-slate-100 font-semibold`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span>Execution Stream: COMPLETE AUDIT LOG</span>
        </div>
      </div>

      {/* Chronological Vertical Timeline with Interactive Event Highlighting */}
      <ol className="relative pl-6 space-y-4" aria-label="Chronological tool execution stream">
        {filteredEvents.map((evt, idx) => {
          const cfg = statusConfig[evt.status] ?? statusConfig.success;
          const isLast = idx === filteredEvents.length - 1;
          const isSelected = selectedEventId === evt.id;

          return (
            <li key={evt.id} className="relative group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-6 bottom-[-18px] w-[2px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Status node dot */}
              <div
                className={`absolute -left-6 top-4 w-4 h-4 rounded-full ${cfg.dotBg} transition-transform group-hover:scale-125 duration-200 z-10`}
                aria-hidden="true"
              />

              {/* Event Card (Clickable to select and inspect details) */}
              <div
                onClick={() => setSelectedEventId(isSelected ? null : evt.id)}
                className={`rounded-2xl border transition-all duration-200 p-4.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-50/60 border-cyan-400 shadow-md ring-2 ring-cyan-200'
                    : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-xs'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEventId(isSelected ? null : evt.id);
                  }
                }}
                aria-pressed={isSelected}
              >
                {/* Event Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tool Badge */}
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-indigo-700 border border-slate-200 flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-indigo-600" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM13 5h-3a1 1 0 0 1-1-1V1L13 5Z" clipRule="evenodd" />
                      </svg>
                      {evt.tool}
                    </span>

                    {/* Target Resource */}
                    <span className="text-sm font-bold text-slate-900 font-mono group-hover:text-cyan-800 transition-colors">
                      {evt.target}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase font-bold border ${cfg.badgeClass}`}>
                      {cfg.icon}
                      <span>{cfg.label}</span>
                    </span>

                    {/* Timestamp */}
                    <time dateTime={evt.timestamp} className="text-xs font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </time>
                  </div>
                </div>

                {/* Metadata & Telemetry Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 text-xs font-mono text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                    ID: <strong className="text-slate-800">{evt.id}</strong>
                  </span>
                  {evt.durationMs !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                      LATENCY: <strong className="text-slate-800">{evt.durationMs}ms</strong>
                    </span>
                  )}

                  {evt.metadata &&
                    Object.entries(evt.metadata).map(([key, val]) => {
                      const isSkippedReason = key === 'reason';
                      const isHttpError = key === 'http_status';

                      return (
                        <span
                          key={key}
                          className={`px-2 py-0.5 rounded border ${
                            isSkippedReason || isHttpError
                              ? 'bg-pink-50 text-pink-900 border-pink-300 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-slate-400">{key}:</span>{' '}
                          <strong className="font-semibold">{String(val)}</strong>
                        </span>
                      );
                    })}

                  {isSelected && (
                    <span className="ml-auto text-[11px] text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded">
                      Selected for Audit Detail
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
