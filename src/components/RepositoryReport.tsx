'use client';

import { useState } from 'react';
import { ScanJob } from '@/lib/types';
import { VerdictBadge } from './VerdictBadge';
import { FindingCard } from './FindingCard';
import { PipelineBadge } from './PipelineBadge';
import { Stage1Summary } from './Stage1Summary';
import { FixInEditorModal } from './FixInEditorModal';
import { downloadReport } from '@/lib/reportExport';

const DIFF_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['github_pr', 'gitlab_mr']);
// Fixing requires a remote to commit to — a .zip upload has none.
const FIXABLE_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['github_repo', 'github_pr', 'gitlab_repo', 'gitlab_mr']);

export function RepositoryReport({ scan }: { scan: ScanJob }) {
  const [openFilePath, setOpenFilePath] = useState<string | null>(null);
  const [fixingPath, setFixingPath] = useState<string | null>(null);

  const progressPct =
    scan.fileCount > 0 ? Math.round((scan.filesScanned / Math.min(scan.fileCount, 9999)) * 100) : 0;
  const aiReviewedCount = Math.max(0, scan.filesScanned - scan.filesFromCache - scan.filesAiSkipped);
  const isDiffReview = DIFF_SOURCE_TYPES.has(scan.sourceType);

  return (
    <div className="rounded-xl border border-paper-line bg-paper-card p-6 shadow-2xl shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={scan.status} />
        {scan.verdict && <VerdictBadge verdict={scan.verdict} />}
        {isDiffReview && (
          <span className="rounded bg-cobalt/15 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase">
            {scan.sourceType === 'github_pr' ? 'PR review' : 'MR review'} — diff only
          </span>
        )}
        <span className="font-mono text-xs text-muted-on-paper">
          {scan.sourceName} · {scan.framework || 'framework unknown'}
        </span>
        {scan.pullRequestUrl && (
          <a
            href={scan.pullRequestUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-cobalt underline"
          >
            View on {scan.sourceType === 'github_pr' ? 'GitHub' : 'GitLab'}
          </a>
        )}
        {scan.status === 'completed' && (
          <div className="ml-auto flex gap-1.5">
            <button
              onClick={() => downloadReport(scan, 'markdown')}
              className="cursor-pointer rounded-md border border-paper-line px-2.5 py-1 font-mono text-[11px] font-bold text-muted-on-paper hover:text-[#1C2128]"
            >
              .md
            </button>
            <button
              onClick={() => downloadReport(scan, 'html')}
              title="Open in a browser and use Print → Save as PDF for a PDF copy"
              className="cursor-pointer rounded-md border border-paper-line px-2.5 py-1 font-mono text-[11px] font-bold text-muted-on-paper hover:text-[#1C2128]"
            >
              .html
            </button>
            <button
              onClick={() => downloadReport(scan, 'json')}
              className="cursor-pointer rounded-md border border-paper-line px-2.5 py-1 font-mono text-[11px] font-bold text-muted-on-paper hover:text-[#1C2128]"
            >
              .json
            </button>
          </div>
        )}
      </div>

      {(scan.status === 'queued' || scan.status === 'processing') && (
        <div className="mb-2">
          <div className="mb-1 text-sm text-[#1C2128]">
            Reviewing files… {scan.filesScanned}/{scan.fileCount || '?'}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-line">
            <div
              className="h-full rounded-full bg-cobalt transition-all"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            />
          </div>
        </div>
      )}

      {scan.status === 'failed' && (
        <div className="rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-sm text-critical">
          Scan failed: {scan.error}
        </div>
      )}

      {scan.status === 'completed' && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-[#1C2128]">{scan.summary}</p>

          <div className="grid grid-cols-3 gap-3">
            <CostStat label="AI reviewed" value={aiReviewedCount} accent="text-cobalt" />
            <CostStat label="From cache" value={scan.filesFromCache} accent="text-low" />
            <CostStat label="Local checks only" value={scan.filesAiSkipped} accent="text-pass" />
          </div>

          {!isDiffReview && (
            <>
              <AnalysisSection
                title="Dependency vulnerabilities"
                empty="No known-vulnerable dependencies detected (or no lockfile present)."
                show={Boolean(scan.dependencyVulnerabilities?.length)}
              >
                <ul className="space-y-1.5">
                  {scan.dependencyVulnerabilities?.map((v, i) => (
                    <li key={i} className="text-xs text-[#1C2128]">
                      <span className="font-mono font-bold text-critical uppercase">{v.severity}</span>{' '}
                      <span className="font-mono">{v.package}</span> — {v.title}
                      {v.range && <span className="text-muted-on-paper"> ({v.range})</span>}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>

              <AnalysisSection
                title="Circular imports"
                empty="No circular imports detected."
                show={Boolean(scan.circularImports?.length)}
              >
                <ul className="space-y-1">
                  {scan.circularImports?.map((cycle, i) => (
                    <li key={i} className="font-mono text-xs text-[#1C2128]">
                      {cycle.join(' → ')}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>

              <AnalysisSection
                title="Possibly dead files"
                empty="No unused files detected."
                show={Boolean(scan.deadCode?.length)}
              >
                <ul className="space-y-1">
                  {scan.deadCode?.map((path) => (
                    <li key={path} className="font-mono text-xs text-[#1C2128]">
                      {path}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>

              <AnalysisSection
                title="Duplicate code blocks"
                empty="No duplicate blocks detected."
                show={Boolean(scan.duplicates?.length)}
              >
                <ul className="space-y-2">
                  {scan.duplicates?.map((group, i) => (
                    <li key={i} className="font-mono text-xs text-[#1C2128]">
                      {group.occurrences.map((o) => `${o.path}:${o.startLine}-${o.endLine}`).join('  ≈  ')}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            </>
          )}

          <AnalysisSection
            title="Potential hardcoded secrets"
            empty="No obvious secrets detected."
            show={Boolean(scan.secrets?.length)}
          >
            <ul className="space-y-1">
              {scan.secrets?.map((s, i) => (
                <li key={i} className="font-mono text-xs text-critical">
                  [{s.rule}] {s.path}:{s.line} — {s.snippet}
                </li>
              ))}
            </ul>
          </AnalysisSection>

          <div>
            <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              Per-file findings
            </div>
            <div className="space-y-2">
              {(scan.files || []).map((f) => (
                <div key={f.id} className="rounded-lg border border-paper-line">
                  <button
                    onClick={() => setOpenFilePath(openFilePath === f.path ? null : f.path)}
                    className="flex w-full cursor-pointer flex-col gap-1.5 px-3.5 py-2.5 text-left"
                  >
                    <span className="truncate font-mono text-[13px] text-[#1C2128]">{f.path}</span>
                    <div className="flex items-center gap-2.5">
                      {f.verdict && <VerdictBadge verdict={f.verdict} />}
                      <PipelineBadge aiInvoked={f.aiInvoked} fromCache={f.fromCache} />
                      <span className="ml-auto text-xs text-muted-on-paper">{f.findings.length} finding(s)</span>
                    </div>
                  </button>
                  {openFilePath === f.path && (
                    <div className="border-t border-paper-line bg-paper p-3">
                      {FIXABLE_SOURCE_TYPES.has(scan.sourceType) && (
                        <div className="mb-3 flex justify-end">
                          <button
                            onClick={() => setFixingPath(f.path)}
                            className="cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Fix in editor
                          </button>
                        </div>
                      )}
                      {f.stage1 && <Stage1Summary stage1={f.stage1} />}
                      {f.findings.length === 0 ? (
                        <div className="text-xs text-muted-on-paper">No issues in this file.</div>
                      ) : (
                        f.findings.map((finding, i) => <FindingCard key={i} finding={finding} />)
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {fixingPath && (
        <FixInEditorModal
          scanJobId={scan.id}
          path={fixingPath}
          findings={(scan.files || []).find((f) => f.path === fixingPath)?.findings ?? []}
          onClose={() => setFixingPath(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ScanJob['status'] }) {
  const styles: Record<ScanJob['status'], string> = {
    queued: 'bg-muted-on-ink',
    processing: 'bg-cobalt',
    completed: 'bg-pass',
    failed: 'bg-critical',
  };
  return (
    <span
      className={`${styles[status]} rounded px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-white uppercase`}
    >
      {status}
    </span>
  );
}

function CostStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-paper-line bg-paper px-3.5 py-2.5">
      <div className={`font-mono text-lg font-bold ${accent}`}>{value}</div>
      <div className="font-mono text-[10px] tracking-wide text-muted-on-paper uppercase">{label}</div>
    </div>
  );
}

function AnalysisSection({
  title,
  empty,
  show,
  children,
}: {
  title: string;
  empty: string;
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
        {title}
      </div>
      <div className="text-sm text-muted-on-paper">{show ? children : empty}</div>
    </div>
  );
}
