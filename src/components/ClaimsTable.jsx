import { useState, useMemo } from 'react';
import VerdictBadge from './VerdictBadge.jsx';
import EvidenceModal from './EvidenceModal.jsx';

/**
 * ClaimsTable — Light Cyberpunk Claims Investigation Ledger.
 * Provides interactive status filter pills, technical table layout,
 * high-contrast claim descriptions, and an accessible evidence inspection drawer.
 */
export default function ClaimsTable({ claims, results, toolEvents }) {
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState('ALL');

  // Lookup map: claimId -> result
  const resultMap = useMemo(() => {
    return Object.fromEntries((results ?? []).map((r) => [r.claimId, r]));
  }, [results]);

  // Filtered claims based on tab selection
  const filteredClaims = useMemo(() => {
    if (!claims) return [];
    if (filterVerdict === 'ALL') return claims;
    return claims.filter((claim) => {
      const result = resultMap[claim.id];
      return result?.verdict === filterVerdict;
    });
  }, [claims, filterVerdict, resultMap]);

  if (!claims?.length) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
        No claims available for inspection.
      </div>
    );
  }

  // Count tallies for filter pills
  const counts = {
    ALL: claims.length,
    CONTRADICTED: claims.filter((c) => resultMap[c.id]?.verdict === 'CONTRADICTED').length,
    VERIFIED: claims.filter((c) => resultMap[c.id]?.verdict === 'VERIFIED').length,
    UNVERIFIED: claims.filter((c) => resultMap[c.id]?.verdict === 'UNVERIFIED').length,
  };

  return (
    <>
      <div className="space-y-4">
        {/* Investigation Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div
            className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs"
            role="tablist"
            aria-label="Filter claims by verdict"
          >
            {[
              { id: 'ALL', label: 'All Assertions', count: counts.ALL, activeCls: 'bg-white text-slate-900 shadow-xs border-slate-200 font-bold' },
              { id: 'CONTRADICTED', label: 'Contradicted', count: counts.CONTRADICTED, activeCls: 'bg-pink-50 text-pink-900 border-pink-300 shadow-xs font-bold' },
              { id: 'VERIFIED', label: 'Verified', count: counts.VERIFIED, activeCls: 'bg-cyan-50 text-cyan-900 border-cyan-300 shadow-xs font-bold' },
              { id: 'UNVERIFIED', label: 'Unverified', count: counts.UNVERIFIED, activeCls: 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs font-bold' },
            ].map((tab) => {
              const isActive = filterVerdict === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilterVerdict(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 flex items-center gap-2 border ${
                    isActive
                      ? `${tab.activeCls}`
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Displaying {filteredClaims.length} of {claims.length} assertions
          </div>
        </div>

        {/* Claims Table Surface */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm">
          <table className="w-full text-sm text-left border-collapse" aria-label="Claims verification ledger">
            <thead className="bg-slate-50/90 text-slate-600 uppercase text-[11px] font-mono tracking-wider border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Claim Assertion</th>
                <th scope="col" className="px-5 py-4 font-bold">Verdict</th>
                <th scope="col" className="px-6 py-4 font-bold">Audit Finding & Explanation</th>
                <th scope="col" className="px-5 py-4 font-bold text-center">Telemetry Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.map((claim) => {
                const result = resultMap[claim.id];
                const hasEvidence = result?.evidence?.length > 0;

                return (
                  <tr
                    key={claim.id}
                    className="hover:bg-cyan-50/30 transition-colors duration-150 group"
                  >
                    {/* Claim Description & Action Details */}
                    <td className="px-6 py-4.5 align-top max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-cyan-800 transition-colors">
                        {claim.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-indigo-700 border border-slate-200 font-semibold">
                          <svg className="w-2.5 h-2.5 mr-1 text-indigo-600" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM13 5h-3a1 1 0 0 1-1-1V1L13 5Z" />
                          </svg>
                          {claim.action}
                        </span>
                        {claim.expectedCount && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                            × {claim.expectedCount} expected
                          </span>
                        )}
                        {claim.confidence && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {Math.round(claim.confidence * 100)}% conf.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verdict Badge */}
                    <td className="px-5 py-4.5 align-top whitespace-nowrap">
                      {result ? (
                        <VerdictBadge verdict={result.verdict} />
                      ) : (
                        <span className="text-xs text-slate-400 italic font-mono">Auditing…</span>
                      )}
                    </td>

                    {/* Explanation */}
                    <td className="px-6 py-4.5 align-top text-xs text-slate-600 leading-relaxed max-w-sm">
                      <div className="text-slate-800 font-medium">
                        {result?.summary ?? 'Pending verification against telemetry stream.'}
                      </div>
                      {result?.note && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <span className="shrink-0 text-amber-600 font-bold">⚠</span>
                          <span>{result.note}</span>
                        </div>
                      )}
                    </td>

                    {/* Evidence Inspector Action */}
                    <td className="px-5 py-4.5 align-top text-center whitespace-nowrap">
                      {hasEvidence ? (
                        <button
                          type="button"
                          onClick={() => setActiveClaimId(claim.id)}
                          className="cyber-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-300 hover:bg-cyan-100 hover:border-cyan-400 hover:shadow-xs active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          aria-label={`Inspect ${result.evidence.length} evidence items for claim: ${claim.description}`}
                        >
                          <svg className="w-3.5 h-3.5 text-cyan-700" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                          </svg>
                          <span>Inspect ({result.evidence.length})</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono px-2 py-1 rounded bg-slate-100 border border-slate-200">
                          No Events
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeClaimId && (
        <EvidenceModal
          claim={claims.find((c) => c.id === activeClaimId)}
          result={resultMap[activeClaimId]}
          toolEvents={toolEvents}
          onClose={() => setActiveClaimId(null)}
        />
      )}
    </>
  );
}
