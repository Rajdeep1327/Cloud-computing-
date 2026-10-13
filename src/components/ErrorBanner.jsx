/**
 * ErrorBanner — Midnight Intelligence Audit Failure Banner.
 * Presents runtime or network exceptions in a clean cybersecurity alert box
 * with retry actions.
 */
export default function ErrorBanner({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="relative overflow-hidden rounded-xl bg-[#101625] border border-rose-500/40 p-5 shadow-xl flex items-start gap-4 animate-fade-in"
    >
      <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-rose-300">
            Telemetry Audit Error
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-500/30">
            SYSTEM EXCEPTION
          </span>
        </div>
        <p className="text-xs text-[#98A5BD] leading-relaxed mb-2 font-mono break-all">
          {error?.message ?? String(error)}
        </p>
        <p className="text-[11px] text-[#5E6C84]">
          Verify telemetry endpoint availability or check if mock fallback is configured.
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          ↻ Retry Audit
        </button>
      )}
    </div>
  );
}
