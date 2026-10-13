import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * CinematicHero — Two-Frame Light Cyberpunk Cinematic Transition.
 *
 * Transitions between:
 *   Frame 1 (Dormant State):    /images/cyberpunk-start.png
 *   Frame 2 (Activated State):  /images/cyberpunk-end.png
 *
 * Features:
 * - Scroll-driven crossfade with subtle zoom (1.00 -> 1.05) & restrained parallax
 * - Translucent icy gradient overlay ensuring deep navy text contrast
 * - Manual state toggle / scrubber for judges who want instant comparison
 * - Strict adherence to prefers-reduced-motion
 * - Image load / error graceful fallback handling
 * - Normal document-flow with sticky visual container (zero scroll trapping)
 */
export default function CinematicHero({ onRunDemo, isRunning }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [manualOverride, setManualOverride] = useState(null); // null | 'start' | 'end'
  const [reducedMotion, setReducedMotion] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({ start: false, end: false });
  const [imagesError, setImagesError] = useState({ start: false, end: false });

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Scroll listener computing scroll progress through the container
  const handleScroll = useCallback(() => {
    if (reducedMotion || manualOverride !== null) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollable = rect.height - windowHeight;

    if (totalScrollable <= 0) {
      setScrollProgress(0);
      return;
    }

    // How far the top of container has scrolled above the top of viewport
    const scrolled = -rect.top;
    const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
    setScrollProgress(progress);
  }, [reducedMotion, manualOverride]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Determine active transition progress (0 = start/dormant, 1 = end/activated)
  const effectiveProgress = manualOverride !== null
    ? (manualOverride === 'end' ? 1 : 0)
    : scrollProgress;

  const startOpacity = 1 - effectiveProgress;
  const endOpacity = effectiveProgress;
  const zoomScale = reducedMotion ? 1 : 1 + effectiveProgress * 0.05;
  const translateY = reducedMotion ? 0 : effectiveProgress * -12;

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[140vh] mb-12"
      aria-label="PromiseLedger Cinematic Hero Section"
    >
      {/* ── Sticky Visual Viewport ─────────────────────────────────── */}
      <div className="sticky top-16 w-full h-[calc(100vh-4rem)] min-h-[580px] max-h-[820px] overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl bg-slate-100 flex flex-col justify-between">
        
        {/* Layer 1: Frame 1 (Dormant State Image) */}
        {!imagesError.start && (
          <img
            src="/images/cyberpunk-start.png"
            alt="PromiseLedger initial dormant state illustration"
            loading="eager"
            onLoad={() => setImagesLoaded((prev) => ({ ...prev, start: true }))}
            onError={() => setImagesError((prev) => ({ ...prev, start: true }))}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300"
            style={{
              opacity: startOpacity,
              transform: `scale(${zoomScale}) translateY(${translateY}px)`,
              transition: reducedMotion ? 'opacity 0.4s ease' : 'opacity 0.15s ease-out, transform 0.15s ease-out',
            }}
          />
        )}

        {/* Layer 2: Frame 2 (Activated State Image) */}
        {!imagesError.end && (
          <img
            src="/images/cyberpunk-end.png"
            alt="PromiseLedger activated verification state illustration"
            loading="eager"
            onLoad={() => setImagesLoaded((prev) => ({ ...prev, end: true }))}
            onError={() => setImagesError((prev) => ({ ...prev, end: true }))}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-opacity duration-300"
            style={{
              opacity: endOpacity,
              transform: `scale(${zoomScale}) translateY(${translateY}px)`,
              transition: reducedMotion ? 'opacity 0.4s ease' : 'opacity 0.15s ease-out, transform 0.15s ease-out',
            }}
          />
        )}

        {/* Layer 3: Graceful Fallback if images fail */}
        {(imagesError.start || imagesError.end) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA]/40 via-white to-[#F5F3FF]/40 bg-cyber-grid pointer-events-none" />
        )}

        {/* Layer 4: Translucent Icy Light Cyberpunk Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/90 via-[#F8FAFC]/78 to-[#F8FAFC]/95 backdrop-blur-[1.5px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Layer 5: Hero Content & Interactive Telemetry HUD */}
        <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-10 lg:p-14">
          
          {/* Top Bar: Telemetry Mode & Cinematic State Scrubber */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-cyan-500/30 text-xs font-mono text-cyan-700 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold">CINEMATIC AUDIT HUD</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">
                {effectiveProgress > 0.5 ? 'STATE: ACTIVATED' : 'STATE: DORMANT'}
              </span>
            </div>

            {/* Interactive Frame Scrubber / Toggle */}
            <div
              className="inline-flex items-center p-1 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm text-xs font-mono"
              role="group"
              aria-label="Cinematic state switch"
            >
              <button
                type="button"
                onClick={() => setManualOverride('start')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  effectiveProgress < 0.5
                    ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-400/40 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-pressed={effectiveProgress < 0.5}
              >
                01 Dormant
              </button>
              <button
                type="button"
                onClick={() => setManualOverride('end')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  effectiveProgress >= 0.5
                    ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-400/40 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-pressed={effectiveProgress >= 0.5}
              >
                02 Activated
              </button>
              {manualOverride !== null && (
                <button
                  type="button"
                  onClick={() => setManualOverride(null)}
                  className="px-2 py-1 text-[10px] text-slate-400 hover:text-cyan-600 transition-colors"
                  title="Return to scroll sync"
                >
                  ↻ Auto
                </button>
              )}
            </div>
          </div>

          {/* Center: Main Product Value Proposition */}
          <div className="max-w-3xl my-auto py-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-xs font-mono text-cyan-800 font-semibold mb-4">
              <svg className="w-3.5 h-3.5 text-cyan-600" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              <span>DETERMINISTIC AI AGENT ACCOUNTABILITY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.12]">
              Catch the gap between what an AI says and what it{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600">
                actually does.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-700 max-w-2xl font-normal leading-relaxed">
              PromiseLedger cross-examines natural language claims against deterministic tool events, exposing silent omissions, hidden rate limits, and unfulfilled commitments.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onRunDemo}
                disabled={isRunning}
                className="cyber-btn cyber-glitch-hover inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-pink-600 hover:opacity-95 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                aria-busy={isRunning}
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                </svg>
                <span>{isRunning ? 'Auditing Telemetry…' : 'Run Interactive Demo Audit'}</span>
              </button>

              <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Zero Setup · Sample Scenario Ready</span>
              </div>
            </div>
          </div>

          {/* Bottom HUD: Dynamic Scroll Visualizer Progress Bar */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">CINEMATIC SCROLL PROGRESS:</span>
              <span className="font-bold text-cyan-700">{Math.round(effectiveProgress * 100)}%</span>
              <div className="w-28 sm:w-40 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-150"
                  style={{ width: `${effectiveProgress * 100}%` }}
                />
              </div>
            </div>

            <div className="text-slate-500 flex items-center gap-2 text-[11px]">
              <span>Scroll down to enter the telemetry ledger</span>
              <span className="animate-bounce font-bold text-cyan-600">↓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
