import { ScanJob } from './types';

const VERDICT_LABEL: Record<string, string> = {
  pass: 'Pass',
  needs_work: 'Needs work',
  do_not_ship: 'Do not ship',
};

function buildMarkdownReport(scan: ScanJob): string {
  const lines: string[] = [
    `# audit/bench report — ${scan.sourceName}`,
    '',
    `- **Verdict:** ${scan.verdict ? VERDICT_LABEL[scan.verdict] : scan.status}`,
    `- **Framework:** ${scan.framework || 'unknown'}`,
    `- **Files scanned:** ${scan.filesScanned}/${scan.fileCount}`,
    `- **Scanned:** ${new Date(scan.createdAt).toLocaleString()}`,
  ];
  if (scan.pullRequestUrl) lines.push(`- **Source:** [${scan.sourceName}](${scan.pullRequestUrl})`);
  lines.push('', scan.summary || '', '');

  for (const f of scan.files || []) {
    lines.push(`## ${f.path}`, '');
    if (f.findings.length === 0) {
      lines.push('No issues in this file.', '');
      continue;
    }
    for (const finding of f.findings) {
      lines.push(
        `### ${finding.severity.toUpperCase()} · ${finding.category} — ${finding.title}${finding.line != null ? ` (line ${finding.line})` : ''}`,
        '',
        finding.description,
        '',
        `**Suggested fix:** ${finding.suggestedFix}`,
        '',
      );
      if (finding.examplePatch) {
        lines.push('```diff', finding.examplePatch, '```', '');
      }
    }
  }

  return lines.join('\n');
}

function buildJsonReport(scan: ScanJob): string {
  return JSON.stringify(scan, null, 2);
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadReport(scan: ScanJob, format: 'markdown' | 'json'): void {
  const safeName = scan.sourceName.replace(/[^a-z0-9._-]+/gi, '-');
  if (format === 'markdown') {
    triggerDownload(`audit-bench-${safeName}.md`, buildMarkdownReport(scan), 'text/markdown');
  } else {
    triggerDownload(`audit-bench-${safeName}.json`, buildJsonReport(scan), 'application/json');
  }
}
