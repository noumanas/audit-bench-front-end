import type { MergeReadinessStatus, PublicScan, Severity } from './types';

export const READINESS: Record<MergeReadinessStatus, { label: string; icon: string; hex: string }> = {
  ready: { label: 'Ready to merge', icon: '✅', hex: '#1f7a4d' },
  ready_with_notes: { label: 'Ready to merge, with notes', icon: '🟡', hex: '#d97706' },
  not_ready: { label: 'Not ready to merge', icon: '⛔', hex: '#c92a3d' },
  merged: { label: 'Already merged', icon: '🟣', hex: '#7c5cd6' },
  closed: { label: 'Closed without merging', icon: '⚪', hex: '#6b7280' },
};

const SEVERITY_LABEL: Record<Severity, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
const ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];
const mergeCell = (pr: NonNullable<PublicScan['pullRequest']>) =>
  pr.merged
    ? 'Merged'
    : pr.state === 'closed'
      ? 'Closed'
      : pr.mergeable === false || pr.mergeableState === 'dirty'
        ? '❌ Conflicts'
        : pr.mergeable === null
          ? '⏳ Not computed yet'
          : '✅ None';
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The review as GitHub-flavoured Markdown, for a visitor to paste into the
 * PR themselves. We never post to someone else's repository on their behalf.
 */
export function buildPrComment(scan: PublicScan, reportUrl: string): string {
  const pr = scan.pullRequest;
  if (!pr?.readiness) return '';
  const r = READINESS[pr.readiness.status];
  const findings = scan.files.flatMap((f) => f.findings.map((x) => ({ ...x, path: f.path })));
  findings.sort((a, b) => ORDER.indexOf(a.severity) - ORDER.indexOf(b.severity));
  const counts = ORDER.map((s) => [s, findings.filter((f) => f.severity === s).length] as const).filter(([, n]) => n);

  const lines = [`### ${r.icon} ${r.label}: Audit Bench Ai review`, ''];
  if (pr.readiness.blockers.length) {
    lines.push('**Fix before merging**', ...pr.readiness.blockers.map((b) => `- ${b}`), '');
  }
  if (pr.readiness.notes.length) {
    lines.push('**Worth a look**', ...pr.readiness.notes.map((n) => `- ${n}`), '');
  }

  const ci = pr.checks;
  const ciTotal = ci.passed + ci.failed.length + ci.pending.length;
  lines.push(
    '| Check | Result |',
    '| --- | --- |',
    `| Merge conflicts | ${mergeCell(pr)} |`,
    `| CI checks | ${ciTotal === 0 ? 'None reported' : [ci.failed.length && `❌ ${ci.failed.length} failing`, ci.pending.length && `⏳ ${ci.pending.length} running`, ci.passed && `✅ ${ci.passed} passed`].filter(Boolean).join(', ')} |`,
    `| Changed lines | ${counts.length ? counts.map(([s, n]) => `${n} ${s}`).join(', ') : '✅ No findings'} in ${plural(pr.filesReviewed, 'file')} |`,
    `| Exposed secrets | ${scan.secrets?.count ? `❌ ${scan.secrets.count}` : '✅ None'} |`,
    '',
  );

  if (findings.length) {
    lines.push('**Top findings**');
    for (const f of findings.slice(0, 5)) {
      lines.push(`- **${SEVERITY_LABEL[f.severity]}**: ${f.title} (\`${f.path}${f.line ? `:${f.line}` : ''}\`)`);
    }
    if (findings.length > 5) lines.push(`- …and ${findings.length - 5} more in the full report`);
    lines.push('');
  }

  lines.push(
    `[See the full report](${reportUrl}) · Automated checks on the changed lines and GitHub's merge status at ${pr.headSha.slice(0, 7)}. Not a substitute for a human review.`,
    '',
    '<sub>Reviewed free by [Audit Bench Ai](https://auditbenchai.com/scan?utm_source=pr_review&utm_medium=comment) · AI code review for security, logic and performance · paste any public PR link to get your own review.</sub>',
  );
  return lines.join('\n');
}
