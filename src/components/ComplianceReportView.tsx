'use client';

import { useEffect, useRef } from 'react';
import { ComplianceControl, ComplianceReport, ComplianceSeverity } from '@/lib/types';

const STATUS: Record<ComplianceControl['status'], { label: string; className: string; bar: string }> = {
  attention: { label: 'Needs attention', className: 'bg-critical text-white', bar: 'bg-critical' },
  evidence: { label: 'Evidence collected', className: 'bg-pass text-white', bar: 'bg-pass' },
  no_activity: { label: 'No activity', className: 'bg-[#8a8a8a] text-white', bar: 'bg-[#bdbdbd]' },
};

const SUMMARY_LABEL: Record<ComplianceControl['status'], string> = {
  attention: 'need attention',
  evidence: 'with evidence',
  no_activity: 'with no activity',
};

const SEVERITY_COLOR: Record<ComplianceSeverity, string> = {
  critical: 'bg-critical',
  high: 'bg-[#e8590c]',
  medium: 'bg-[#d97706]',
  low: 'bg-[#8a8a8a]',
};

const n = (v: number) => v.toLocaleString('en-US');

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Every mapped item as CSV, one row per item, for an auditor's evidence folder. */
export function complianceCsv(report: ComplianceReport): string {
  const header = ['controls', 'severity', 'title', 'location', 'cwe', 'owasp', 'source', 'date'];
  const rows = report.allItems.map((i) =>
    [i.controlIds.join(' '), i.severity, i.title, i.location, i.cwe.join(' '), i.owasp ?? '', i.source, i.date]
      .map(csvCell)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.12em] text-muted-on-ink uppercase">{label}</dt>
      <dd className="text-[20px] font-bold tabular-nums">{value}</dd>
      {detail && <dd className="text-[11px] text-muted-on-ink">{detail}</dd>}
    </div>
  );
}

function ControlCard({ control }: { control: ComplianceControl }) {
  const status = STATUS[control.status];
  const total = control.counts.critical + control.counts.high + control.counts.medium + control.counts.low;
  return (
    <section className="relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-paper-line bg-white pl-5 last:mb-0">
      <span className={`absolute top-0 left-0 h-full w-1 ${status.bar}`} />
      <div className="py-4 pr-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[12px] font-bold text-cobalt">{control.id}</span>
          <h3 className="text-[15px] font-bold text-black">{control.title}</h3>
          <span className={`ml-auto rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="mb-3 text-[12px] text-muted-on-paper">{control.description}</p>

        {control.evidence.length > 0 && (
          <ul className="mb-3 list-disc space-y-1 pl-5 text-[13px] text-black">
            {control.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}

        {total > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-black">
            {(['critical', 'high', 'medium', 'low'] as const)
              .filter((s) => control.counts[s] > 0)
              .map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`inline-block h-2 w-2 rounded-full ${SEVERITY_COLOR[s]}`} />
                  {n(control.counts[s])} {s}
                </span>
              ))}
            <span className="text-muted-on-paper">
              · {control.topics.map((t) => `${t.label} (${n(t.count)})`).join(', ')}
            </span>
          </div>
        )}

        {control.items.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-[12px] font-bold text-cobalt print:hidden">
              {control.totalItems === 1
                ? 'Show 1 item'
                : control.items.length === control.totalItems
                  ? `Show all ${n(control.totalItems)} items`
                  : `Show the ${control.items.length} most severe of ${n(control.totalItems)} items`}
            </summary>
            <table className="mt-2 w-full table-fixed text-left text-[11px] text-black">
              <thead>
                <tr className="border-b border-paper-line text-muted-on-paper">
                  <th className="w-16 py-1 font-medium">Severity</th>
                  <th className="py-1 font-medium">Finding</th>
                  <th className="w-1/4 py-1 font-medium">Where</th>
                  <th className="w-24 py-1 font-medium">CWE</th>
                  <th className="w-20 py-1 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {control.items.map((i, idx) => (
                  <tr key={`${i.sourceId}:${idx}`} className="border-b border-paper-line last:border-b-0 align-top">
                    <td className="py-1.5 capitalize">{i.severity}</td>
                    <td className="py-1.5 pr-2 break-words">{i.title}</td>
                    <td className="py-1.5 pr-2 font-mono break-all">
                      {i.location}
                      {i.source !== i.location && <div className="text-muted-on-paper">{i.source}</div>}
                    </td>
                    <td className="py-1.5 font-mono">
                      {i.cwe.map((c) => (
                        <span key={c} className="block whitespace-nowrap">
                          {c}
                        </span>
                      ))}
                    </td>
                    <td className="py-1.5 tabular-nums">{i.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </section>
  );
}

/** The compliance evidence report as a printable document (same paper style as the due diligence report). */
export function ComplianceReportView({ report, workspace }: { report: ComplianceReport; workspace?: string }) {
  const generated = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const s = report.scope;
  const articleRef = useRef<HTMLElement>(null);
  // A PDF should carry every item table, not just the ones expanded on screen.
  useEffect(() => {
    const openAll = () => articleRef.current?.querySelectorAll('details').forEach((d) => (d.open = true));
    window.addEventListener('beforeprint', openAll);
    return () => window.removeEventListener('beforeprint', openAll);
  }, []);
  return (
    <article
      ref={articleRef}
      className="print-exact mx-auto max-w-4xl overflow-hidden rounded-xl border border-paper-line bg-paper-card shadow-2xl shadow-black/40 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      <header className="bg-ink px-8 pt-7 pb-6 text-white">
        <div className="mb-4 text-[11px] font-medium tracking-[0.12em] text-muted-on-ink uppercase">
          Security controls evidence · Audit Bench Ai
        </div>
        <h1 className="mb-1 text-[26px] leading-tight font-light tracking-[-0.02em]">{report.frameworkName}</h1>
        <p className="mb-5 text-[13px] text-muted-on-ink">
          {workspace ? `${workspace} · ` : ''}Last {report.windowDays} days · generated {generated}
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-line pt-4 sm:grid-cols-4">
          <Stat label="PRs reviewed" value={n(s.prReviews)} detail={`${n(s.repositories)} repositories`} />
          <Stat label="Held back" value={n(s.heldBack)} detail={`"Do not ship" verdicts`} />
          <Stat label="Secrets checks" value={n(s.secretsChecks)} detail={`${n(s.dependencyChecks)} dependency checks`} />
          <Stat label="Mapped findings" value={n(report.summary.items)} detail={`${n(s.repoScans)} repo scan${s.repoScans === 1 ? '' : 's'}, ${n(s.audits)} audit${s.audits === 1 ? '' : 's'}`} />
        </dl>
      </header>

      <div className="px-8 pt-6 pb-8 print:px-0">
        <div className="mb-6 flex flex-wrap gap-2 text-[12px]">
          {(['attention', 'evidence', 'no_activity'] as const).map((k) => {
            const count =
              k === 'attention' ? report.summary.attention : k === 'evidence' ? report.summary.evidence : report.summary.noActivity;
            return (
              <span key={k} className="flex items-center gap-1.5 rounded border border-paper-line bg-white px-2.5 py-1 text-black">
                <span className={`inline-block h-2 w-2 rounded-full ${STATUS[k].bar}`} />
                {n(count)} {SUMMARY_LABEL[k]}
              </span>
            );
          })}
        </div>

        {report.controls.map((c) => (
          <ControlCard key={c.id} control={c} />
        ))}

        <p className="mt-8 border-t border-paper-line pt-4 text-[11px] leading-relaxed text-muted-on-paper">
          {report.disclaimer} Weaknesses are classified with CWE and the OWASP Top 10 (2021).
        </p>
      </div>
    </article>
  );
}
