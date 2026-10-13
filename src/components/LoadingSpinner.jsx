/**
 * LoadingSpinner — Light Cyberpunk Telemetry Audit Scanner.
 * Displays concentric rotating radar rings and real-time verification pipeline indicators.
 */
export default function LoadingSpinner({ message = 'Auditing AI agent claims against execution telemetry…' }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 gap-6 text-center animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {/* Concentric Light Cyberpunk Radar Scanner Rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-40" />
        {/* Middle rotating dashed ring */}
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-indigo-400/50 animate-spin" style={{ animationDuration: '6s' }} />
        {/* Inner fast ring */}
        <div className="absolute inset-3 rounded-full border-2 border-t-cyan-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
        {/* Center glowing core */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/40" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Cross-Examination In Progress
        </h3>
        <p className="text-xs text-slate-600 font-mono leading-relaxed">
          {message}
        </p>
      </div>

      {/* Verification Pipeline Phase Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-cyan-800 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Ingesting Statement
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-indigo-800 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Mapping Tool Events
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-pink-800 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
          Computing Verdicts
        </span>
      </div>
    </div>
  );
}
