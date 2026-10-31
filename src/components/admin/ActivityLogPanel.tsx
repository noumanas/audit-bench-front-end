'use client';

import { useEffect, useState } from 'react';
import { getAdminActivitySummary, listAdminActivity } from '@/lib/api';
import { ActivityLog, ActivitySummary, ActivityType } from '@/lib/types';
import {
  ActivityBadge,
  Location,
  activityDetail,
  countryName,
  deviceLabel,
  flag,
  methodLabel,
} from './activityDisplay';
import { formatDateTime, timeAgo } from '@/lib/time';

const FILTERS: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sign-ups', value: 'signup' },
  { label: 'Sign-ins', value: 'login' },
  { label: 'Failed sign-ins', value: 'login_failed' },
  { label: 'Plan requests', value: 'plan_requested' },
  { label: 'Approved', value: 'plan_approved' },
  { label: 'Rejected', value: 'plan_rejected' },
];

/**
 * Sign-ups, sign-ins (and failures) and plan events with IP, approximate
 * location and device — backed by the backend's ActivityLog, newest first.
 */
export function ActivityLogPanel() {
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  // Which filter+search the current rows belong to; anything else means a load is in flight.
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = `${filter}|${query}`;
  const loading = loadedKey !== key;

  useEffect(() => {
    getAdminActivitySummary()
      .then(setSummary)
      .catch(() => {});
  }, []);

  // Debounce typing into the search box.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    listAdminActivity({ type: filter === 'all' ? undefined : filter, q: query || undefined })
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setCursor(page.nextCursor);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setCursor(null);
        setError(err instanceof Error ? err.message : 'Failed to load activity.');
      })
      .finally(() => !cancelled && setLoadedKey(`${filter}|${query}`));
    return () => {
      cancelled = true;
    };
  }, [filter, query]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await listAdminActivity({ type: filter === 'all' ? undefined : filter, q: query || undefined, cursor });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-5">
      {summary && <SummaryCards summary={summary} />}
      {summary && <Breakdowns summary={summary} />}

      <div className="rounded-xl border border-ink-line bg-ink-soft">
        <div className="flex flex-col gap-3 border-b border-ink-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  filter === f.value
                    ? 'bg-cobalt text-white'
                    : 'border border-ink-line text-muted-on-ink hover:text-[#E8ECF4]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, IP, city or country code…"
            className="w-full rounded-md border border-ink-line bg-ink px-3 py-1.5 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink/70 focus:border-cobalt lg:w-72"
          />
        </div>

        {error && <div className="border-b border-ink-line px-4 py-2.5 text-[13px] text-[#F3B7BF]">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-ink-line font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
                <th className="px-4 py-2.5 font-semibold">When</th>
                <th className="px-4 py-2.5 font-semibold">Event</th>
                <th className="px-4 py-2.5 font-semibold">User</th>
                <th className="px-4 py-2.5 font-semibold">Location</th>
                <th className="px-4 py-2.5 font-semibold">IP · Device</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-on-ink">
                    Loading activity…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-on-ink">
                    No activity yet{query ? ` matching “${query}”` : ''}. Sign-ups, sign-ins and plan requests appear
                    here as they happen.
                  </td>
                </tr>
              ) : (
                items.map((log) => <ActivityRow key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>

        {cursor && !loading && (
          <div className="border-t border-ink-line p-3 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="cursor-pointer rounded-md border border-ink-line px-4 py-1.5 text-xs font-semibold text-muted-on-ink hover:text-[#E8ECF4] disabled:cursor-wait disabled:opacity-60"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ log }: { log: ActivityLog }) {
  const detail = activityDetail(log);
  const method = methodLabel(log.method);
  const device = deviceLabel(log.userAgent);
  return (
    <tr className="row-hover border-b border-ink-line/60 last:border-0 hover:bg-ink/40">
      <td className="px-4 py-3 whitespace-nowrap text-muted-on-ink" title={formatDateTime(log.createdAt)}>
        {timeAgo(log.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <ActivityBadge type={log.type} />
          {method && <span className="text-[11px] text-muted-on-ink">via {method}</span>}
        </div>
        {detail && <div className="mt-1 text-[11px] text-muted-on-ink">{detail}</div>}
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[240px] truncate text-[#E8ECF4]">{log.user?.name || log.email || '—'}</div>
        {log.user?.name && <div className="max-w-[240px] truncate text-[11px] text-muted-on-ink">{log.email}</div>}
      </td>
      <td className="px-4 py-3 text-[#E8ECF4]">
        <Location city={log.city} countryCode={log.countryCode} />
      </td>
      <td className="px-4 py-3">
        <div className="font-mono text-[12px] text-[#E8ECF4]">{log.ip ?? '—'}</div>
        {device && <div className="text-[11px] text-muted-on-ink">{device}</div>}
      </td>
    </tr>
  );
}

function SummaryCards({ summary }: { summary: ActivitySummary }) {
  const cards: { label: string; value: number; hint: string; tone?: string }[] = [
    { label: 'Sign-ups today', value: summary.signupsToday, hint: `${summary.signups7d} this week` },
    { label: 'Sign-ups · 30d', value: summary.signups30d, hint: 'New accounts' },
    { label: 'Sign-ins · 24h', value: summary.logins24h, hint: 'Successful' },
    {
      label: 'Failed sign-ins · 24h',
      value: summary.failedLogins24h,
      hint: summary.failedLogins24h > 20 ? 'Unusually high' : 'Wrong password, unknown email',
      tone: summary.failedLogins24h > 20 ? 'text-[#F3B7BF]' : undefined,
    },
    {
      label: 'Pending plan requests',
      value: summary.pendingRequests,
      hint: summary.pendingRequests ? 'Check payment, then approve' : 'All caught up',
      tone: summary.pendingRequests ? 'text-[#F0CE9A]' : undefined,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-ink-line bg-ink-soft px-4 py-3.5">
          <div className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">{c.label}</div>
          <div className={`mt-1 text-2xl font-bold tabular-nums ${c.tone ?? 'text-[#E8ECF4]'}`}>{c.value}</div>
          <div className="mt-0.5 text-[11px] text-muted-on-ink">{c.hint}</div>
        </div>
      ))}
    </div>
  );
}

function Breakdowns({ summary }: { summary: ActivitySummary }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <BreakdownCard
        title="Top countries · 30d"
        empty="Locations appear as people sign in."
        rows={summary.topCountries.map((c) => ({
          key: c.countryCode,
          label: (
            <>
              <span aria-hidden="true">{flag(c.countryCode)}</span> {countryName(c.countryCode)}
            </>
          ),
          value: c.users,
        }))}
        unit="users"
      />
      <BreakdownCard
        title="Where sign-ups came from · 30d"
        empty="Sources appear with new sign-ups."
        rows={summary.topSources.map((s) => ({ key: s.source, label: s.source, value: s.count }))}
        unit="sign-ups"
      />
      <BreakdownCard
        title="Sign-up method · 30d"
        empty="Methods appear with new sign-ups."
        rows={[...summary.methods]
          .sort((a, b) => b.count - a.count)
          .map((m) => ({ key: m.method, label: methodLabel(m.method) ?? m.method, value: m.count }))}
        unit="sign-ups"
      />
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  unit,
  empty,
}: {
  title: string;
  rows: { key: string; label: React.ReactNode; value: number }[];
  unit: string;
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-ink-line bg-ink-soft p-4">
      <div className="mb-3 font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">{title}</div>
      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-on-ink">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-[#E8ECF4]">{r.label}</span>
                <span className="shrink-0 font-mono text-muted-on-ink" title={`${r.value} ${unit}`}>
                  {r.value}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-ink-line">
                <div className="h-full rounded-full bg-cobalt" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
