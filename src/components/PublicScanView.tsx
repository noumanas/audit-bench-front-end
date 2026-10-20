'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getPublicScan } from '@/lib/api';
import { PublicScan, Severity } from '@/lib/types';
import { groupDependencies, SEVERITY_HEX } from '@/lib/dependencyGroups';
import { formatDateTime, timeAgo } from '@/lib/time';
import { useSiteOrigin } from '@/lib/useSiteOrigin';
import { READINESS, buildPrComment } from '@/lib/prComment';
import { FindingCard } from './FindingCard';
import { ScrollReveal } from './gsap/ScrollReveal';
import { PublicScanForm } from './PublicScanForm';
import { ChevronRightIcon, GithubLogoIcon } from './icons';

const RISK: Record<'high' | 'medium' | 'low', { label: string; hex: string }> = {
  high: { label: 'High', hex: '#c92a3d' },
  medium: { label: 'Medium', hex: '#d97706' },
  low: { label: 'Low', hex: '#1f7a4d' },
};
const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

/**
 * Public, shareable report for a scan — the marketing loop: anyone can open
 * it, share it, and sign up from it. Polls while the scan is still running.
 */
export function PublicScanView({ shareId }: { shareId: string }) {
  const [scan, setScan] = useState<PublicScan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () =>
      getPublicScan(shareId)
        .then((s) => {
          if (stopped) return;
          setScan(s);
          if (s.status === 'queued' || s.status === 'processing') timer = setTimeout(tick, 2000);
        })
        .catch((err) => !stopped && setError(err instanceof Error ? err.message : 'This report could not be loaded.'));
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [shareId]);

  if (error) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#E8ECF4]">Report not available</h1>
          <p className="mb-8 text-sm text-muted-on-ink">{error}</p>
          <PublicScanForm />
        </div>
      </Shell>
    );
  }

  if (!scan) {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-6 py-14" aria-busy="true" aria-label="Loading report">
          <div className="mb-3 h-5 w-40 animate-pulse rounded bg-ink-line" />
          <div className="mb-8 h-9 w-2/3 animate-pulse rounded bg-ink-line" />
          <div className="h-48 animate-pulse rounded-xl bg-ink-soft" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header scan={scan} />
      {scan.status === 'completed' ? (
        scan.pullRequest ? (
          <PrReport scan={scan} />
        ) : (
          <Report scan={scan} />
        )
      ) : scan.status === 'failed' ? (
        <div className="bg-paper px-6 py-12">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-6 text-sm text-[#1C2128]">
              This {scan.pullRequest ? 'review' : 'scan'} couldn&apos;t be completed. The{' '}
              {scan.pullRequest ? 'pull request' : 'repository'} may be too large or temporarily unavailable.
            </p>
            <PublicScanForm tone="paper" showExamples={false} />
          </div>
        </div>
      ) : (
        <Progress scan={scan} />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[70vh] bg-ink">{children}</div>;
}

function Header({ scan }: { scan: PublicScan }) {
  const [copied, setCopied] = useState(false);
  // The deployment the reader is on, which is the one that holds this report.
  const origin = useSiteOrigin();
  const url = `${origin}/scan/${scan.shareId}`;
  const pr = scan.pullRequest;
  const text = pr
    ? `Is ${scan.sourceName} ready to merge? Free pull request review by Audit Bench Ai`
    : `Code health report for ${scan.sourceName}, scanned free with Audit Bench Ai`;

  return (
    <section className="border-b border-ink-line px-6 pt-10 pb-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 font-mono text-[11px] font-bold tracking-[0.12em] text-cobalt uppercase">
          {pr ? 'Free pull request review' : 'Free code health report'}
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-3 font-mono text-2xl font-bold break-all text-[#E8ECF4] sm:text-3xl">
              <GithubLogoIcon className="h-6 w-6 shrink-0 text-muted-on-ink" />
              {pr || scan.repoUrl ? (
                <a href={pr?.url ?? scan.repoUrl!} target="_blank" rel="noreferrer" className="hover:underline">
                  {scan.sourceName}
                </a>
              ) : (
                scan.sourceName
              )}
            </h1>
            {pr ? (
              <>
                <p className="mt-2 text-[15px] font-semibold break-words text-[#E8ECF4]">{pr.title}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-on-ink">
                  <span className="max-w-full truncate rounded bg-ink-soft px-1.5 py-0.5 font-mono text-[12px]">
                    {pr.baseRef} ← {pr.headRef}
                  </span>
                  <span>
                    <span className="text-pass">+{pr.additions.toLocaleString()}</span>{' '}
                    <span className="text-critical">−{pr.deletions.toLocaleString()}</span>
                  </span>
                  <span>· {pr.changedFiles.toLocaleString()} files</span>
                  <span>
                    · <span title={formatDateTime(scan.createdAt)}>reviewed {timeAgo(scan.createdAt)}</span>
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-[13px] text-muted-on-ink">
                {[scan.ref && `Branch ${scan.ref}`, scan.framework, `${scan.fileCount.toLocaleString()} files`]
                  .filter(Boolean)
                  .join(' · ')}{' '}
                · <span title={formatDateTime(scan.createdAt)}>scanned {timeAgo(scan.createdAt)}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                void navigator.clipboard.writeText(url).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                })
              }
              className="cursor-pointer rounded-md border border-ink-line px-3 py-2 text-[13px] font-semibold text-[#E8ECF4] hover:border-cobalt"
            >
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-ink-line px-3 py-2 text-[13px] font-semibold text-[#E8ECF4] hover:border-cobalt"
            >
              Share on LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-ink-line px-3 py-2 text-[13px] font-semibold text-[#E8ECF4] hover:border-cobalt"
            >
              Share on X
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Progress({ scan }: { scan: PublicScan }) {
  const pct = scan.fileCount
    ? Math.round((scan.filesScanned / Math.max(scan.filesScanned, Math.min(scan.fileCount, 40))) * 100)
    : 0;
  if (scan.pullRequest) {
    return (
      <section className="px-6 py-14">
        <div className="mx-auto max-w-xl rounded-xl border border-ink-line bg-ink-soft p-6 text-center">
          <div className="mx-auto mb-4 h-2 w-2 animate-ping rounded-full bg-cobalt" />
          <h2 className="mb-1 text-lg font-bold text-[#E8ECF4]">Reviewing {scan.sourceName}…</h2>
          <p className="mb-5 text-[13px] text-muted-on-ink">
            Checking the changed lines for risky code and secrets, alongside merge conflicts and CI results. This
            usually takes a few seconds.
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
            <div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${Math.max(pct, 6)}%` }} />
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted-on-ink">
            {scan.filesScanned} of {scan.fileCount} changed files reviewed
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-xl rounded-xl border border-ink-line bg-ink-soft p-6 text-center">
        <div className="mx-auto mb-4 h-2 w-2 animate-ping rounded-full bg-cobalt" />
        <h2 className="mb-1 text-lg font-bold text-[#E8ECF4]">Scanning {scan.sourceName}…</h2>
        <p className="mb-5 text-[13px] text-muted-on-ink">
          Checking for exposed secrets, vulnerable dependencies, licenses, dead code, duplication and risky code. This
          usually takes under a minute. You can share this page now; it updates by itself.
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
          <div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${Math.max(pct, 6)}%` }} />
        </div>
        <p className="mt-2 font-mono text-[11px] text-muted-on-ink">{scan.filesScanned} files reviewed</p>
      </div>
    </section>
  );
}

function Report({ scan }: { scan: PublicScan }) {
  const risk = scan.riskAggregation;
  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of scan.files) for (const x of f.findings) c[x.severity]++;
    return c;
  }, [scan.files]);
  const deps = useMemo(() => groupDependencies(scan.dependencyVulnerabilities ?? []), [scan.dependencyVulnerabilities]);
  const filesWithFindings = scan.files.filter((f) => f.findings.length > 0);
  const totalFindings = SEVERITIES.reduce((s, k) => s + counts[k], 0);
  const level = risk ? RISK[risk.overallRiskRating] : null;

  return (
    <div className="bg-paper px-6 py-10">
      <ScrollReveal stagger y={20} className="mx-auto max-w-5xl space-y-8">
        {/* Headline numbers */}
        <div className="grid gap-3 md:grid-cols-[1.1fr_2fr]">
          {risk && level && (
            <div className="rounded-xl border bg-paper-card p-5" style={{ borderColor: `${level.hex}66` }}>
              <div className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">Overall risk</div>
              <div className="mt-1 text-4xl font-bold uppercase" style={{ color: level.hex }}>
                {level.label}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1C2128] tabular-nums">{risk.overallHealthScore}</span>
                <span className="text-[13px] text-muted-on-paper">/ 100 health score</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-line">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${risk.overallHealthScore}%`, backgroundColor: level.hex }}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Code findings"
              value={totalFindings}
              tone={counts.critical + counts.high > 0 ? 'bad' : undefined}
            />
            <Stat
              label="Exposed secrets"
              value={scan.secrets?.count ?? 0}
              tone={(scan.secrets?.count ?? 0) > 0 ? 'bad' : 'good'}
            />
            <Stat label="Vulnerable packages" value={deps.length} tone={deps.length > 0 ? 'warn' : 'good'} />
            <Stat
              label="Test files per source file"
              value={
                scan.testCoverage
                  ? scan.testCoverage.testFileRatio >= 1
                    ? `${scan.testCoverage.testFileRatio.toFixed(1)}×`
                    : `${Math.round(scan.testCoverage.testFileRatio * 100)}%`
                  : '—'
              }
              tone={scan.testCoverage?.riskLevel === 'high' ? 'warn' : undefined}
            />
          </div>
        </div>

        <UpgradeNote />

        {risk && (
          <Section title="Risk by area">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {risk.categories.map((c) => {
                const r = c.riskLevel ? RISK[c.riskLevel] : null;
                return (
                  <div key={c.category} className="rounded-lg border border-paper-line bg-paper-card p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#1C2128]">{c.category}</span>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                        style={r ? { color: r.hex, backgroundColor: `${r.hex}17` } : { color: '#8a93a3' }}
                      >
                        {r ? r.label : 'n/a'}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-snug text-muted-on-paper">{c.detail}</p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Secrets">
            {!scan.secrets || scan.secrets.count === 0 ? (
              <Clean>No passwords, keys or tokens found in the code.</Clean>
            ) : (
              <div className="rounded-lg border border-critical/30 bg-critical/5 p-4">
                <p className="text-[13px] text-[#1C2128]">
                  <strong className="text-critical">
                    {scan.secrets.count} potential secret{scan.secrets.count === 1 ? '' : 's'}
                  </strong>{' '}
                  found:{' '}
                  {Object.entries(scan.secrets.types)
                    .map(([t, n]) => `${n} × ${t}`)
                    .join(', ')}
                  .
                </p>
                <p className="mt-1.5 text-[12px] text-muted-on-paper">
                  File locations are hidden on shared reports. The repository owner can sign up and scan it to see
                  exactly where.
                </p>
              </div>
            )}
          </Section>

          <Section title="Vulnerable dependencies">
            {!scan.dependencyVulnerabilities ? (
              <p className="text-[13px] text-muted-on-paper">
                No lockfile was found, so dependencies weren&apos;t checked.
              </p>
            ) : deps.length === 0 ? (
              <Clean>No known-vulnerable package versions.</Clean>
            ) : (
              <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line bg-paper-card">
                {deps.slice(0, 8).map((d) => (
                  <li key={d.pkg} className="flex items-center gap-3 px-3.5 py-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#1C2128]">{d.pkg}</span>
                    <span className="text-[11px] text-muted-on-paper">
                      {d.advisories} advisor{d.advisories === 1 ? 'y' : 'ies'}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: SEVERITY_HEX[d.severity] }}
                    >
                      {d.severity}
                    </span>
                  </li>
                ))}
                {deps.length > 8 && (
                  <li className="px-3.5 py-2 text-[12px] text-muted-on-paper">+ {deps.length - 8} more packages</li>
                )}
              </ul>
            )}
          </Section>

          <Section title="Code health">
            <dl className="grid grid-cols-2 gap-2.5">
              <Fact label="Duplicated blocks" value={scan.duplicates?.length ?? '—'} />
              <Fact label="Possibly dead files" value={scan.deadCode?.length ?? '—'} />
              <Fact label="Circular imports" value={scan.circularImports?.length ?? '—'} />
              <Fact
                label="Tests"
                value={
                  scan.testCoverage
                    ? `${scan.testCoverage.testFileCount} / ${scan.testCoverage.sourceFileCount} files`
                    : '—'
                }
              />
            </dl>
          </Section>

          <Section title="Team">
            {scan.contributors ? (
              <dl className="grid grid-cols-2 gap-2.5">
                {/* GitHub's contributor statistics stop at 100 people. */}
                <Fact label="Contributors" value={scan.contributors.count >= 100 ? '100+' : scan.contributors.count} />
                <Fact label="Top contributor's share" value={`${scan.contributors.topSharePct}% of commits`} />
              </dl>
            ) : (
              <p className="text-[13px] text-muted-on-paper">
                GitHub hadn&apos;t computed contributor stats for this repo yet.
              </p>
            )}
          </Section>
        </div>

        {risk && risk.recommendations.length > 0 && (
          <Section title="What to do first">
            <ol className="space-y-2 rounded-lg border border-paper-line bg-paper-card p-4">
              {risk.recommendations.map((r, i) => (
                <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-[#1C2128]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C2128] font-mono text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ol>
          </Section>
        )}

        <Section title={`Findings by file (${filesWithFindings.length} of ${scan.files.length} reviewed files)`}>
          {filesWithFindings.length === 0 ? (
            <Clean>Local checks found nothing to flag in the reviewed files.</Clean>
          ) : (
            <div className="space-y-2">
              {filesWithFindings.map((f) => (
                <FileFindings key={f.path} file={f} />
              ))}
            </div>
          )}
        </Section>

        <div className="rounded-xl bg-ink p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-[#E8ECF4]">Want the full review?</h2>
          <p className="mx-auto mt-2 max-w-xl text-[13px] text-muted-on-ink">
            Sign up free to add AI review of risky code, scan private repos, review every pull request and commit fixes
            back to your branch.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-cobalt px-5 py-2.5 text-sm font-bold text-white hover:bg-cobalt-dark"
            >
              Sign up free
            </Link>
            <Link
              href="/scan"
              className="rounded-lg border border-ink-line px-5 py-2.5 text-sm font-bold text-[#E8ECF4] hover:border-cobalt"
            >
              Scan another repo
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function PrReport({ scan }: { scan: PublicScan }) {
  const pr = scan.pullRequest!;
  const readiness = pr.readiness;
  const origin = useSiteOrigin();
  const [copied, setCopied] = useState(false);
  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of scan.files) for (const x of f.findings) c[x.severity]++;
    return c;
  }, [scan.files]);
  const comment = useMemo(() => buildPrComment(scan, `${origin}/scan/${scan.shareId}`), [scan, origin]);
  const filesWithFindings = scan.files.filter((f) => f.findings.length > 0);
  const totalFindings = SEVERITIES.reduce((s, k) => s + counts[k], 0);
  const r = readiness ? READINESS[readiness.status] : null;
  const ci = pr.checks;
  const conflicts = pr.mergeable === false || pr.mergeableState === 'dirty';

  return (
    <div className="bg-paper px-6 py-10">
      <ScrollReveal stagger y={20} className="mx-auto max-w-5xl space-y-8">
        {r && readiness && (
          <div className="rounded-xl border-2 bg-paper-card p-5 sm:p-6" style={{ borderColor: `${r.hex}80` }}>
            <div className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">Merge readiness</div>
            <div className="mt-1 text-3xl font-bold sm:text-4xl" style={{ color: r.hex }}>
              {r.label}
            </div>
            {(readiness.blockers.length > 0 || readiness.notes.length > 0) && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {readiness.blockers.length > 0 && (
                  <ReadinessList title="Fix before merging" items={readiness.blockers} hex="#c92a3d" mark="✕" />
                )}
                {readiness.notes.length > 0 && (
                  <ReadinessList title="Worth a look" items={readiness.notes} hex="#d97706" mark="!" />
                )}
              </div>
            )}
            <p className="mt-4 text-[12px] leading-relaxed text-muted-on-paper">
              Based on GitHub&apos;s merge status and CI results at commit{' '}
              <span className="font-mono">{pr.headSha.slice(0, 7)}</span>, plus automated local checks on the changed
              lines. Not a substitute for a human review.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label={pr.merged ? 'Status' : 'Merge conflicts'}
            value={
              pr.merged
                ? 'Merged'
                : pr.state === 'closed'
                  ? 'Closed'
                  : conflicts
                    ? 'Yes'
                    : pr.mergeable === null
                      ? '…'
                      : 'None'
            }
            tone={pr.state === 'closed' ? undefined : conflicts ? 'bad' : pr.mergeable === null ? undefined : 'good'}
          />
          <Stat
            label={
              ci.failed.length ? 'CI checks failing' : ci.pending.length ? 'CI checks running' : 'CI checks passed'
            }
            value={ci.failed.length || ci.pending.length || ci.passed}
            tone={ci.failed.length ? 'bad' : ci.pending.length ? 'warn' : ci.passed ? 'good' : undefined}
          />
          <Stat
            label="Findings in changed lines"
            value={totalFindings}
            tone={counts.critical + counts.high > 0 ? 'bad' : totalFindings > 0 ? 'warn' : 'good'}
          />
          <Stat
            label="Exposed secrets"
            value={scan.secrets?.count ?? 0}
            tone={(scan.secrets?.count ?? 0) > 0 ? 'bad' : 'good'}
          />
        </div>

        {(ci.failed.length > 0 || ci.pending.length > 0) && (
          <Section title="CI checks">
            <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line bg-paper-card">
              {ci.failed.map((name) => (
                <CheckRow key={`f-${name}`} name={name} state="Failing" hex="#c92a3d" />
              ))}
              {ci.pending.map((name) => (
                <CheckRow key={`p-${name}`} name={name} state="Running" hex="#d97706" />
              ))}
              {ci.passed > 0 && <li className="px-3.5 py-2 text-[12px] text-muted-on-paper">+ {ci.passed} passing</li>}
            </ul>
          </Section>
        )}

        {comment && (
          <Section title="Post this review on the pull request">
            <div className="overflow-hidden rounded-lg border border-paper-line bg-paper-card">
              <div className="flex flex-wrap items-center gap-3 border-b border-paper-line px-4 py-3">
                <p className="min-w-[14rem] flex-1 text-[13px] text-[#1C2128]">
                  Copy the review as a GitHub comment, with a link back to this report.
                </p>
                <button
                  onClick={() =>
                    void navigator.clipboard.writeText(comment).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    })
                  }
                  className="cursor-pointer rounded-md bg-cobalt px-3.5 py-1.5 text-[13px] font-bold text-white hover:bg-cobalt-dark"
                >
                  {copied ? 'Comment copied' : 'Copy comment'}
                </button>
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-paper-line px-3.5 py-1.5 text-[13px] font-semibold text-[#1C2128] hover:border-cobalt"
                >
                  Open the PR
                </a>
              </div>
              <pre className="max-h-72 overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-[#1C2128]">
                {comment}
              </pre>
            </div>
          </Section>
        )}

        <UpgradeNote />

        <Section title={`Findings by file (${filesWithFindings.length} of ${scan.files.length} reviewed files)`}>
          {scan.files.length === 0 ? (
            <p className="text-[13px] text-muted-on-paper">
              None of the changed files are in a language the free review reads, so only GitHub&apos;s status was
              checked.
            </p>
          ) : filesWithFindings.length === 0 ? (
            <Clean>Local checks found nothing to flag in the changed lines.</Clean>
          ) : (
            <div className="space-y-2">
              {filesWithFindings.map((f) => (
                <FileFindings key={f.path} file={f} />
              ))}
            </div>
          )}
        </Section>

        <div className="rounded-xl bg-ink p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-[#E8ECF4]">Review every pull request automatically</h2>
          <p className="mx-auto mt-2 max-w-xl text-[13px] text-muted-on-ink">
            Connect GitHub or GitLab and Audit Bench Ai reviews each PR as it opens: AI review of risky changes, inline
            comments, a merge check, and fixes you can commit back to the branch.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-cobalt px-5 py-2.5 text-sm font-bold text-white hover:bg-cobalt-dark"
            >
              Sign up free
            </Link>
            <Link
              href="/scan"
              className="rounded-lg border border-ink-line px-5 py-2.5 text-sm font-bold text-[#E8ECF4] hover:border-cobalt"
            >
              Review another PR
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function ReadinessList({ title, items, hex, mark }: { title: string; items: string[]; hex: string; mark: string }) {
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-bold" style={{ color: hex }}>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[13px] leading-snug text-[#1C2128]">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
              style={{ backgroundColor: hex }}
            >
              {mark}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckRow({ name, state, hex }: { name: string; state: string; hex: string }) {
  return (
    <li className="flex items-center gap-3 px-3.5 py-2">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: hex }} />
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#1C2128]">{name}</span>
      <span className="text-[12px] font-semibold" style={{ color: hex }}>
        {state}
      </span>
    </li>
  );
}

function UpgradeNote() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-cobalt/30 bg-cobalt/5 px-4 py-3">
      <p className="min-w-[14rem] flex-1 text-[13px] text-[#1C2128]">
        <strong>Free scan: local checks only.</strong> Risky functions get an AI review, with root causes and fixes,
        when you sign up. Private repos and pull request reviews too.
      </p>
      <Link href="/signup" className="shrink-0 rounded-md bg-cobalt px-3.5 py-1.5 text-[13px] font-bold text-white">
        Get the AI review
      </Link>
    </div>
  );
}

function FileFindings({ file }: { file: PublicScan['files'][number] }) {
  const [open, setOpen] = useState(false);
  const worst = SEVERITIES.find((s) => file.findings.some((f) => f.severity === s)) ?? 'low';
  return (
    <div className="overflow-hidden rounded-lg border border-paper-line bg-paper-card">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-paper"
      >
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: SEVERITY_HEX[worst] }} />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#1C2128]">{file.path}</span>
        <span className="text-[12px] text-muted-on-paper">
          {file.findings.length} finding{file.findings.length === 1 ? '' : 's'}
        </span>
        <ChevronRightIcon className={`h-4 w-4 text-muted-on-paper transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-paper-line px-3 pt-3 pb-1">
          {file.findings.map((f, i) => (
            <FindingCard key={i} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: 'bad' | 'warn' | 'good' }) {
  const color = tone === 'bad' ? '#c92a3d' : tone === 'warn' ? '#d97706' : tone === 'good' ? '#1f7a4d' : '#1C2128';
  return (
    <div className="rounded-xl border border-paper-line bg-paper-card p-4">
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-[12px] text-muted-on-paper">{label}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-paper-line bg-paper-card px-3.5 py-2.5">
      <dd className="text-lg font-bold text-[#1C2128] tabular-nums">{value}</dd>
      <dt className="text-[11px] text-muted-on-paper">{label}</dt>
    </div>
  );
}

function Clean({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-pass/30 bg-pass/10 px-3.5 py-2.5 text-[13px] text-[#1C2128]">
      <span className="font-bold text-pass">✓</span>
      {children}
    </p>
  );
}
