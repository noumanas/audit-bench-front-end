'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listAudits, listRepositoryScans } from '@/lib/api';
import { Audit, ScanJob } from '@/lib/types';
import { VerdictBadge } from '@/components/VerdictBadge';
import { PlanPanel } from '@/components/PlanPanel';
import { RequireAuth } from '@/components/RequireAuth';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';

function severityCounts(findings: { severity: string }[]) {
  return findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
}

export default function DashboardPage() {
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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-1 text-xl font-bold text-[#E8ECF4]">Dashboard</h1>
      <p className="mb-6 text-sm text-muted-on-ink">Recent audits and repository scans.</p>

      {error && (
        <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      <PlanPanel />

      <AnalyticsSection />

      <div className="mb-8 grid grid-cols-3 gap-3">
        <StatCard label="Audits run" value={audits.length} />
        <StatCard label="Total findings" value={totalFindings} />
        <StatCard label="Critical findings" value={criticalCount} accent="text-critical" />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
          Recent audits
        </h2>
        <div className="overflow-hidden rounded-lg border border-ink-line">
          {audits.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-on-ink">No audits yet.</div>
          )}
          {audits.map((a) => {
            const counts = severityCounts(a.findings);
            return (
              <Link
                key={a.id}
                href={`/app/audit/${a.id}`}
                className="flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0 hover:bg-ink-line"
              >
                <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{a.filename}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <VerdictBadge verdict={a.verdict} />
                  <span className="font-mono text-xs text-muted-on-ink">
                    {(['critical', 'high', 'medium', 'low'] as const)
                      .filter((s) => counts[s])
                      .map((s) => `${counts[s]} ${s}`)
                      .join(' · ') || 'clean'}
                  </span>
                  <span className="ml-auto text-xs text-muted-on-ink">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
          Recent repository scans
        </h2>
        <div className="overflow-hidden rounded-lg border border-ink-line">
          {scans.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-on-ink">No repository scans yet.</div>
          )}
          {scans.map((s) => (
            <Link
              key={s.id}
              href={`/app/repository/${s.id}`}
              className="flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0 hover:bg-ink-line"
            >
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
                <span className="ml-auto text-xs text-muted-on-ink">
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

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3">
      <div className={`text-2xl font-bold ${accent ?? 'text-[#E8ECF4]'}`}>{value}</div>
      <div className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{label}</div>
    </div>
  );
}
