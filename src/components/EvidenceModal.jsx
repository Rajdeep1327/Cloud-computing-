import { useEffect, useRef } from 'react';

/**
 * EvidenceModal — dialog showing supporting & contradicting events
 * for a single claim.  Accessible: traps focus, Escape to close.
 */
export default function EvidenceModal({ claim, result, toolEvents, onClose }) {
  const dialogRef = useRef(null);

  // Escape key closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Focus trap on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!claim || !result) return null;

  // Build event lookup
  const eventMap = Object.fromEntries((toolEvents ?? []).map(e => [e.id, e]));

  const statusIcon = { success: '✓', failure: '✕', skipped: '⊘' };
  const statusClasses = {
    success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    failure: 'text-red-700 bg-red-50 border-red-200',
    skipped: 'text-amber-700 bg-amber-50 border-amber-200',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="evidence-modal-title" className="text-base font-semibold text-slate-800">
              Evidence — {claim.description}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{result.summary}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-slate-700 text-xl leading-none focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
            aria-label="Close evidence panel"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
          {result.evidence.map((ev) => {
            const toolEvent = eventMap[ev.eventId];
            const evStatus = toolEvent?.status ?? 'unknown';
            const statusCls = statusClasses[evStatus] ?? 'text-slate-600 bg-slate-50 border-slate-200';

            return (
              <div
                key={ev.eventId}
                className={`border rounded-lg p-3 ${statusCls}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold" aria-hidden="true">
                    {statusIcon[evStatus] ?? '·'}
                  </span>
                  <span className="font-medium text-sm">{ev.detail}</span>
                  <span
                    className={`ml-auto text-xs font-semibold uppercase px-2 py-0.5 rounded-full border ${
                      ev.role === 'supporting'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {ev.role}
                  </span>
                </div>
                {toolEvent && (
                  <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span>Event ID: <code>{ev.eventId}</code></span>
                    <span>Time: {new Date(toolEvent.timestamp).toLocaleTimeString()}</span>
                    {toolEvent.durationMs > 0 && (
                      <span>Duration: {toolEvent.durationMs} ms</span>
                    )}
                    {toolEvent.metadata && Object.entries(toolEvent.metadata).map(([k, v]) => (
                      <span key={k}>{k}: <strong>{String(v)}</strong></span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {result.note && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <span className="font-semibold">⚠ Note:</span> {result.note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
