'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { listAudits, listRepositoryScans } from '@/lib/api';
import { Audit, ScanJob, Verdict } from '@/lib/types';
import { VerdictBadge } from '@/components/VerdictBadge';
import { PlanPanel } from '@/components/PlanPanel';
import { UsageStrip } from '@/components/UsageStrip';
import { RequireAuth } from '@/components/RequireAuth';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/AuthContext';
import { formatDateTime, timeAgo } from '@/lib/time';
import {
  ArrowRightIcon,
  ClockIcon,
  FileIcon,
  GitBranchIcon,
  GithubLogoIcon,
  GitlabLogoIcon,
  GridIcon,
  SettingsIcon,
  UploadCloudIcon,
} from '@/components/icons';

const VERDICT_ACCENT: Record<string, string> = {
  pass: 'bg-pass',
  needs_work: 'bg-high',
  do_not_ship: 'bg-critical',
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: GridIcon },
  { key: 'audits', label: 'Audits', icon: FileIcon },
  { key: 'scans', label: 'Repo scans', icon: GitBranchIcon },
  { key: 'plan', label: 'Plan & usage', icon: SettingsIcon },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// Worst first — the order people scan a list of results in.
const VERDICT_FILTERS: Array<{
  key: Verdict | 'all' | 'other';
  label: string;
}> = [
  { key: 'all', label: 'All' },
  { key: 'do_not_ship', label: 'Do not ship' },
  { key: 'needs_work', label: 'Needs work' },
  { key: 'pass', label: 'Ship it' },
];

type VerdictFilter = (typeof VERDICT_FILTERS)[number]['key'];

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((t) => t.key === value);
}

function severityCounts(findings: { severity: string }[]) {
  return findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
}

/** The API stores "untitled" when an audit was run on pasted code without a filename. */
function auditName(a: Audit): string {
  return a.filename && a.filename !== 'untitled' ? a.filename : 'Pasted code';
}

function TimeStamp({ iso }: { iso: string }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-on-ink" title={formatDateTime(iso)}>
      <ClockIcon className="h-3 w-3" />
      {timeAgo(iso)}
    </span>
  );
}

function AuditRow({ a }: { a: Audit }) {
  const counts = severityCounts(a.findings);
  const summary =
    (['critical', 'high', 'medium', 'low'] as const)
      .filter((s) => counts[s])
      .map((s) => `${counts[s]} ${s}`)
      .join(' · ') || 'No issues found';
  return (
    <Link
      href={`/app/audit/${a.id}`}
      className="row-hover group relative flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft py-3 pr-4 pl-5 last:border-b-0 hover:bg-ink-line"
    >
      <span className={`absolute top-0 left-0 h-full w-1 ${VERDICT_ACCENT[a.verdict] ?? 'bg-muted-on-ink'}`} />
      <span
        className={`truncate font-mono text-[13px] ${auditName(a) === 'Pasted code' ? 'text-muted-on-ink italic' : 'text-[#E8ECF4]'}`}
      >
        {auditName(a)}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={a.verdict} />
        <span className="font-mono text-xs text-muted-on-ink">{summary}</span>
        <TimeStamp iso={a.createdAt} />
      </div>
    </Link>
  );
}

const SOURCE_META: Record<
  ScanJob['sourceType'],
  { label: string; icon: (p: { className?: string }) => React.ReactElement }
> = {
  zip: { label: 'Zip upload', icon: UploadCloudIcon },
  github_repo: { label: 'GitHub', icon: GithubLogoIcon },
  github_pr: { label: 'GitHub PR', icon: GithubLogoIcon },
  gitlab_repo: { label: 'GitLab', icon: GitlabLogoIcon },
  gitlab_mr: { label: 'GitLab MR', icon: GitlabLogoIcon },
};

function StatusPill({ status }: { status: ScanJob['status'] }) {
  const running = status === 'queued' || status === 'processing';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap uppercase ${
        status === 'failed' ? 'bg-critical/20 text-[#F3B7BF]' : 'bg-ink-line text-[#E8ECF4]'
      }`}
    >
      {running && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cobalt" />}
      {running ? 'Scanning…' : status}
    </span>
  );
}

function ScanRow({ s }: { s: ScanJob }) {
  const source = SOURCE_META[s.sourceType];
  const SourceIcon = source?.icon;
  return (
    <Link
      href={`/app/repository/${s.id}`}
      className="row-hover group relative flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft py-3 pr-4 pl-5 last:border-b-0 hover:bg-ink-line"
    >
      <span
        className={`absolute top-0 left-0 h-full w-1 ${s.verdict ? (VERDICT_ACCENT[s.verdict] ?? 'bg-muted-on-ink') : 'bg-muted-on-ink'}`}
      />
      <span className="flex min-w-0 items-center gap-2">
        {SourceIcon && <SourceIcon className="h-3.5 w-3.5 shrink-0 text-muted-on-ink" />}
        <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{s.sourceName}</span>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {s.verdict && s.status === 'completed' ? (
          <VerdictBadge verdict={s.verdict} />
        ) : (
          <StatusPill status={s.status} />
        )}
        <span className="text-xs text-muted-on-ink">{s.framework || 'Framework not detected'}</span>
        <span className="text-xs text-muted-on-ink">
          {s.filesScanned}/{s.fileCount} files
        </span>
        {s.isPublic && s.shareId && (
          <span
            className="rounded-full border border-cobalt/40 px-2 py-px font-mono text-[10px] font-bold text-cobalt uppercase"
            title="This report has a public share link"
          >
            Shared
          </span>
        )}
        <TimeStamp iso={s.createdAt} />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <DashboardPageInner />
      </Suspense>
    </RequireAuth>
  );
}

function DashboardPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('tab');
  // The URL is the source of truth, so sidebar links, back/forward and a
  // shared link all land on the same tab; push (not replace) so Back steps
  // through tabs the way people expect.
  const tab: TabKey = isTabKey(requested) ? requested : 'overview';
  const goTab = (key: TabKey) =>
    router.push(key === 'overview' ? pathname : `${pathname}?tab=${key}`, {
      scroll: false,
    });

  const [audits, setAudits] = useState<Audit[]>([]);
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listAudits(), listRepositoryScans()])
      .then(([a, s]) => {
        setAudits(a);
        setScans(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard.'))
      .finally(() => setLoaded(true));
  }, []);

  const counts: Partial<Record<TabKey, number>> = loaded ? { audits: audits.length, scans: scans.length } : {};
  const isNew = loaded && !error && audits.length === 0 && scans.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        kicker="Dashboard"
        title={`${isNew ? 'Welcome' : 'Welcome back'}${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Your recent audits and scans, code-health trends, and plan usage."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/app/repository"
              className="inline-flex items-center gap-1.5 rounded-md border border-ink-line px-3.5 py-2 text-sm font-bold text-[#E8ECF4] transition-colors hover:border-cobalt"
            >
              <GitBranchIcon className="h-4 w-4" />
              Scan a repository
            </Link>
            <Link
              href="/app"
              className="shadow-panel inline-flex items-center gap-1.5 rounded-md bg-cobalt px-3.5 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-px"
            >
              New audit
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      <nav
        role="tablist"
        aria-label="Dashboard sections"
        className="-mt-2 mb-6 flex gap-1 overflow-x-auto border-b border-ink-line"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => goTab(t.key)}
              className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'border-cobalt text-[#E8ECF4]' : 'border-transparent text-muted-on-ink hover:text-[#E8ECF4]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {count != null && (
                <span className="rounded-full bg-ink-line px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {error && (
        <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {tab === 'overview' && (
        <>
          <UsageStrip planHref={`${pathname}?tab=plan`} />

          {loaded && (audits.length === 0 || scans.length === 0) && !error && (
            <GetStarted hasAudit={audits.length > 0} hasScan={scans.length > 0} />
          )}

          {!isNew && (
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentList
                icon={<FileIcon className="h-3.5 w-3.5" />}
                title="Recent audits"
                total={audits.length}
                loaded={loaded}
                onViewAll={() => goTab('audits')}
                empty={<EmptyRow href="/app" label="Run your first audit" />}
              >
                {audits.slice(0, 5).map((a) => (
                  <AuditRow key={a.id} a={a} />
                ))}
              </RecentList>
              <RecentList
                icon={<GitBranchIcon className="h-3.5 w-3.5" />}
                title="Recent repository scans"
                total={scans.length}
                loaded={loaded}
                onViewAll={() => goTab('scans')}
                empty={<EmptyRow href="/app/repository" label="Scan your first repository" />}
              >
                {scans.slice(0, 5).map((s) => (
                  <ScanRow key={s.id} s={s} />
                ))}
              </RecentList>
            </div>
          )}

          {!isNew && <AnalyticsSection />}
        </>
      )}

      {tab === 'audits' && (
        <FilterableList
          items={audits}
          loaded={loaded}
          noun="audit"
          searchPlaceholder="Search by filename…"
          searchText={(a) => auditName(a)}
          verdictOf={(a) => a.verdict}
          render={(a) => <AuditRow key={a.id} a={a} />}
          empty={<EmptyRow href="/app" label="Run your first audit" />}
        />
      )}

      {tab === 'scans' && (
        <FilterableList
          items={scans}
          loaded={loaded}
          noun="scan"
          searchPlaceholder="Search by repository or framework…"
          searchText={(s) => `${s.sourceName} ${s.framework ?? ''}`}
          verdictOf={(s) => (s.status === 'completed' ? s.verdict : null)}
          render={(s) => <ScanRow key={s.id} s={s} />}
          empty={<EmptyRow href="/app/repository" label="Scan your first repository" />}
        />
      )}

      {tab === 'plan' && <PlanPanel />}
    </div>
  );
}

function GetStarted({ hasAudit, hasScan }: { hasAudit: boolean; hasScan: boolean }) {
  const steps = [
    {
      done: hasAudit,
      title: 'Run your first audit',
      text: 'Paste a file and get findings with a root cause and a fix in seconds.',
      href: '/app',
      cta: 'Open audit',
    },
    {
      done: false,
      title: 'Connect GitHub or GitLab',
      text: 'Add a read-only token to scan repositories and review pull requests.',
      href: '/app/repository?source=github',
      cta: 'Connect',
    },
    {
      done: hasScan,
      title: 'Scan a repository',
      text: 'Secrets, vulnerable dependencies, dead code and an AI review of risky files.',
      href: '/app/repository',
      cta: 'Start a scan',
    },
  ];
  return (
    <div className="shadow-panel mb-8 rounded-lg border border-cobalt/40 bg-cobalt/10 p-5">
      <h2 className="mb-1 text-base font-bold text-[#E8ECF4]">Get started</h2>
      <p className="mb-4 text-[13px] text-muted-on-ink">
        Three steps to your first full report. Local checks are free on every plan.
      </p>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col rounded-lg border border-ink-line bg-ink-soft p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                  s.done ? 'bg-pass text-white' : 'bg-ink-line text-[#E8ECF4]'
                }`}
              >
                {s.done ? '✓' : i + 1}
              </span>
              <span className={`text-sm font-bold ${s.done ? 'text-muted-on-ink line-through' : 'text-[#E8ECF4]'}`}>
                {s.title}
              </span>
            </div>
            <p className="mb-3 flex-1 text-[12px] leading-relaxed text-muted-on-ink">{s.text}</p>
            {!s.done && (
              <Link
                href={s.href}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-cobalt hover:underline"
              >
                {s.cta}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function RecentList({
  icon,
  title,
  total,
  loaded,
  onViewAll,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  total: number;
  loaded: boolean;
  onViewAll: () => void;
  empty: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <SectionHeading
        icon={icon}
        title={title}
        count={total}
        action={
          total > 5 && (
            <button
              onClick={onViewAll}
              className="cursor-pointer font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase hover:underline"
            >
              View all {total}
            </button>
          )
        }
      />
      <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
        {!loaded ? <SkeletonRows count={3} /> : total === 0 ? empty : children}
      </div>
    </div>
  );
}

function FilterableList<T>({
  items,
  loaded,
  noun,
  searchPlaceholder,
  searchText,
  verdictOf,
  render,
  empty,
}: {
  items: T[];
  loaded: boolean;
  noun: string;
  searchPlaceholder: string;
  searchText: (item: T) => string;
  verdictOf: (item: T) => Verdict | null;
  render: (item: T) => React.ReactNode;
  empty: React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [verdict, setVerdict] = useState<VerdictFilter>('all');

  const verdictCounts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const item of items) {
      const v = verdictOf(item) ?? 'other';
      c[v] = (c[v] || 0) + 1;
    }
    return c;
  }, [items, verdictOf]);

  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (item) => (verdict === 'all' || verdictOf(item) === verdict) && (!q || searchText(item).toLowerCase().includes(q)),
  );
  const filtering = q !== '' || verdict !== 'all';

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-w-[220px] flex-1 rounded-md border border-ink-line bg-ink-soft px-3 py-2 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
        />
        <div
          className="flex flex-wrap gap-1 rounded-md border border-ink-line bg-ink-soft p-0.5"
          role="group"
          aria-label="Filter by verdict"
        >
          {VERDICT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setVerdict(f.key)}
              aria-pressed={verdict === f.key}
              className={`cursor-pointer rounded px-2.5 py-1 text-[12px] font-medium ${
                verdict === f.key ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]'
              }`}
            >
              {f.label}
              <span className="ml-1.5 font-mono text-[10px] tabular-nums opacity-80">{verdictCounts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
        {!loaded ? (
          <SkeletonRows count={5} />
        ) : items.length === 0 ? (
          empty
        ) : visible.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-ink-soft px-5 py-4 text-sm text-muted-on-ink">
            No {noun}s match these filters.
            <button
              onClick={() => {
                setQuery('');
                setVerdict('all');
              }}
              className="cursor-pointer font-bold text-cobalt hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          visible.map(render)
        )}
      </div>

      {loaded && filtering && visible.length > 0 && (
        <p className="mt-2 text-[11px] text-muted-on-ink">
          Showing {visible.length} of {items.length} {noun}s.
        </p>
      )}
    </div>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-b border-ink-line bg-ink-soft px-5 py-3.5 last:border-b-0">
          <div className="mb-2 h-3 w-2/5 animate-pulse rounded bg-ink-line" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-ink-line" />
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  count,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-muted-on-ink">{icon}</span>
      <h2 className="font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">{title}</h2>
      {count > 0 && (
        <span className="rounded-full bg-ink-line px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-on-ink tabular-nums">
          {count}
        </span>
      )}
      {action && <span className="ml-auto">{action}</span>}
    </div>
  );
}

function EmptyRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="row-hover group flex items-center justify-between bg-ink-soft px-5 py-4 text-sm text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]"
    >
      {label}
      <ArrowRightIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
