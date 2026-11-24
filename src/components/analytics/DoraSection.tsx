'use client';

import { useEffect, useState } from 'react';
import { getDoraMetrics, listDoraRepos } from '@/lib/api';
import { DoraBand, DoraMetric, DoraMetrics } from '@/lib/types';
import { InfoIcon } from '@/components/icons';
import { TeamInsightsUpsell, useTeamInsightsAccess } from '@/components/TeamInsightsGate';

const WINDOWS = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const BAND_STYLE: Record<DoraBand, { label: string; className: string }> = {
  elite: { label: 'Elite', className: 'border-pass/40 bg-pass/15 text-pass' },
  high: { label: 'High', className: 'border-cobalt/40 bg-cobalt/15 text-cobalt' },
  medium: { label: 'Medium', className: 'border-[#d97706]/40 bg-[#d97706]/15 text-[#f0a64a]' },
  low: { label: 'Low', className: 'border-critical/40 bg-critical/15 text-[#F3B7BF]' },
};

function formatFrequency(perDay: number | null, total: number): string {
  if (perDay === null || total === 0) return 'None';
  if (perDay >= 1) return `${perDay.toFixed(1)} / day`;
  if (perDay * 7 >= 1) return `${(perDay * 7).toFixed(1)} / week`;
  return `${(perDay * 30).toFixed(1)} / month`;
}

function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} days`;
}

function DoraCard({
  label,
  hint,
  metric,
  value,
  detail,
}: {
  label: string;
  hint: string;
  metric: DoraMetric;
  value: string;
  detail: string;
}) {
  const band = metric.band ? BAND_STYLE[metric.band] : null;
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-white">{label}</span>
        <InfoIcon title={hint} className="h-4 w-4 shrink-0 text-muted-on-ink" />
      </div>
      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="text-[26px] leading-none font-bold tabular-nums text-white">{value}</span>
        {band && (
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase ${band.className}`}
          >
            {band.label}
          </span>
        )}
      </div>
      <p className="text-[12px] leading-snug text-muted-on-ink">{detail}</p>
    </div>
  );
}

/**
 * DORA delivery metrics for one GitHub repository: how often it ships, how
 * long a change takes to reach production, how often a release fails, and
 * how fast it recovers. Read live from GitHub through the user's connection.
 */
export function DoraSection() {
  const [repos, setRepos] = useState<string[] | null>(null);
  const [repo, setRepo] = useState('');
  const [days, setDays] = useState(30);
  const [metrics, setMetrics] = useState<DoraMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Which filter the numbers on screen belong to: while it differs from the
  // current one, a reload is in flight and the old numbers are dimmed.
  const filterKey = `${repo}:${days}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = metrics != null && loadedKey !== filterKey;

  const access = useTeamInsightsAccess();

  useEffect(() => {
    if (access !== 'allowed') return;
    listDoraRepos()
      .then((r) => {
        setRepos(r);
        if (r.length) setRepo(r[0]);
      })
      .catch(() => setRepos([]));
  }, [access]);

  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    getDoraMetrics(repo, days)
      .then((m) => {
        if (cancelled) return;
        setMetrics(m);
        setError(null);
        setLoadedKey(`${repo}:${days}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load delivery metrics.');
        setLoadedKey(`${repo}:${days}`);
      });
    return () => {
      cancelled = true;
    };
  }, [repo, days]);

  if (access === 'checking') return null;
  if (access === 'locked') {
    return (
      <div className="mb-8">
        <h2 className="mb-3 text-[11px] font-medium tracking-wide text-muted-on-ink uppercase">Delivery (DORA)</h2>
        <TeamInsightsUpsell feature="dora" compact />
      </div>
    );
  }
  // Nothing to show until a GitHub repository has been scanned or reviewed.
  if (repos !== null && repos.length === 0) return null;

  const m = metrics;
  const fromDeploys = m?.source === 'deployments';

  return (
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[11px] font-medium tracking-wide text-muted-on-ink uppercase">Delivery (DORA)</h2>
          <p className="text-[12px] text-muted-on-ink">
            How often {repo || 'this repository'} ships, how fast, and how safely, over the last {days} days.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            aria-label="Repository for delivery metrics"
            className="rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 font-mono text-[11px] text-muted-on-ink outline-none"
          >
            {(repos ?? []).map((r) => (
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

      {!m && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading delivery metrics">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[118px] animate-pulse rounded-lg border border-ink-line bg-ink-soft" />
          ))}
        </div>
      )}

      {m && (
        <div className={`transition-opacity ${loading ? 'pointer-events-none opacity-50' : ''}`} aria-busy={loading}>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DoraCard
              label="Deployment frequency"
              hint="How often changes reach production. Elite teams deploy at least once a day."
              metric={m.deploymentFrequency}
              value={formatFrequency(m.deploymentFrequency.value, m.deploymentFrequency.total)}
              detail={`${m.deploymentFrequency.total} ${fromDeploys ? 'production deploys' : 'merges to the default branch'} in ${m.windowDays} days.`}
            />
            <DoraCard
              label="Lead time for changes"
              hint={`Median time from a change's first commit to ${fromDeploys ? 'running in production' : 'merging'}. Elite: under a day.`}
              metric={m.leadTimeHours}
              value={formatHours(m.leadTimeHours.value)}
              detail={`Median across ${m.leadTimeHours.sample} merged pull request${m.leadTimeHours.sample === 1 ? '' : 's'}.`}
            />
            <DoraCard
              label="Change failure rate"
              hint={`Share of ${fromDeploys ? 'production deploys that failed' : 'merges that were reverts or hotfixes'}. Elite: 5% or less.`}
              metric={m.changeFailureRate}
              value={m.changeFailureRate.value === null ? '—' : `${m.changeFailureRate.value}%`}
              detail={`${m.changeFailureRate.failures} of ${m.changeFailureRate.sample} ${fromDeploys ? 'deploys failed' : 'merges were reverts or hotfixes'}.`}
            />
            <DoraCard
              label="Time to restore"
              hint={`Median time to recover from a failure: ${fromDeploys ? 'from a failed deploy to the next successful one' : 'how long a revert or hotfix took'}. Elite: under an hour.`}
              metric={m.timeToRestoreHours}
              value={formatHours(m.timeToRestoreHours.value)}
              detail={
                m.timeToRestoreHours.sample
                  ? `Median across ${m.timeToRestoreHours.sample} recover${m.timeToRestoreHours.sample === 1 ? 'y' : 'ies'}.`
                  : 'No failures to recover from in this window.'
              }
            />
          </div>
          <p className="text-[12px] leading-snug text-muted-on-ink">
            <span className="font-mono text-[10px] tracking-wide uppercase">
              {fromDeploys ? 'Measured from deployments' : 'Estimated from merges'}
            </span>{' '}
            · {m.basis} Bands follow the DORA State of DevOps report.
          </p>
        </div>
      )}
    </div>
  );
}
