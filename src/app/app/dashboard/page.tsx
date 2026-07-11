'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAudits, listRepositoryScans } from '@/lib/api';
import { Audit, ScanJob } from '@/lib/types';
import { VerdictBadge } from '@/components/VerdictBadge';
import { PlanPanel } from '@/components/PlanPanel';
import { RequireAuth } from '@/components/RequireAuth';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertIcon,
  ArrowRightIcon,
  ClockIcon,
  FileIcon,
  GitBranchIcon,
  ShieldIcon,
} from '@/components/icons';

const VERDICT_ACCENT: Record<string, string> = {
  pass: 'bg-pass',
  needs_work: 'bg-high',
  do_not_ship: 'bg-critical',
};

function severityCounts(findings: { severity: string }[]) {
  return findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listAudits(), listRepositoryScans()])
      .then(([a, s]) => {
        setAudits(a);
        setScans(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard.'));
  }, []);

  const totalFindings = audits.reduce((sum, a) => sum + a.findings.length, 0);
  const criticalCount = audits.reduce(
    (sum, a) => sum + a.findings.filter((f) => f.severity === 'critical').length,
    0,
  );

  return (
    <RequireAuth>
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        kicker="Overview"
        title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description="Everything you've audited or scanned, plus your plan, usage, and code-health trends in one place."
        action={
          <Link
            href="/app"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-cobalt px-3.5 py-2 text-sm font-bold text-white shadow-panel transition-transform hover:-translate-y-px"
          >
            New audit
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      <PlanPanel />

      <AnalyticsSection />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={<ShieldIcon className="h-4 w-4" />} label="Audits run" value={audits.length} />
        <StatCard icon={<FileIcon className="h-4 w-4" />} label="Total findings" value={totalFindings} />
        <StatCard
          icon={<AlertIcon className="h-4 w-4" />}
          label="Critical findings"
          value={criticalCount}
          tone="critical"
        />
      </div>

      <div className="mb-8">
        <SectionHeading icon={<FileIcon className="h-3.5 w-3.5" />} title="Recent audits" count={audits.length} />
        <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
          {audits.length === 0 && <EmptyRow href="/app" label="Run your first audit" />}
          {audits.map((a) => {
            const counts = severityCounts(a.findings);
            return (
              <Link
                key={a.id}
                href={`/app/audit/${a.id}`}
                className="row-hover group relative flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft py-3 pr-4 pl-5 last:border-b-0 hover:bg-ink-line"
              >
                <span
                  className={`absolute top-0 left-0 h-full w-1 ${VERDICT_ACCENT[a.verdict] ?? 'bg-muted-on-ink'}`}
                />
                <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{a.filename}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <VerdictBadge verdict={a.verdict} />
                  <span className="font-mono text-xs text-muted-on-ink">
                    {(['critical', 'high', 'medium', 'low'] as const)
                      .filter((s) => counts[s])
                      .map((s) => `${counts[s]} ${s}`)
                      .join(' · ') || 'clean'}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-on-ink">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeading
          icon={<GitBranchIcon className="h-3.5 w-3.5" />}
          title="Recent repository scans"
          count={scans.length}
        />
        <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
          {scans.length === 0 && <EmptyRow href="/app/repository" label="Scan your first repository" />}
          {scans.map((s) => (
            <Link
              key={s.id}
              href={`/app/repository/${s.id}`}
              className="row-hover group relative flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft py-3 pr-4 pl-5 last:border-b-0 hover:bg-ink-line"
            >
              <span
                className={`absolute top-0 left-0 h-full w-1 ${s.verdict ? (VERDICT_ACCENT[s.verdict] ?? 'bg-muted-on-ink') : 'bg-muted-on-ink'}`}
              />
              <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{s.sourceName}</span>
              <div className="flex flex-wrap items-center gap-2">
                {s.verdict ? (
                  <VerdictBadge verdict={s.verdict} />
                ) : (
                  <span className="shrink-0 rounded bg-muted-on-ink px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-white uppercase">
                    {s.status}
                  </span>
                )}
                <span className="text-xs text-muted-on-ink">{s.framework || 'unknown framework'}</span>
                <span className="text-xs text-muted-on-ink">
                  {s.filesScanned}/{s.fileCount} files
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-on-ink">
                  <ClockIcon className="h-3 w-3" />
                  {new Date(s.createdAt).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

function SectionHeading({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-muted-on-ink">{icon}</span>
      <h2 className="font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">{title}</h2>
      {count > 0 && (
        <span className="rounded-full bg-ink-line px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-on-ink tabular-nums">
          {count}
        </span>
      )}
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

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: 'critical';
}) {
  return (
    <div className="shadow-panel relative overflow-hidden rounded-lg border border-ink-line bg-ink-soft py-3.5 pr-4 pl-5">
      <span className={`absolute top-0 left-0 h-full w-1 ${tone === 'critical' ? 'bg-critical' : 'bg-cobalt'}`} />
      <div className={`mb-1.5 flex items-center gap-1.5 ${tone === 'critical' ? 'text-critical' : 'text-cobalt'}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold tabular-nums ${tone === 'critical' ? 'text-critical' : 'text-[#E8ECF4]'}`}>
        {value}
      </div>
      <div className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{label}</div>
    </div>
  );
}
