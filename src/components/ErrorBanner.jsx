/**
 * ErrorBanner — Light Cyberpunk Audit Failure Banner.
 * Presents runtime or network exceptions in a clean technical alert card with retry actions.
 */
export default function ErrorBanner({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="cyber-card relative overflow-hidden rounded-2xl border border-pink-300 p-6 shadow-md flex items-start gap-4 animate-tech-reveal"
    >
      <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-800 shrink-0">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h4 className="text-sm font-bold text-pink-900">
            Telemetry Audit Exception
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-100 text-pink-800 border border-pink-200 font-bold">
            ERROR 500
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed mb-2 font-mono break-all">
          {error?.message ?? String(error)}
        </p>
        <p className="text-[11px] text-slate-500">
          Verify backend connectivity or switch to local mock mode.
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cyber-btn shrink-0 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-900 text-xs font-bold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          ↻ Retry Audit
        </button>
      )}
    </div>
  );
}
