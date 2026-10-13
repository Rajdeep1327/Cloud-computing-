import { useEffect, useRef } from 'react';
import VerdictBadge from './VerdictBadge.jsx';

/**
 * EvidenceModal — Midnight Intelligence Evidence Inspector Drawer/Modal.
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
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
      </svg>
    ),
    failure: (
      <svg className="w-4 h-4 text-rose-400" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
      </svg>
    ),
    skipped: (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 0 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B14]/85 backdrop-blur-md animate-fade-in"
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
        className="bg-[#101625] border border-[#222B40] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col outline-none overflow-hidden glow-indigo"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#1D263B] bg-[#0D121F]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7667FF] font-semibold">
                Telemetry Evidence Audit
              </span>
              <VerdictBadge verdict={result.verdict} size="sm" />
            </div>
            <h2 id="evidence-modal-title" className="text-base sm:text-lg font-bold text-[#F1F5FF]">
              {claim.description}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#98A5BD] hover:text-[#F1F5FF] hover:bg-[#1A2338] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7667FF]"
            aria-label="Close evidence inspector"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Audit Finding Summary */}
        <div className="px-6 py-3.5 bg-[#141C30] border-b border-[#1E283F] text-xs text-[#98A5BD]">
          <span className="text-[#43D9F5] font-semibold font-mono">FINDING:</span>{' '}
          <span className="text-[#F1F5FF]">{result.summary}</span>
        </div>

        {/* Evidence Body Scroll Area */}
        <div className="overflow-y-auto px-6 py-5 space-y-3.5 flex-1">
          {result.evidence?.length === 0 ? (
            <div className="text-center py-8 text-[#98A5BD] text-xs font-mono">
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
                  className={`rounded-xl p-4 border transition-all ${
                    isSupporting
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {/* Evidence Role & Detail */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0">{statusIcons[evStatus] ?? null}</span>
                      <span className="text-sm font-semibold text-[#F1F5FF]">
                        {ev.detail}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isSupporting
                          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-900/40 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {ev.role}
                    </span>
                  </div>

                  {/* Telemetry Event Metadata */}
                  {toolEvent && (
                    <div className="mt-3 pt-2.5 border-t border-[#222E47] flex flex-wrap gap-2 text-xs font-mono text-[#98A5BD]">
                      <span className="px-2 py-0.5 rounded bg-[#0D121F] border border-[#222B40]">
                        EVENT: <strong className="text-[#43D9F5]">{ev.eventId}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0D121F] border border-[#222B40]">
                        TOOL: <strong className="text-[#F1F5FF]">{toolEvent.tool}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#0D121F] border border-[#222B40]">
                        TARGET: <strong className="text-[#F1F5FF]">{toolEvent.target}</strong>
                      </span>
                      {toolEvent.durationMs > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#0D121F] border border-[#222B40]">
                          LATENCY: <strong className="text-[#F1F5FF]">{toolEvent.durationMs}ms</strong>
                        </span>
                      )}
                      {toolEvent.metadata &&
                        Object.entries(toolEvent.metadata).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-[#0D121F] border border-[#222B40]">
                            {k}: <strong className="text-[#F1F5FF]">{String(v)}</strong>
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
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5">
              <span className="text-amber-400 font-bold shrink-0">⚠</span>
              <div>
                <span className="font-semibold text-amber-300">Auditor Notice:</span>{' '}
                {result.note}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1D263B] bg-[#0D121F] flex items-center justify-between">
          <span className="text-xs font-mono text-[#5E6C84]">
            Action Claim: {claim.action} ({claim.expectedCount} total)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1D263B] hover:bg-[#25324D] text-[#F1F5FF] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#7667FF]"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
