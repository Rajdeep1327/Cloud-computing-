/**
 * ErrorBanner — displays runtime errors with retry option.
 */
export default function ErrorBanner({ error, onRetry }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-xl"
    >
      <span className="text-2xl shrink-0" aria-hidden="true">⚠</span>
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 mb-1">Something went wrong</h3>
        <p className="text-sm text-red-700 font-mono break-all">
          {error?.message ?? String(error)}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
