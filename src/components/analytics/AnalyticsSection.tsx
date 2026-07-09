'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsOverview, getAnalyticsTrend } from '@/lib/api';
import { AnalyticsOverview, AnalyticsTrend } from '@/lib/types';
import { SeverityBadge } from '@/components/SeverityBadge';
import { ScoreCard } from './ScoreCard';
import { ScoreTrendChart } from './ScoreTrendChart';
import { ActivityBarChart } from './ActivityBarChart';

const WINDOWS = [7, 30, 90];

const VERDICT_STYLE = {
  pass: { color: '#1f7a4d', label: 'Ship it' },
  needs_work: { color: '#d97706', label: 'Needs work' },
  do_not_ship: { color: '#c92a3d', label: 'Do not ship' },
} as const;

export function AnalyticsSection() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AnalyticsTrend | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(days), getAnalyticsTrend(days)])
      .then(([o, t]) => {
        setOverview(o);
        setTrend(t);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'));
  }, [days]);

  const verdictTotal = overview
    ? overview.verdictBreakdown.pass + overview.verdictBreakdown.needs_work + overview.verdictBreakdown.do_not_ship
    : 0;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">Analytics</h2>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setDays(w)}
              className={`rounded px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase ${
                days === w ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line'
              }`}
            >
              {w}d
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {overview && trend && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <ScoreCard label="Security" score={overview.scores.security} hint="Weighted by severity across audits & scans" />
            <ScoreCard label="Performance" score={overview.scores.performance} hint="Performance findings in this window" />
            <ScoreCard label="Technical debt" score={overview.scores.technicalDebt} hint="Maintainability, architecture, duplication" />
          </div>

          <div className="mb-4 rounded-lg border border-ink-line bg-ink-soft p-4">
            <h3 className="mb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">Score trend</h3>
            <ScoreTrendChart points={trend.points} />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <h3 className="mb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">Activity</h3>
              <ActivityBarChart points={trend.points} />
            </div>

            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <h3 className="mb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">Verdicts</h3>
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
                  <p className="mt-3 text-[12px] text-muted-on-ink">
                    {overview.totals.cacheSavingsPct}% of runs served from cache or skipped the AI call entirely — {overview.totals.freshAiCalls} fresh AI call
                    {overview.totals.freshAiCalls === 1 ? '' : 's'} this window.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
              <h3 className="mb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">Most common issues</h3>
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
              <h3 className="mb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">Riskiest files</h3>
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
