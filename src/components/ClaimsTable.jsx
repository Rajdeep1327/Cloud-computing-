import { useState } from 'react';
import VerdictBadge from './VerdictBadge.jsx';
import EvidenceModal from './EvidenceModal.jsx';

/**
 * ClaimsTable — renders all claims with their verdict, explanation,
 * and an "Inspect Evidence" button that opens EvidenceModal.
 */
export default function ClaimsTable({ claims, results, toolEvents }) {
  const [activeClaimId, setActiveClaimId] = useState(null);

  if (!claims?.length) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No claims to display.
      </div>
    );
  }

  // Build a quick lookup: claimId → result
  const resultMap = Object.fromEntries((results ?? []).map(r => [r.claimId, r]));

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm text-left" aria-label="Claims verification table">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Verdict</th>
              <th className="px-4 py-3 font-semibold">Explanation</th>
              <th className="px-4 py-3 font-semibold text-center">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {claims.map((claim) => {
              const result = resultMap[claim.id];
              return (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                    {claim.description}
                    <div className="text-xs text-slate-400 mt-0.5">
                      action: <code className="bg-slate-100 px-1 rounded">{claim.action}</code>
                      {claim.expectedCount && ` × ${claim.expectedCount}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {result ? (
                      <VerdictBadge verdict={result.verdict} />
                    ) : (
                      <span className="text-slate-400 text-xs italic">Pending…</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm">
                    {result?.summary ?? '—'}
                    {result?.note && (
                      <div className="mt-1 text-xs text-slate-400 italic">
                        ⚠ {result.note}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {result?.evidence?.length > 0 ? (
                      <button
                        onClick={() => setActiveClaimId(claim.id)}
                        className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
                        aria-label={`Inspect evidence for: ${claim.description}`}
                      >
                        Inspect ({result.evidence.length})
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeClaimId && (
        <EvidenceModal
          claim={claims.find(c => c.id === activeClaimId)}
          result={resultMap[activeClaimId]}
          toolEvents={toolEvents}
          onClose={() => setActiveClaimId(null)}
        />
      )}
    </>
  );
}
