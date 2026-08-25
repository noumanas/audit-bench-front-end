'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listRepositoryScans } from '@/lib/api';
import { ScanJob } from '@/lib/types';
import { RequireAuth } from '@/components/RequireAuth';
import { PageHeader } from '@/components/PageHeader';
import { ClockIcon } from '@/components/icons';

// A due diligence report only makes sense for a full-repository scan, and
// only once it's actually finished gathering data — a PR/MR diff review has
// none of the repo-wide analysis (dependency/license/test-coverage/
// contributor/architecture) this report is built from.
const REPO_WIDE_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['zip', 'github_repo', 'gitlab_repo']);

// listRepositoryScans() doesn't load each scan's files/findings (too costly
// for a list of up to 20), so the full RiskAggregation isn't available here
// — that's computed on read for the single-scan detail view only (see
// RepositoryService.findOne). This list uses the cheaper verdict field as a
// rough proxy, with business-appropriate labels rather than VerdictBadge's
// dev-phrased "Ship it" / "Do not ship" (this page isn't that audience).
const VERDICT_LABEL: Record<string, { label: string; className: string }> = {
  pass: { label: 'No major findings', className: 'bg-pass' },
  needs_work: { label: 'Findings to review', className: 'bg-high' },
  do_not_ship: { label: 'Critical findings', className: 'bg-critical' },
};

function reportRow(scan: ScanJob) {
  const verdict = scan.verdict ? VERDICT_LABEL[scan.verdict] : null;
  return (
    <Link
      key={scan.id}
      href={`/app/due-diligence/${scan.id}`}
      className="row-hover group relative flex flex-col gap-1.5 border-b border-ink-line bg-ink-soft py-3 pr-4 pl-5 last:border-b-0 hover:bg-ink-line"
    >
      <span className={`absolute top-0 left-0 h-full w-1 ${verdict?.className ?? 'bg-muted-on-ink'}`} />
      <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{scan.sourceName}</span>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`${verdict?.className ?? 'bg-muted-on-ink'} rounded px-2 py-0.5 font-mono text-[11px] font-bold text-white uppercase`}
        >
          {verdict?.label ?? scan.status}
        </span>
        <span className="text-xs text-muted-on-ink">{scan.framework || 'unknown framework'}</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-on-ink">
          <ClockIcon className="h-3 w-3" />
          {new Date(scan.createdAt).toLocaleString('en-US')}
        </span>
      </div>
    </Link>
  );
}

export default function DueDiligenceListPage() {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listRepositoryScans()
      .then((all) => setScans(all.filter((s) => REPO_WIDE_SOURCE_TYPES.has(s.sourceType) && s.status === 'completed')))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <PageHeader
          kicker="For investors & M&A"
          title="Due diligence reports"
          description="An investor-facing risk read on any repository you've scanned — security exposure, technical debt, talent concentration, and a remediation cost estimate, built from the same scan data as your repository reports."
          action={
            <Link
              href="/app/repository"
              className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark"
            >
              Scan a repository
            </Link>
          }
        />

        {error && (
          <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error}
          </div>
        )}

        {!loading && scans.length === 0 && !error && (
          <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-6 text-center text-sm text-muted-on-ink">
            No completed repository scans yet.{' '}
            <Link href="/app/repository" className="text-cobalt hover:underline">
              Scan one
            </Link>{' '}
            to generate your first due diligence report.
          </div>
        )}

        {scans.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-ink-line">{scans.map(reportRow)}</div>
        )}
      </div>
    </RequireAuth>
  );
}
