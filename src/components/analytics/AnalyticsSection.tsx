'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsOverview, getAnalyticsTrend, listAnalyticsRepos } from '@/lib/api';
import { AnalyticsOverview, AnalyticsTrend } from '@/lib/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { InfoIcon } from '@/components/icons';
import { ScoreCard } from './ScoreCard';
import { ScoreTrendChart } from './ScoreTrendChart';
import { ActivityBarChart } from './ActivityBarChart';
import { MetricTile } from './MetricTile';

const WINDOWS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const VERDICT_STYLE = {
  pass: { color: '#1f7a4d', label: 'Ship it' },
  needs_work: { color: '#d97706', label: 'Needs work' },
  do_not_ship: { color: '#c92a3d', label: 'Do not ship' },
} as const;

function CardHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{title}</h3>
      <InfoIcon title={hint} className="h-3.5 w-3.5 shrink-0 text-muted-on-ink" />
    </div>
  );
}

export function AnalyticsSection() {
  const [days, setDays] = useState(30);
  const [repo, setRepo] = useState('');
  const [repos, setRepos] = useState<string[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AnalyticsTrend | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAnalyticsRepos()
      .then(setRepos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(days, repo || undefined), getAnalyticsTrend(days, repo || undefined)])
      .then(([o, t]) => {
        setOverview(o);
        setTrend(t);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'));
  }, [days, repo]);

  const verdictTotal = overview
    ? overview.verdictBreakdown.pass + overview.verdictBreakdown.needs_work + overview.verdictBreakdown.do_not_ship
    : 0;

  return (
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">Analytics</h2>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 font-mono text-[11px] text-muted-on-ink outline-none"
          >
            <option value="">All repositories</option>
            {repos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <div className="flex gap-1 rounded-md border border-ink-line bg-ink-soft p-0.5">
            {WINDOWS.map((w) => (
              <button
                key={w.days}
                onClick={() => setDays(w.days)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase ${
                  days === w.days ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line'
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {overview && trend && (
        <>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="Active repositories"
              hint="Distinct repos scanned or reviewed in this window. Pasted single-file audits aren't tied to a repo, so they don't count here."
              value={overview.activeRepositories}
            />
            <MetricTile
              label="PR / MR reviews"
              hint="Pull and merge requests reviewed in this window, scoped to just the changed lines."
              value={overview.prReviewCount}
            />
            <MetricTile
              label="Runs this window"
              hint="Every audit and repository scan started in this window, regardless of whether AI was actually invoked."
              subStats={[
                { label: 'Audits', value: overview.totals.audits },
                { label: 'Repo scans', value: overview.totals.scans },
              ]}
            />
            <MetricTile
              label="AI cost saved"
              hint="Share of runs that cost nothing — served from cache or resolved by free local checks alone, no LLM call made."
              subStats={[
                { label: 'Saved', value: `${overview.totals.cacheSavingsPct}%` },
                { label: 'Fresh AI calls', value: overview.totals.freshAiCalls },
              ]}
            />
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ScoreCard label="Security" score={overview.scores.security} hint="Weighted by severity across audits & scans" />
            <ScoreCard label="Performance" score={overview.scores.performance} hint="Performance findings in this window" />
            <ScoreCard label="Technical debt" score={overview.scores.technicalDebt} hint="Maintainability, architecture, duplication" />
          </div>

          <div className="mb-3 rounded-lg border border-ink-line bg-ink-soft p-4">
            <CardHeading title="Score trend" hint="Daily average score across everything scored that day." />
            <ScoreTrendChart points={trend.points} />
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <CardHeading title="Activity" hint="Audits and repository scans started per day." />
              <ActivityBarChart points={trend.points} />
            </div>

            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <CardHeading title="Verdicts" hint="Final verdict distribution across everything run in this window." />
              {verdictTotal === 0 ? (
                <p className="text-sm text-muted-on-ink">No verdicts yet in this window.</p>
              ) : (
                <>
                  <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
                    {(['pass', 'needs_work', 'do_not_ship'] as const).map((k) => {
                      const count = overview.verdictBreakdown[k];
                      if (count === 0) return null;
                      const pct = (count / verdictTotal) * 100;
                      return (
                        <div
                          key={k}
                          style={{ width: `${pct}%`, backgroundColor: VERDICT_STYLE[k].color }}
                          className="h-full first:ml-0 [&:not(:first-child)]:ml-0.5"
                        />
                      );
                    })}
                  </div>
                  <div className="space-y-1.5">
                    {(['pass', 'needs_work', 'do_not_ship'] as const).map((k) => (
                      <div key={k} className="flex items-center gap-2 text-[12px]">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: VERDICT_STYLE[k].color }} />
                        <span className="text-muted-on-ink">{VERDICT_STYLE[k].label}</span>
                        <span className="ml-auto tabular-nums font-semibold text-[#E8ECF4]">{overview.verdictBreakdown[k]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <CardHeading title="Most common issues" hint="Findings grouped by category + title, ranked by how often they recur." />
              {overview.topIssues.length === 0 ? (
                <p className="text-sm text-muted-on-ink">No findings in this window.</p>
              ) : (
                <div className="space-y-2">
                  {overview.topIssues.map((issue) => (
                    <div key={`${issue.category}:${issue.title}`} className="flex items-center gap-2 text-[12px]">
                      <SeverityBadge level={issue.maxSeverity} />
                      <span className="flex-1 truncate text-[#E8ECF4]">{issue.title}</span>
                      <span className="tabular-nums text-muted-on-ink">×{issue.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <CardHeading title="Riskiest files" hint="Ranked by critical + high severity findings, worst first." />
              {overview.riskiest.length === 0 ? (
                <p className="text-sm text-muted-on-ink">No critical or high findings in this window.</p>
              ) : (
                <div className="space-y-2">
                  {overview.riskiest.map((item, i) => (
                    <div key={`${item.label}:${i}`} className="flex items-center gap-2 text-[12px]">
                      <span className="truncate font-mono text-[#E8ECF4]">{item.label}</span>
                      <span className="ml-auto shrink-0 text-muted-on-ink">
                        {item.criticalCount > 0 && `${item.criticalCount} critical`}
                        {item.criticalCount > 0 && item.highCount > 0 && ' · '}
                        {item.highCount > 0 && `${item.highCount} high`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
