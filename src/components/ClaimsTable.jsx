import { useState, useMemo } from 'react';
import VerdictBadge from './VerdictBadge.jsx';
import EvidenceModal from './EvidenceModal.jsx';

/**
 * ClaimsTable — Midnight Intelligence Claims Investigation Table.
 * Provides interactive status filters (All, Contradicted, Verified, Unverified),
 * high-contrast claim descriptions, verdict badges, and an Inspect Evidence drawer.
 */
export default function ClaimsTable({ claims, results, toolEvents }) {
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState('ALL');

  // Build lookup: claimId -> result
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
      <div className="text-center py-12 text-[#98A5BD] text-sm bg-[#101625] rounded-xl border border-[#222B40]">
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
      <div className="space-y-3.5">
        {/* Investigation Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#0D121F] border border-[#222B40]" role="tablist" aria-label="Filter claims by verdict">
            {[
              { id: 'ALL', label: 'All Claims', count: counts.ALL },
              { id: 'CONTRADICTED', label: 'Contradicted', count: counts.CONTRADICTED, activeCls: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
              { id: 'VERIFIED', label: 'Verified', count: counts.VERIFIED, activeCls: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
              { id: 'UNVERIFIED', label: 'Unverified', count: counts.UNVERIFIED, activeCls: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
            ].map((tab) => {
              const isActive = filterVerdict === tab.id;
              const activeStyle = tab.activeCls ?? 'text-[#43D9F5] border-[#43D9F5]/40 bg-[#162036]';

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilterVerdict(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border ${
                    isActive
                      ? `${activeStyle} font-semibold shadow-sm`
                      : 'border-transparent text-[#98A5BD] hover:text-[#F1F5FF] hover:bg-[#151D30]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-[#222B40] text-white' : 'bg-[#1C253B] text-[#5E6C84]'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#5E6C84] font-mono">
            Showing {filteredClaims.length} of {claims.length} assertions
          </div>
        </div>

        {/* Claims Table Surface */}
        <div className="overflow-x-auto rounded-xl border border-[#222B40] bg-[#101625] shadow-lg">
          <table className="w-full text-sm text-left border-collapse" aria-label="Claims verification ledger">
            <thead className="bg-[#0D121F] text-[#98A5BD] uppercase text-[11px] font-mono tracking-wider border-b border-[#222B40]">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">Claim Assertion</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Verdict</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">Audit Finding & Explanation</th>
                <th scope="col" className="px-4 py-3.5 font-semibold text-center">Telemetry Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B2338]">
              {filteredClaims.map((claim) => {
                const result = resultMap[claim.id];
                const hasEvidence = result?.evidence?.length > 0;

                return (
                  <tr
                    key={claim.id}
                    className="hover:bg-[#141C2E] transition-colors duration-150 group"
                  >
                    {/* Claim Description & Action */}
                    <td className="px-5 py-4 align-top max-w-xs">
                      <div className="font-medium text-[#F1F5FF] group-hover:text-[#43D9F5] transition-colors">
                        {claim.description}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#0D121F] text-[#7667FF] border border-[#222B40]">
                          <svg className="w-2.5 h-2.5 mr-1 text-[#7667FF]" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM13 5h-3a1 1 0 0 1-1-1V1L13 5Z" />
                          </svg>
                          {claim.action}
                        </span>
                        {claim.expectedCount && (
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#162036] text-[#98A5BD] border border-[#222B40]">
                            × {claim.expectedCount} expected
                          </span>
                        )}
                        {claim.confidence && (
                          <span className="text-[10px] font-mono text-[#5E6C84]">
                            {Math.round(claim.confidence * 100)}% conf.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verdict Badge */}
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {result ? (
                        <VerdictBadge verdict={result.verdict} />
                      ) : (
                        <span className="text-xs text-[#5E6C84] italic font-mono">Auditing…</span>
                      )}
                    </td>

                    {/* Explanation */}
                    <td className="px-5 py-4 align-top text-xs text-[#98A5BD] leading-relaxed max-w-sm">
                      <div className="text-[#D0DAEA]">
                        {result?.summary ?? 'Pending verification against telemetry stream.'}
                      </div>
                      {result?.note && (
                        <div className="mt-2 p-2 rounded bg-[#171F33] border border-[#2A3754] text-[11px] text-[#FBBF24] flex items-start gap-1.5">
                          <span className="shrink-0 text-amber-400 font-bold">⚠</span>
                          <span>{result.note}</span>
                        </div>
                      )}
                    </td>

                    {/* Evidence Inspector Action */}
                    <td className="px-4 py-4 align-top text-center whitespace-nowrap">
                      {hasEvidence ? (
                        <button
                          onClick={() => setActiveClaimId(claim.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#43D9F5] bg-[#43D9F5]/10 border border-[#43D9F5]/30 hover:bg-[#43D9F5]/20 hover:border-[#43D9F5]/60 hover:shadow-[0_0_15px_rgba(67,217,245,0.25)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#43D9F5]/40"
                          aria-label={`Inspect ${result.evidence.length} evidence items for claim: ${claim.description}`}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                          </svg>
                          <span>Inspect ({result.evidence.length})</span>
                        </button>
                      ) : (
                        <span className="text-xs text-[#5E6C84] font-mono px-2 py-1 rounded bg-[#0D121F] border border-[#1E273D]">
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
