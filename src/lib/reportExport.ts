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

// Same tokens as globals.css's paper/severity theme, inlined so this file
// renders identically whether opened directly, emailed, or printed — it
// has no dependency on the app's stylesheet at all.
const VERDICT_COLOR: Record<string, string> = { pass: '#1f7a4d', needs_work: '#d97706', do_not_ship: '#c92a3d' };
const SEVERITY_COLOR: Record<string, string> = { critical: '#c92a3d', high: '#d97706', medium: '#b08a00', low: '#2e6fab' };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function buildHtmlReport(scan: ScanJob): string {
  const verdict = scan.verdict ?? 'needs_work';
  const verdictColor = VERDICT_COLOR[verdict] ?? '#6b7280';
  const verdictLabel = scan.verdict ? VERDICT_LABEL[scan.verdict] : scan.status;

  const fileSections = (scan.files || [])
    .map((f) => {
      const findings =
        f.findings.length === 0
          ? '<p class="clean">No issues in this file.</p>'
          : f.findings
              .map(
                (finding) => `
        <div class="finding">
          <div class="finding-head">
            <span class="badge" style="background:${SEVERITY_COLOR[finding.severity] ?? '#6b7280'}">${escapeHtml(finding.severity.toUpperCase())}</span>
            <span class="category">${escapeHtml(finding.category)}</span>
            <span class="title">${escapeHtml(finding.title)}</span>
            ${finding.line != null ? `<span class="line">line ${finding.line}</span>` : ''}
          </div>
          <p>${escapeHtml(finding.description)}</p>
          <p class="fix"><strong>Suggested fix:</strong> ${escapeHtml(finding.suggestedFix)}</p>
          ${finding.examplePatch ? `<pre>${escapeHtml(finding.examplePatch)}</pre>` : ''}
        </div>`,
              )
              .join('');
      return `
      <section class="file">
        <h2>${escapeHtml(f.path)}</h2>
        ${findings}
      </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>audit/bench report — ${escapeHtml(scan.sourceName)}</title>
<style>
  body { margin: 0; padding: 40px 24px 80px; background: #f2f3ee; color: #1c2128; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  .wrap { max-width: 860px; margin: 0 auto; }
  header { border-bottom: 1px solid #dde0d8; padding-bottom: 20px; margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 12px; }
  .meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #6b7280; margin-bottom: 12px; }
  .verdict { display: inline-block; padding: 3px 10px; border-radius: 6px; color: #fff; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
  .summary { font-size: 14px; line-height: 1.6; }
  section.file { background: #fff; border: 1px solid #dde0d8; border-radius: 10px; padding: 18px 20px; margin-bottom: 16px; }
  section.file h2 { font-size: 14px; font-family: ui-monospace, monospace; margin: 0 0 12px; }
  .clean { color: #1f7a4d; font-size: 13px; margin: 0; }
  .finding { border-top: 1px solid #dde0d8; padding-top: 14px; margin-top: 14px; }
  .finding:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
  .finding-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
  .badge { color: #fff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 5px; letter-spacing: .03em; }
  .category { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: .03em; }
  .title { font-weight: 700; font-size: 14px; }
  .line { margin-left: auto; font-family: ui-monospace, monospace; font-size: 11px; color: #6b7280; }
  .finding p { font-size: 13.5px; line-height: 1.6; margin: 6px 0; }
  .fix { color: #1c2128; }
  pre { background: #10141c; color: #e8ecf4; padding: 10px 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; }
  footer { margin-top: 24px; font-size: 11px; color: #6b7280; }
  @media print {
    body { background: #fff; padding: 0; }
    section.file { break-inside: avoid; box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>${escapeHtml(scan.sourceName)}</h1>
      <div class="meta">
        <span class="verdict" style="background:${verdictColor}">${escapeHtml(String(verdictLabel))}</span>
        <span>Framework: ${escapeHtml(scan.framework || 'unknown')}</span>
        <span>Files scanned: ${scan.filesScanned}/${scan.fileCount}</span>
        <span>Scanned: ${new Date(scan.createdAt).toLocaleString()}</span>
      </div>
      ${scan.summary ? `<p class="summary">${escapeHtml(scan.summary)}</p>` : ''}
    </header>
    ${fileSections}
    <footer>Generated by audit/bench — open this file in a browser and use Print → Save as PDF for a PDF copy.</footer>
  </div>
</body>
</html>`;
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

export function downloadReport(scan: ScanJob, format: 'markdown' | 'json' | 'html'): void {
  const safeName = scan.sourceName.replace(/[^a-z0-9._-]+/gi, '-');
  if (format === 'markdown') {
    triggerDownload(`audit-bench-${safeName}.md`, buildMarkdownReport(scan), 'text/markdown');
  } else if (format === 'html') {
    triggerDownload(`audit-bench-${safeName}.html`, buildHtmlReport(scan), 'text/html');
  } else {
    triggerDownload(`audit-bench-${safeName}.json`, buildJsonReport(scan), 'application/json');
  }
}
