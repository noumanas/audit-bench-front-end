import type { ReviewQuality } from '@/lib/types';

const pct = (r: number | null) => (r == null ? '–' : `${Math.round(r * 100)}%`);
const num = (n: number | null) => (n == null ? '–' : n.toLocaleString());

/**
 * How useful reviews were, from the backend's review-quality metrics: the
 * share of findings teams accepted, how often a recheck withdrew a finding a
 * developer disputed, repeats held back, and token cost. Rendered on the
 * Rules page (one team) and in the admin console (everyone).
 */
export function ReviewQualityPanel({ data, scope }: { data: ReviewQuality; scope: 'team' | 'all' }) {
  const d = data.discussion;
  const disputed = d.withdrawn + d.upheld + d.downgraded;
  const noOutcomes = data.findingsWithOutcome === 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Precision"
          value={pct(data.precision)}
          hint="Accepted ÷ (accepted + dismissed) on closed PRs"
          tone={data.precision != null && data.precision < 0.6 ? 'text-[#F0CE9A]' : 'text-pass'}
        />
        <Metric label="Dismissed" value={pct(data.dismissalRate)} hint="👎 by the time the PR closed" />
        <Metric label="Acknowledged" value={pct(data.acknowledgedRate)} hint="👀 or a reply in the thread" />
        <Metric
          label="Repeats held back"
          value={pct(data.duplicates.duplicateRate)}
          hint={`${data.duplicates.open + data.duplicates.dismissed} not reposted · ${data.duplicates.posted} posted`}
        />
      </div>

      <div className="rounded-md border border-ink-line bg-ink p-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[12px] font-bold text-white">When developers pushed back</h3>
          <span className="text-[11px] text-muted-on-ink">
            {disputed ? `${disputed} disputed finding${disputed === 1 ? '' : 's'}` : 'No disputes yet'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
          <Count label="Withdrawn (they were right)" value={d.withdrawn} />
          <Count label="Upheld (with evidence)" value={d.upheld} />
          <Count label="Downgraded (overstated)" value={d.downgraded} />
          <Count label="Fixed after discussion" value={d.resolved} />
        </div>
        {disputed > 0 && (
          <p className="mt-2 text-[11px] leading-relaxed text-muted-on-ink">
            {pct(d.withdrawnRate)} of disputed findings were withdrawn and {pct(d.severityOverstatedRate)} were
            overstated. A high withdrawn rate means first reviews are raising things they shouldn&apos;t.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="PR reviews" value={num(data.volume.reviews)} hint={`Last ${data.days} days`} />
        <Metric label="Findings per review" value={num(data.volume.findingsPerReview)} hint="Fewer, correct ones is the goal" />
        <Metric label="Tokens per review" value={num(data.volume.tokensPerReview)} hint="Input + output" />
        <Metric label="Tokens per finding" value={num(data.volume.tokensPerFinding)} hint="AI cost of each finding" />
      </div>

      {noOutcomes && (
        <p className="text-[11px] leading-relaxed text-muted-on-ink">
          Precision, dismissals and acknowledgements fill in as reviewed pull requests close
          {scope === 'team' ? ' on repositories with the GitHub App' : ''}. Reactions are collected when a PR closes.
        </p>
      )}
    </div>
  );
}

function Metric({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: string }) {
  return (
    <div className="rounded-md border border-ink-line bg-ink px-3 py-2">
      <div className={`text-lg font-bold tabular-nums ${tone ?? 'text-white'}`}>{value}</div>
      <div className="text-[11px] font-semibold text-[#d4d4d4]">{label}</div>
      <div className="text-[10px] leading-snug text-muted-on-ink">{hint}</div>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-mono text-base font-bold text-white tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-on-ink">{label}</div>
    </div>
  );
}
