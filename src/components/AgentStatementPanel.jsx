/**
 * AgentStatementPanel — displays the raw agent statement being analyzed.
 */
export default function AgentStatementPanel({ statement }) {
  if (!statement) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
          Agent Statement
        </span>
        <span className="text-xs text-slate-400">
          · Agent ID: <code className="bg-white border border-slate-200 px-1 rounded">{statement.agentId}</code>
        </span>
        <span className="ml-auto text-xs text-slate-400 font-mono">
          {new Date(statement.timestamp).toLocaleString()}
        </span>
      </div>
      <blockquote className="text-slate-800 text-base font-medium leading-relaxed border-l-4 border-indigo-400 pl-4 italic">
        "{statement.text}"
      </blockquote>
    </div>
  );
}
