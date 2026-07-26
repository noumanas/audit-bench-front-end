function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** Only renders once real AI tokens were spent — a cache hit or Stage-1-only run has nothing to show here. */
export function TokenUsageNote({ inputTokens, outputTokens }: { inputTokens: number; outputTokens: number }) {
  if (inputTokens === 0 && outputTokens === 0) return null;

  return (
    <span
      title={`${inputTokens.toLocaleString()} input tokens, ${outputTokens.toLocaleString()} output tokens`}
      className="font-mono text-[11px] text-muted-on-paper"
    >
      {formatTokens(inputTokens)} in · {formatTokens(outputTokens)} out
    </span>
  );
}
