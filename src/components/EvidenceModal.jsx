import { useEffect, useRef } from 'react';
import VerdictBadge from './VerdictBadge.jsx';

/**
 * EvidenceModal — Light Cyberpunk Evidence Inspector Drawer/Modal.
 * Displays granular supporting and contradicting tool events for a specific claim.
 * Full keyboard accessibility: ESC to close, focus trap on mount.
 */
export default function EvidenceModal({ claim, result, toolEvents, onClose }) {
  const dialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap focus on mount
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!claim || !result) return null;

  // Build event lookup: eventId -> event object
  const eventMap = Object.fromEntries((toolEvents ?? []).map((e) => [e.id, e]));

  const statusIcons = {
    success: (
      <svg className="w-4 h-4 text-cyan-800" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
      </svg>
    ),
    failure: (
      <svg className="w-4 h-4 text-pink-800" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
      </svg>
    ),
    skipped: (
      <svg className="w-4 h-4 text-amber-800" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col outline-none overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-7 py-5 border-b border-slate-100 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-bold">
                TELEMETRY EVIDENCE AUDIT
              </span>
              <VerdictBadge verdict={result.verdict} size="sm" />
            </div>
            <h2 id="evidence-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
              {claim.description}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Close evidence inspector"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Audit Finding Summary Callout */}
        <div className="px-6 sm:px-7 py-3 bg-cyan-50/60 border-b border-cyan-100 text-xs text-slate-700">
          <span className="text-cyan-800 font-bold font-mono">FINDING:</span>{' '}
          <span className="font-medium text-slate-800">{result.summary}</span>
        </div>

        {/* Evidence Items Scroll Area */}
        <div className="overflow-y-auto px-6 sm:px-7 py-5 space-y-3.5 flex-1">
          {result.evidence?.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-mono">
              No direct telemetry events recorded for this claim.
            </div>
          ) : (
            result.evidence.map((ev) => {
              const toolEvent = eventMap[ev.eventId];
              const isSupporting = ev.role === 'supporting';
              const evStatus = toolEvent?.status ?? 'unknown';

              return (
                <div
                  key={ev.eventId}
                  className={`rounded-2xl p-4.5 border transition-all ${
                    isSupporting
                      ? 'bg-cyan-50/50 border-cyan-200 text-cyan-950'
                      : 'bg-pink-50/50 border-pink-200 text-pink-950'
                  }`}
                >
                  {/* Evidence Role & Detail */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">{statusIcons[evStatus] ?? null}</span>
                      <span className="text-sm font-bold text-slate-900">
                        {ev.detail}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isSupporting
                          ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                          : 'bg-pink-100 text-pink-900 border-pink-300'
                      }`}
                    >
                      {ev.role}
                    </span>
                  </div>

                  {/* Telemetry Event Metadata Chips */}
                  {toolEvent && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-2 text-xs font-mono text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                        EVENT: <strong className="text-cyan-800">{ev.eventId}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                        TOOL: <strong className="text-slate-800">{toolEvent.tool}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                        TARGET: <strong className="text-slate-800">{toolEvent.target}</strong>
                      </span>
                      {toolEvent.durationMs > 0 && (
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                          LATENCY: <strong className="text-slate-800">{toolEvent.durationMs}ms</strong>
                        </span>
                      )}
                      {toolEvent.metadata &&
                        Object.entries(toolEvent.metadata).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                            {k}: <strong className="text-slate-800">{String(v)}</strong>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Special Verification Note */}
          {result.note && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <span className="text-amber-600 font-bold shrink-0">⚠</span>
              <div>
                <span className="font-bold text-amber-800">Auditor Notice:</span>{' '}
                {result.note}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-7 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500">
            Action: {claim.action} ({claim.expectedCount} total)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
