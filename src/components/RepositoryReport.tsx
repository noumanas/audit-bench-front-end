'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FindingStatuses,
  FindingStatus,
  ScanJob,
  ScanFile,
  Severity,
  ContributorStat,
  TestCoverageEstimate,
  ArchitectureAssessment,
  RiskAggregation,
  DependencyVulnerability,
} from '@/lib/types';
import { VerdictBadge } from './VerdictBadge';
import { SeverityBadge } from './SeverityBadge';
import { ChevronRightIcon } from './icons';
import { FindingCard } from './FindingCard';
import { PipelineBadge } from './PipelineBadge';
import { Stage1Summary } from './Stage1Summary';
import { FixInEditorModal } from './FixInEditorModal';
import { downloadReport } from '@/lib/reportExport';
import { ShareScanPanel } from './ShareScanPanel';
import { setScanFileFindingStatus } from '@/lib/api';
import { SEVERITY_HEX, groupDependencies } from '@/lib/dependencyGroups';
import { TokenUsageNote } from './TokenUsageNote';

const DIFF_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['github_pr', 'gitlab_mr']);
// Fixing requires a remote to commit to — a .zip upload has none.
const FIXABLE_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['github_repo', 'github_pr', 'gitlab_repo', 'gitlab_mr']);
// contributorStats is only ever populated for these — see RepositoryService/
// GithubController/GitlabController. A .zip upload has no git host to pull
// commit stats from, and a PR/MR diff review never fetches them at all.
const CONTRIBUTOR_STATS_SOURCE_TYPES = new Set<ScanJob['sourceType']>(['github_repo', 'gitlab_repo']);

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];
const SEVERITY_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

const SOURCE_LABEL: Record<ScanJob['sourceType'], string> = {
  zip: 'Repository scan · .zip upload',
  github_repo: 'Repository scan · GitHub',
  gitlab_repo: 'Repository scan · GitLab',
  github_pr: 'Pull request review · diff only',
  gitlab_mr: 'Merge request review · diff only',
};

function severityCounts(findings: { severity: Severity }[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

function worstRank(file: ScanFile): number {
  return file.findings.reduce((max, f) => Math.max(max, SEVERITY_RANK[f.severity]), 0);
}

export function RepositoryReport({ scan }: { scan: ScanJob }) {
  const [openFilePath, setOpenFilePath] = useState<string | null>(null);
  const [fixingPath, setFixingPath] = useState<string | null>(null);
  const [showCleanFiles, setShowCleanFiles] = useState(false);
  // Overlays scan.files[].findingStatuses — usePollScan owns `scan`, so triage
  // updates are tracked here rather than mutating a prop we don't control.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, FindingStatuses>>({});
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const handleStatusChange = async (scanFileId: string, index: number, status: FindingStatus) => {
    const key = `${scanFileId}:${index}`;
    setUpdatingKey(key);
    try {
      const updated = await setScanFileFindingStatus(scanFileId, index, status);
      setStatusOverrides((prev) => ({ ...prev, [scanFileId]: updated.findingStatuses ?? {} }));
    } catch {
      // Non-critical — the dropdown just won't reflect the change; the card stays interactive to retry.
    } finally {
      setUpdatingKey(null);
    }
  };

  const progressPct = scan.fileCount > 0 ? Math.round((scan.filesScanned / Math.min(scan.fileCount, 9999)) * 100) : 0;
  const aiReviewedCount = Math.max(0, scan.filesScanned - scan.filesFromCache - scan.filesAiSkipped);
  const isDiffReview = DIFF_SOURCE_TYPES.has(scan.sourceType);

  const files = scan.files || [];
  const allFindings = files.flatMap((f) => f.findings);
  const counts = severityCounts(allFindings);
  const filesWithFindings = files.filter((f) => f.findings.length > 0).length;
  // Worst file first, so the files worth opening are at the top instead of
  // wherever they happen to sit alphabetically among clean ones.
  const sortedFiles = [...files].sort(
    (a, b) => worstRank(b) - worstRank(a) || b.findings.length - a.findings.length || a.path.localeCompare(b.path),
  );
  const visibleFiles =
    showCleanFiles || filesWithFindings === 0 ? sortedFiles : sortedFiles.filter((f) => f.findings.length > 0);

  return (
    <article className="print-exact overflow-hidden rounded-xl border border-paper-line bg-paper-card shadow-2xl shadow-black/40 print:rounded-none print:border-0 print:shadow-none">
      {/* Header band */}
      <header className="bg-ink px-6 pt-6 pb-5 text-[#E8ECF4] sm:px-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-muted-on-ink uppercase">
            {SOURCE_LABEL[scan.sourceType]}
          </span>
          <StatusBadge status={scan.status} />
          {scan.verdict && <VerdictBadge verdict={scan.verdict} />}
        </div>

        <h1 className="mb-5 text-2xl leading-tight font-bold tracking-tight break-words sm:text-[26px]">
          {scan.sourceName}
        </h1>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-line pt-4">
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            <Meta label="Framework" value={scan.framework || 'Not detected'} />
            <Meta
              label="Files"
              value={`${scan.filesScanned.toLocaleString('en-US')} of ${scan.fileCount.toLocaleString('en-US')}`}
            />
            <Meta
              label="Scanned"
              value={new Date(scan.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            />
            {(scan.inputTokens > 0 || scan.outputTokens > 0) && (
              <div className="min-w-0">
                <dt className="mb-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-on-ink uppercase">
                  AI tokens
                </dt>
                <dd className="text-[13px] font-semibold [&_span]:text-[13px] [&_span]:text-[#E8ECF4]">
                  <TokenUsageNote inputTokens={scan.inputTokens} outputTokens={scan.outputTokens} />
                </dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {scan.pullRequestUrl && (
              <a
                href={scan.pullRequestUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-ink-line px-3 py-1.5 text-xs font-bold text-muted-on-ink transition-colors hover:border-cobalt hover:text-[#E8ECF4]"
              >
                View on {scan.sourceType === 'github_pr' ? 'GitHub' : 'GitLab'} ↗
              </a>
            )}
            {!isDiffReview && scan.status === 'completed' && (
              <Link
                href={`/app/due-diligence/${scan.id}`}
                className="rounded-md border border-ink-line px-3 py-1.5 text-xs font-bold text-muted-on-ink transition-colors hover:border-cobalt hover:text-[#E8ECF4]"
              >
                Due diligence view →
              </Link>
            )}
            {scan.status === 'completed' && (
              <a
                href="#share"
                className="rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-cobalt-dark"
              >
                Share report
              </a>
            )}
            {scan.status === 'completed' && (
              <div
                className="flex overflow-hidden rounded-md border border-ink-line"
                role="group"
                aria-label="Export report"
              >
                <ExportButton label=".md" onClick={() => downloadReport(scan, 'markdown')} />
                <ExportButton
                  label=".html"
                  title="Open in a browser and use Print → Save as PDF for a PDF copy"
                  onClick={() => downloadReport(scan, 'html')}
                />
                <ExportButton label=".json" onClick={() => downloadReport(scan, 'json')} />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-8 p-6 sm:p-8">
        {(scan.status === 'queued' || scan.status === 'processing') && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between text-sm text-[#1C2128]">
              <span>Reviewing files…</span>
              <span className="font-mono text-xs text-muted-on-paper tabular-nums">
                {scan.filesScanned}/{scan.fileCount || '?'}
              </span>
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
          <>
            {/* Overview */}
            <section className="space-y-4">
              {scan.summary && <p className="max-w-[72ch] text-sm leading-relaxed text-[#1C2128]">{scan.summary}</p>}

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {SEVERITY_ORDER.map((s) => (
                  <CountTile key={s} label={s} value={counts[s]} hex={SEVERITY_HEX[s]} />
                ))}
                <CountTile
                  label="Secrets"
                  value={scan.secrets?.length ?? 0}
                  hex={SEVERITY_HEX.critical}
                  className="col-span-2 sm:col-span-1"
                />
              </div>

              <PipelineBar aiReviewed={aiReviewedCount} cached={scan.filesFromCache} localOnly={scan.filesAiSkipped} />
            </section>

            <ShareScanPanel
              scanId={scan.id}
              sourceName={scan.sourceName}
              initialShareId={scan.shareId}
              initiallyPublic={scan.isPublic}
            />

            {!isDiffReview && scan.riskAggregation && (
              <section>
                <SectionTitle>Risk assessment</SectionTitle>
                <RiskAssessmentBanner aggregation={scan.riskAggregation} />
              </section>
            )}

            {!isDiffReview && (
              <section>
                <SectionTitle>Dependencies &amp; licenses</SectionTitle>
                <div className="space-y-2">
                  <AnalysisSection
                    title="Dependency vulnerabilities"
                    empty={
                      scan.dependencyVulnerabilities === null
                        ? 'No dependency scan available for this scan.'
                        : 'No known-vulnerable dependencies detected (or no lockfile present).'
                    }
                    show={Boolean(scan.dependencyVulnerabilities?.length)}
                    badge={statusPill(scan.dependencyVulnerabilities, 'critical')}
                  >
                    <DependencyList vulns={scan.dependencyVulnerabilities ?? []} />
                  </AnalysisSection>

                  <AnalysisSection
                    title="License compliance"
                    empty={
                      scan.licenseFindings === null
                        ? 'No license compliance check available for this scan.'
                        : 'No copyleft or unclear-license dependencies flagged.'
                    }
                    show={Boolean(scan.licenseFindings?.length)}
                    badge={statusPill(scan.licenseFindings, 'high')}
                  >
                    <ul className="divide-y divide-paper-line">
                      {scan.licenseFindings?.map((f, i) => (
                        <li
                          key={i}
                          className="flex flex-wrap items-baseline gap-2 py-2 text-xs text-[#1C2128] first:pt-0 last:pb-0"
                        >
                          <SeverityBadge level={f.riskLevel} />
                          <span className="font-mono font-bold">
                            {f.package}@{f.version}
                          </span>
                          <span className="font-mono text-muted-on-paper">[{f.license}]</span>
                          <span className="text-muted-on-paper">— {f.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </AnalysisSection>
                </div>
              </section>
            )}

            {!isDiffReview && (
              <section>
                <SectionTitle>Code health</SectionTitle>
                <div className="space-y-2">
                  <AnalysisSection
                    title="Test coverage (estimate)"
                    empty="No test-coverage estimate available for this scan."
                    show={Boolean(scan.testCoverage)}
                    badge={scan.testCoverage ? <SeverityBadge level={scan.testCoverage.riskLevel} /> : <NaPill />}
                  >
                    {scan.testCoverage && <TestCoverageSummary coverage={scan.testCoverage} />}
                  </AnalysisSection>

                  <AnalysisSection
                    title="Architecture consistency"
                    empty="No architecture assessment for this scan — it only runs when the scan already needed a fresh AI review."
                    show={Boolean(scan.architectureAssessment)}
                    badge={
                      scan.architectureAssessment ? (
                        <SeverityBadge level={scan.architectureAssessment.riskLevel} />
                      ) : (
                        <NaPill />
                      )
                    }
                  >
                    {scan.architectureAssessment && <ArchitectureSummary assessment={scan.architectureAssessment} />}
                  </AnalysisSection>

                  <AnalysisSection
                    title="Circular imports"
                    empty="No circular imports detected."
                    show={Boolean(scan.circularImports?.length)}
                    badge={statusPill(scan.circularImports, 'high')}
                  >
                    <ul className="space-y-1.5">
                      {scan.circularImports?.map((cycle, i) => (
                        <li key={i} className="font-mono text-xs break-all text-[#1C2128]">
                          {cycle.join(' → ')}
                        </li>
                      ))}
                    </ul>
                  </AnalysisSection>

                  <AnalysisSection
                    title="Possibly dead files"
                    empty="No unused files detected."
                    show={Boolean(scan.deadCode?.length)}
                    badge={statusPill(scan.deadCode, 'medium')}
                  >
                    <ul className="space-y-1">
                      {scan.deadCode?.map((path) => (
                        <li key={path} className="font-mono text-xs break-all text-[#1C2128]">
                          {path}
                        </li>
                      ))}
                    </ul>
                  </AnalysisSection>

                  <AnalysisSection
                    title="Duplicate code blocks"
                    empty="No duplicate blocks detected."
                    show={Boolean(scan.duplicates?.length)}
                    badge={statusPill(scan.duplicates, 'medium')}
                  >
                    <ul className="divide-y divide-paper-line">
                      {scan.duplicates?.map((group, i) => (
                        <li key={i} className="py-2 first:pt-0 last:pb-0">
                          <div className="mb-1 font-mono text-[10px] tracking-wide text-muted-on-paper uppercase">
                            {group.linesOfCode} lines · {group.occurrences.length} copies
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {group.occurrences.map((o) => (
                              <span
                                key={`${o.path}:${o.startLine}`}
                                className="font-mono text-xs break-all text-[#1C2128]"
                              >
                                {o.path}:{o.startLine}–{o.endLine}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AnalysisSection>
                </div>
              </section>
            )}

            <section>
              <SectionTitle>
                {CONTRIBUTOR_STATS_SOURCE_TYPES.has(scan.sourceType) ? 'Team & secrets' : 'Secrets'}
              </SectionTitle>
              <div className="space-y-2">
                {CONTRIBUTOR_STATS_SOURCE_TYPES.has(scan.sourceType) && (
                  <AnalysisSection
                    title="Contributor concentration"
                    empty="No contributor data available for this repository."
                    show={Boolean(scan.contributorStats?.length)}
                    badge={
                      scan.contributorStats?.length ? <ConcentrationPill stats={scan.contributorStats} /> : <NaPill />
                    }
                  >
                    <ContributorConcentration stats={scan.contributorStats ?? []} />
                  </AnalysisSection>
                )}

                <AnalysisSection
                  title="Potential hardcoded secrets"
                  empty="No obvious secrets detected."
                  show={Boolean(scan.secrets?.length)}
                  badge={statusPill(scan.secrets, 'critical')}
                >
                  <ul className="divide-y divide-paper-line">
                    {scan.secrets?.map((s, i) => (
                      <li key={i} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="rounded bg-critical/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-critical uppercase">
                            {s.rule}
                          </span>
                          <span className="font-mono text-xs break-all text-[#1C2128]">
                            {s.path}:{s.line}
                          </span>
                        </div>
                        <code className="mt-1 block truncate font-mono text-[11px] text-muted-on-paper">
                          {s.snippet}
                        </code>
                      </li>
                    ))}
                  </ul>
                </AnalysisSection>
              </div>
            </section>

            {/* Per-file findings */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <SectionTitle className="mb-0">
                  Files{' '}
                  <span className="font-normal text-muted-on-paper normal-case">
                    · {filesWithFindings} with findings of {files.length}
                  </span>
                </SectionTitle>
                {filesWithFindings > 0 && filesWithFindings < files.length && (
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-on-paper print:hidden">
                    <input
                      id="show-clean-files"
                      type="checkbox"
                      checked={showCleanFiles}
                      onChange={(e) => setShowCleanFiles(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#2b5be3]"
                    />
                    Show {files.length - filesWithFindings} clean file
                    {files.length - filesWithFindings === 1 ? '' : 's'}
                  </label>
                )}
              </div>

              <div className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line">
                {visibleFiles.map((f) => {
                  const isOpen = openFilePath === f.path;
                  const fileCounts = severityCounts(f.findings);
                  return (
                    <div key={f.id}>
                      <button
                        onClick={() => setOpenFilePath(isOpen ? null : f.path)}
                        aria-expanded={isOpen}
                        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-paper ${
                          isOpen ? 'bg-paper' : ''
                        }`}
                      >
                        <ChevronRightIcon
                          className={`h-3.5 w-3.5 shrink-0 text-muted-on-paper transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
                        />
                        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#1C2128]">{f.path}</span>
                        <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                          {SEVERITY_ORDER.filter((s) => fileCounts[s] > 0).map((s) => (
                            <span
                              key={s}
                              title={`${fileCounts[s]} ${s}`}
                              className="inline-flex items-center gap-1 rounded-full border border-paper-line px-2 py-0.5 font-mono text-[10px] font-bold text-[#1C2128] tabular-nums"
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SEVERITY_HEX[s] }} />
                              {fileCounts[s]}
                            </span>
                          ))}
                        </span>
                        <PipelineBadge aiInvoked={f.aiInvoked} fromCache={f.fromCache} />
                        {f.verdict && <VerdictBadge verdict={f.verdict} />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-paper-line bg-paper px-4 py-4">
                          {FIXABLE_SOURCE_TYPES.has(scan.sourceType) && (
                            <div className="mb-3 flex justify-end">
                              <button
                                onClick={() => setFixingPath(f.path)}
                                className="cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white hover:bg-cobalt-dark"
                              >
                                Fix in editor
                              </button>
                            </div>
                          )}
                          {f.stage1 && <Stage1Summary stage1={f.stage1} />}
                          {f.findings.length === 0 ? (
                            <div className="text-xs text-muted-on-paper">No issues in this file.</div>
                          ) : (
                            f.findings.map((finding, i) => {
                              const statuses = statusOverrides[f.id] ?? f.findingStatuses ?? {};
                              return (
                                <FindingCard
                                  key={i}
                                  finding={finding}
                                  status={statuses[i] ?? 'open'}
                                  onStatusChange={(status) => handleStatusChange(f.id, i, status)}
                                  statusUpdating={updatingKey === `${f.id}:${i}`}
                                />
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {visibleFiles.length === 0 && (
                  <div className="px-4 py-3 text-xs text-muted-on-paper">No files in this scan.</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {fixingPath && (
        <FixInEditorModal
          scanJobId={scan.id}
          path={fixingPath}
          findings={files.find((f) => f.path === fixingPath)?.findings ?? []}
          onClose={() => setFixingPath(null)}
        />
      )}
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="mb-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-on-ink uppercase">{label}</dt>
      <dd className="truncate text-[13px] font-semibold">{value}</dd>
    </div>
  );
}

function ExportButton({ label, title, onClick }: { label: string; title?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="cursor-pointer border-r border-ink-line px-2.5 py-1.5 font-mono text-[11px] font-bold text-muted-on-ink transition-colors last:border-r-0 hover:bg-ink-soft hover:text-[#E8ECF4]"
    >
      {label}
    </button>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`mb-3 font-mono text-[11px] font-bold tracking-[0.08em] text-[#1C2128] uppercase ${className ?? ''}`}
    >
      {children}
    </h2>
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

function CountTile({
  label,
  value,
  hex,
  className,
}: {
  label: string;
  value: number;
  hex: string;
  className?: string;
}) {
  const active = value > 0;
  return (
    <div className={`rounded-lg border border-paper-line bg-paper px-3 py-2.5 ${className ?? ''}`}>
      <div className="text-2xl leading-none font-bold tabular-nums" style={{ color: active ? hex : '#b4bac4' }}>
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: active ? hex : '#d3d7de' }} />
        {label}
      </div>
    </div>
  );
}

/** How the scanned files were handled — the cost story in one bar instead of three loose stats. */
function PipelineBar({ aiReviewed, cached, localOnly }: { aiReviewed: number; cached: number; localOnly: number }) {
  const total = aiReviewed + cached + localOnly;
  if (total === 0) return null;
  const parts = [
    { label: 'AI reviewed', value: aiReviewed, hex: '#2b5be3' },
    { label: 'From cache', value: cached, hex: '#2e6fab' },
    { label: 'Local checks only', value: localOnly, hex: '#1f7a4d' },
  ];
  return (
    <div className="rounded-lg border border-paper-line px-4 py-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
          Review pipeline
        </span>
        <span className="text-[11px] text-muted-on-paper">
          {cached + localOnly} of {total} files cost no AI credit
        </span>
      </div>
      <div className="mb-2 flex h-2 w-full overflow-hidden rounded-full bg-paper-line">
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <div
              key={p.label}
              className="h-full [&:not(:first-child)]:ml-0.5"
              style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.hex }}
            />
          ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-1.5 text-xs text-[#1C2128]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.hex }} />
            {p.label} <span className="font-mono font-bold tabular-nums">{p.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function CountPill({ n, tone }: { n: number; tone: 'critical' | 'high' | 'medium' }) {
  const cls = {
    critical: 'border-critical/30 bg-critical/10 text-critical',
    high: 'border-high/30 bg-high/10 text-high',
    medium: 'border-medium/30 bg-medium/10 text-medium',
  }[tone];
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ${cls}`}>{n}</span>
  );
}

function CleanPill() {
  return (
    <span className="rounded-full border border-pass/30 bg-pass/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-pass uppercase">
      Clean
    </span>
  );
}

function NaPill() {
  return (
    <span className="rounded-full border border-paper-line px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-muted-on-paper uppercase">
      N/A
    </span>
  );
}

/** null = the check didn't run, [] = it ran and found nothing — two different statements. */
function statusPill(items: unknown[] | null, tone: 'critical' | 'high' | 'medium') {
  if (items === null) return <NaPill />;
  if (items.length === 0) return <CleanPill />;
  return <CountPill n={items.length} tone={tone} />;
}

function ConcentrationPill({ stats }: { stats: ContributorStat[] }) {
  const total = stats.reduce((sum, s) => sum + s.commits, 0);
  if (total === 0) return <NaPill />;
  const top = Math.max(...stats.map((s) => s.commits)) / total;
  if (top >= 0.5) return <SeverityBadge level="high" />;
  if (top >= 0.3) return <SeverityBadge level="medium" />;
  return <SeverityBadge level="low" />;
}

function DependencyList({ vulns }: { vulns: DependencyVulnerability[] }) {
  const groups = groupDependencies(vulns);
  return (
    <div>
      <ul className="divide-y divide-paper-line">
        {groups.map((g) => (
          <li key={g.pkg} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-white uppercase"
                style={{ backgroundColor: SEVERITY_HEX[g.severity] }}
              >
                {g.severity}
              </span>
              <span className="font-mono text-[13px] font-bold text-[#1C2128]">{g.pkg}</span>
              <span className="font-mono text-[11px] text-muted-on-paper">
                {g.advisories} advisor{g.advisories === 1 ? 'y' : 'ies'}
                {g.ranges.length > 0 && ` · affected ${g.ranges.slice(0, 2).join(', ')}`}
              </span>
            </div>
            <ul className="mt-1 space-y-0.5 pl-1">
              {g.titles.slice(0, 3).map((t) => (
                <li key={t} className="text-xs leading-snug text-muted-on-paper">
                  {t}
                </li>
              ))}
              {g.titles.length > 3 && <li className="text-xs text-muted-on-paper">+ {g.titles.length - 3} more</li>}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-muted-on-paper">
        {vulns.length} advisories across {groups.length} package{groups.length === 1 ? '' : 's'}.
      </p>
    </div>
  );
}

const RISK_RATING_STYLES: Record<'high' | 'medium' | 'low', { bg: string; text: string; hex: string }> = {
  high: { bg: 'bg-critical/10 border-critical/30', text: 'text-critical', hex: '#c92a3d' },
  medium: { bg: 'bg-high/10 border-high/30', text: 'text-high', hex: '#d97706' },
  low: { bg: 'bg-pass/10 border-pass/30', text: 'text-pass', hex: '#1f7a4d' },
};

/** Top-of-report rollup: the overall rating, health score, remediation estimate, and per-category breakdown from RiskAggregation. */
export function RiskAssessmentBanner({ aggregation }: { aggregation: RiskAggregation }) {
  const style = RISK_RATING_STYLES[aggregation.overallRiskRating];
  const { remediation } = aggregation;
  const days = Math.round(remediation.totalEstimatedDays * 100) / 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-3">
        <div className={`rounded-lg border px-4 py-3 ${style.bg}`}>
          <div className="font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
            Overall risk
          </div>
          <div className={`mt-1 text-2xl leading-none font-bold uppercase ${style.text}`}>
            {aggregation.overallRiskRating}
          </div>
        </div>
        <div className="rounded-lg border border-paper-line bg-paper px-4 py-3">
          <div className="font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
            Health score
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl leading-none font-bold text-[#1C2128] tabular-nums">
              {aggregation.overallHealthScore}
            </span>
            <span className="text-xs text-muted-on-paper">/100</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-line">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(aggregation.overallHealthScore, 2)}%`,
                backgroundColor:
                  aggregation.overallHealthScore >= 80
                    ? '#1f7a4d'
                    : aggregation.overallHealthScore >= 50
                      ? '#d97706'
                      : '#c92a3d',
              }}
            />
          </div>
        </div>
        <div className="rounded-lg border border-paper-line bg-paper px-4 py-3">
          <div className="font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
            Est. remediation
          </div>
          <div className="mt-1 text-lg leading-tight font-bold text-[#1C2128] tabular-nums">
            ${remediation.estimatedCostLowUsd.toLocaleString('en-US')}–$
            {remediation.estimatedCostHighUsd.toLocaleString('en-US')}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-on-paper">{days} engineer-days</div>
        </div>
      </div>

      <p className="max-w-[72ch] text-sm leading-relaxed text-[#1C2128]">{aggregation.summary}</p>

      <div className="flex flex-wrap gap-2">
        {aggregation.categories.map((c) => (
          <span
            key={c.category}
            title={c.detail}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
              c.riskLevel === null
                ? 'border-paper-line text-muted-on-paper'
                : `${RISK_RATING_STYLES[c.riskLevel].bg} ${RISK_RATING_STYLES[c.riskLevel].text}`
            }`}
          >
            {c.category}: {c.riskLevel ?? 'n/a'}
          </span>
        ))}
      </div>

      {aggregation.recommendations.length > 0 && (
        <ol className="space-y-1.5 rounded-lg bg-paper px-4 py-3">
          {aggregation.recommendations.map((r, i) => (
            <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-[#1C2128]">
              <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1C2128] font-mono text-[9px] font-bold text-white">
                {i + 1}
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** LLM-judged architecture consistency read, sampled across the scan's files. */
export function ArchitectureSummary({ assessment }: { assessment: ArchitectureAssessment }) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge level={assessment.riskLevel} />
        <span className="text-xs text-[#1C2128]">Consistency score: {assessment.consistencyScore}/100</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-on-paper">{assessment.summary}</p>
      {assessment.inconsistencies.length > 0 && (
        <ul className="space-y-2">
          {assessment.inconsistencies.map((inc, i) => (
            <li key={i} className="rounded-md border border-paper-line bg-paper px-3 py-2">
              <div className="mb-1 text-xs font-bold text-[#1C2128]">{inc.title}</div>
              <div className="mb-1 text-xs leading-relaxed text-muted-on-paper">{inc.description}</div>
              {inc.files.length > 0 && (
                <div className="font-mono text-[11px] break-all text-muted-on-paper">{inc.files.join(', ')}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Static, no-execution test-coverage read: file-count ratio plus whether a coverage tool/CI step backs it up. */
export function TestCoverageSummary({ coverage }: { coverage: TestCoverageEstimate }) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge level={coverage.riskLevel} />
        <span className="text-xs text-[#1C2128]">
          {coverage.testFileCount} test file{coverage.testFileCount === 1 ? '' : 's'} / {coverage.sourceFileCount}{' '}
          source file{coverage.sourceFileCount === 1 ? '' : 's'} ({Math.round(coverage.testFileRatio * 100)}%)
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-on-paper">{coverage.reason}</p>
      <div className="flex flex-wrap gap-2">
        <CheckChip ok={coverage.hasCoverageConfig} label="Coverage config" />
        <CheckChip ok={coverage.hasCiTestStep} label="CI test step" />
      </div>
      {coverage.untestedDirectories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-on-paper">
          <span>No tests found under</span>
          {coverage.untestedDirectories.map((d) => (
            <code
              key={d}
              className="rounded border border-paper-line bg-paper px-1.5 py-0.5 font-mono text-[11px] text-[#1C2128]"
            >
              {d}
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        ok ? 'border-pass/30 bg-pass/10 text-pass' : 'border-critical/30 bg-critical/10 text-critical'
      }`}
    >
      <span className="font-bold">{ok ? '✓' : '✗'}</span>
      {label} {ok ? 'found' : 'missing'}
    </span>
  );
}

/** Bus-factor read on a repo scan: who owns the commit history, and how thin. */
export function ContributorConcentration({ stats }: { stats: ContributorStat[] }) {
  const sorted = [...stats].sort((a, b) => b.commits - a.commits);
  const total = sorted.reduce((sum, s) => sum + s.commits, 0);
  if (total === 0) return null;

  const topShare = sorted[0].commits / total;
  const risk =
    topShare >= 0.5
      ? { label: 'High concentration risk', color: 'text-critical', hex: '#c92a3d' }
      : topShare >= 0.3
        ? { label: 'Moderate concentration', color: 'text-high', hex: '#d97706' }
        : null;

  return (
    <div className="space-y-2.5">
      {risk && (
        <div className={`font-mono text-[11px] font-bold uppercase ${risk.color}`}>
          {risk.label} — {sorted[0].author} authored {Math.round(topShare * 100)}% of commits
        </div>
      )}
      {sorted.slice(0, 8).map((c, i) => {
        const pct = (c.commits / total) * 100;
        return (
          <div key={c.author} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3">
            <span className="truncate font-mono text-xs text-[#1C2128]">{c.author}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-paper-line">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: i === 0 && risk ? risk.hex : '#2b5be3' }}
              />
            </div>
            <span className="w-24 text-right text-xs text-muted-on-paper tabular-nums">
              {c.commits} · {Math.round(pct)}%
            </span>
          </div>
        );
      })}
      {sorted.length > 8 && (
        <div className="text-xs text-muted-on-paper">+ {sorted.length - 8} more contributor(s)</div>
      )}
    </div>
  );
}

/**
 * Collapsible by default — this report grew to 10+ of these over the
 * course of a few sessions, and having every one always fully expanded
 * turned a scan with mostly clean results into a long scroll of "nothing
 * found" text. Starts open only when there's something worth seeing
 * (`show`); collapsed sections still surface their status pill and the
 * empty-state text inline, so confirming "checked, and it's clean" never
 * requires a click.
 */
function AnalysisSection({
  title,
  empty,
  show,
  badge,
  children,
}: {
  title: string;
  empty: string;
  show: boolean;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(show);
  return (
    <div className="overflow-hidden rounded-lg border border-paper-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-paper"
      >
        <ChevronRightIcon
          className={`h-3.5 w-3.5 shrink-0 text-muted-on-paper transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        <span className="shrink-0 text-[13px] font-semibold text-[#1C2128]">{title}</span>
        {!open && !show && <span className="min-w-0 truncate text-xs text-muted-on-paper">{empty}</span>}
        <span className="ml-auto shrink-0">{badge}</span>
      </button>
      {open && (
        <div className="border-t border-paper-line px-4 py-3.5 text-sm text-muted-on-paper">
          {show ? children : empty}
        </div>
      )}
    </div>
  );
}
