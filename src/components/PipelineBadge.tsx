export function PipelineBadge({ aiInvoked, fromCache }: { aiInvoked: boolean; fromCache: boolean }) {
  if (fromCache) {
    return (
      <span
        title="This exact code was already audited before — served from cache, no AI credit used"
        className="shrink-0 rounded-full border border-low/40 bg-low/10 px-2.5 py-0.5 font-mono text-[10.5px] font-bold tracking-wide text-low uppercase whitespace-nowrap"
      >
        Cached
      </span>
    );
  }
  if (aiInvoked) {
    return (
      <span className="shrink-0 rounded-full border border-cobalt/40 bg-cobalt/10 px-2.5 py-0.5 font-mono text-[10.5px] font-bold tracking-wide text-cobalt uppercase whitespace-nowrap">
        AI reviewed
      </span>
    );
  }
  return (
    <span
      title="Local checks only (lint, types, complexity, formatting) — nothing warranted AI review, no credit used"
      className="shrink-0 rounded-full border border-pass/40 bg-pass/10 px-2.5 py-0.5 font-mono text-[10.5px] font-bold tracking-wide text-pass uppercase whitespace-nowrap"
    >
      Local checks only
    </span>
  );
}
