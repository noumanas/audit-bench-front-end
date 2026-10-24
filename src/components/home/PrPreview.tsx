/**
 * The home page's product shot: one pull request with Audit Bench Ai's
 * comment, the author's reply and the recheck, next to the merge-readiness
 * panel that blocks the merge. Static markup, so it's crisp at any size
 * and readable by screen readers.
 */
const CHECKS: Array<[string, string, string]> = [
  ['CI checks', 'Passed', 'text-chartreuse'],
  ['Merge conflicts', 'None', 'text-chartreuse'],
  ['Secrets', 'Clean', 'text-chartreuse'],
  ['Blocking issues', '1 critical', 'text-ab-coral'],
  ['Tests', 'Not updated', 'text-ab-amber'],
];

export function PrPreview() {
  return (
    <figure className="m-0 overflow-hidden rounded-[18px] border border-ab-line-2 bg-ab-panel text-left">
      <figcaption className="flex items-center gap-2 border-b border-ab-line bg-ab-deep px-4 py-3">
        <span className="h-[11px] w-[11px] rounded-full bg-ab-line-2" aria-hidden="true" />
        <span className="h-[11px] w-[11px] rounded-full bg-ab-line-2" aria-hidden="true" />
        <span className="h-[11px] w-[11px] rounded-full bg-ab-line-2" aria-hidden="true" />
        <span className="ml-3 truncate font-ab-mono text-[12.5px] text-ab-dim">
          acme/payments · Pull request #412 · Add refund endpoint
        </span>
      </figcaption>
      <div className="flex flex-wrap">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-3.5 border-ab-line p-5 md:border-r">
          <div className="overflow-hidden rounded-xl border border-ab-line">
            <div className="bg-ab-panel-2 px-3.5 py-2 font-ab-mono text-xs text-ab-muted">
              src/refunds/refunds.service.ts
            </div>
            <div className="overflow-x-auto font-ab-mono text-[12.5px] leading-[1.8]">
              <div className="flex px-3.5 text-[#8D7799]">
                <span className="w-8 shrink-0">41</span>
                <span className="whitespace-nowrap">const order = await this.orders.find(id);</span>
              </div>
              <div className="flex bg-tomato/15 px-3.5 text-[#FFD9D3]">
                <span className="w-8 shrink-0">42</span>
                <span className="whitespace-nowrap">
                  + await this.stripe.refunds.create(&#123; payment_intent: order.paymentId &#125;);
                </span>
              </div>
              <div className="flex bg-tomato/15 px-3.5 text-[#FFD9D3]">
                <span className="w-8 shrink-0">43</span>
                <span className="whitespace-nowrap">
                  + await this.orders.update(id, &#123; status: &apos;refunded&apos; &#125;);
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-ab-line-2 bg-ab-panel-2 px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-[22px] w-[22px] rounded-md bg-lavender" aria-hidden="true" />
              <strong className="text-[13.5px] text-white">audit-bench-ai</strong>
              <span className="text-[11px] text-ab-dim">bot</span>
              <span className="ml-auto rounded-md bg-tomato px-2 py-0.5 font-ab-mono text-[10.5px] font-semibold text-ab-bg uppercase">
                Critical · Logic
              </span>
            </div>
            <strong className="text-[15px] text-white">Refunds a missing or already refunded order</strong>
            <span className="text-[13.5px] leading-relaxed text-ab-soft">
              No check that the order exists or isn&apos;t refunded yet. A retried request refunds the customer twice.
            </span>
          </div>

          <div className="ml-7 flex flex-col gap-1 rounded-xl border border-ab-line px-4 py-3">
            <span className="text-[12.5px] text-ab-dim">
              <strong className="text-ab-text">maria-dev</strong> replied
            </span>
            <span className="text-[13.5px] text-ab-text">Added an idempotency check in a91f3c2, can you recheck?</span>
          </div>

          <div className="ml-7 flex items-center gap-2.5 rounded-xl border border-chartreuse/35 bg-chartreuse/5 px-4 py-3">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 stroke-chartreuse"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            <span className="text-[13.5px] text-ab-text">
              <strong className="text-white">Rechecked at a91f3c2:</strong> fixed. Thread resolved.
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 p-5">
          <span className="font-ab-mono text-[11px] font-medium tracking-[0.12em] text-ab-dim uppercase">
            [ Merge readiness ]
          </span>
          <div className="flex flex-col gap-1 rounded-xl border border-tomato/40 bg-tomato/10 p-3.5">
            <strong className="text-base text-[#FFB3A8]">Not ready to merge</strong>
            <span className="text-[12.5px] text-ab-soft">1 critical issue in the changed lines</span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
            {CHECKS.map(([name, value, tone]) => (
              <li key={name} className="flex justify-between gap-2 rounded-lg bg-ab-panel-2 px-3 py-2">
                <span>{name}</span>
                <span className={tone}>{value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2.5 rounded-[10px] border border-ab-line-2 px-3 py-2.5 text-[12.5px]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-tomato" aria-hidden="true" />
            <span className="text-ab-text">
              Required check <strong className="text-white">Audit Bench Ai</strong> failed. Merging is blocked.
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
