/**
 * LoadingSpinner — Midnight Intelligence Telemetry Audit Scanner.
 * Displays high-tech radar animation with step-by-step audit phases.
 */
export default function LoadingSpinner({ message = 'Auditing AI agent claims against execution telemetry…' }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 gap-6 text-center animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {/* Concentric Radar Scanner Rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Outer pulsating ring */}
        <div className="absolute inset-0 rounded-full border border-[#7667FF]/30 animate-ping opacity-30" />
        {/* Middle rotating ring */}
        <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#43D9F5]/40 animate-spin" style={{ animationDuration: '6s' }} />
        {/* Inner fast ring */}
        <div className="absolute inset-3 rounded-full border-2 border-t-[#7667FF] border-r-[#43D9F5] border-b-transparent border-l-transparent animate-spin" />
        {/* Center glowing core */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7667FF] to-[#43D9F5] shadow-[0_0_15px_rgba(118,103,255,0.8)]" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-base font-semibold text-[#F1F5FF] tracking-wide">
          Cross-Examination In Progress
        </h3>
        <p className="text-xs text-[#98A5BD] font-mono leading-relaxed">
          {message}
        </p>
      </div>

      {/* Simulated high-tech verification pipeline indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-[#5E6C84]">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101625] border border-[#222B40] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ingesting Statement
        </span>
        <span className="text-[#222B40]">→</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101625] border border-[#222B40] text-[#43D9F5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#43D9F5] animate-pulse" />
          Mapping Tool Events
        </span>
        <span className="text-[#222B40]">→</span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101625] border border-[#222B40] text-[#7667FF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7667FF] animate-pulse" />
          Computing Verdicts
        </span>
      </div>
    </div>
  );
}
