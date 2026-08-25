'use client';

import { ScanJob, Finding, Severity } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';
import { RiskAssessmentBanner, TestCoverageSummary, ArchitectureSummary, ContributorConcentration } from './RepositoryReport';

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

function allFindings(scan: ScanJob): Array<Finding & { path: string }> {
  return (scan.files || []).flatMap((f) => f.findings.map((finding) => ({ ...finding, path: f.path })));
}

function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

/**
 * Investor/deal-team-facing view of a completed repository scan — same
 * underlying ScanJob data as RepositoryReport, but reframed as a due
 * diligence document (executive summary, numbered sections, a remediation
 * cost table) instead of a developer's per-file findings list. Deliberately
 * a separate component rather than a mode toggle on RepositoryReport, so
 * the two audiences' views can evolve independently.
 */
export function DueDiligenceReport({ scan }: { scan: ScanJob }) {
  const findings = allFindings(scan);
  const counts = severityCounts(findings);
  const topFindings = [...findings]
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-paper-line bg-paper-card p-8 shadow-2xl shadow-black/40">
      <div className="mb-6 flex items-start justify-between border-b border-paper-line pb-6">
        <div>
          <div className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
            Technical Due Diligence Report
          </div>
          <h1 className="text-2xl font-bold text-[#1C2128]">{scan.sourceName}</h1>
          <p className="mt-1 text-sm text-muted-on-paper">
            {scan.framework || 'Framework unknown'} · Scanned {new Date(scan.createdAt).toLocaleDateString('en-US')}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 rounded-lg border border-paper-line px-4 py-2 text-sm font-bold text-muted-on-paper hover:text-[#1C2128] print:hidden"
        >
          Print / Save as PDF
        </button>
      </div>

      {scan.riskAggregation ? (
        <Section num="01" title="Executive Summary">
          <RiskAssessmentBanner aggregation={scan.riskAggregation} />
        </Section>
      ) : (
        <p className="mb-6 text-sm text-muted-on-paper">
          This scan hasn&apos;t completed, or didn&apos;t gather enough data to compute a risk assessment yet.
        </p>
      )}

      <Section num="02" title="Security Exposure">
        <div className="mb-3 flex flex-wrap gap-2">
          {SEVERITY_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-1.5 rounded-full border border-paper-line px-2.5 py-1 text-xs">
              <SeverityBadge level={s} /> {counts[s]}
            </span>
          ))}
          <span className="flex items-center gap-1.5 rounded-full border border-paper-line px-2.5 py-1 text-xs text-muted-on-paper">
            {scan.secrets?.length ?? 0} potential secret(s)
          </span>
        </div>
        {topFindings.length > 0 ? (
          <ul className="space-y-2">
            {topFindings.map((f, i) => (
              <li key={i} className="rounded-md border border-paper-line bg-paper px-3 py-2">
                <div className="mb-1 flex items-center gap-2">
                  <SeverityBadge level={f.severity} />
                  <span className="text-xs font-bold text-[#1C2128]">{f.title}</span>
                  <span className="ml-auto font-mono text-[11px] text-muted-on-paper">{f.path}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-on-paper">{f.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-on-paper">No findings surfaced by this scan.</p>
        )}
      </Section>

      <Section num="03" title="Dependency & License Risk">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              Vulnerable dependencies
            </div>
            {scan.dependencyVulnerabilities === null ? (
              <p className="text-xs text-muted-on-paper">No dependency scan available for this scan.</p>
            ) : scan.dependencyVulnerabilities.length > 0 ? (
              <ul className="space-y-1.5">
                {scan.dependencyVulnerabilities.slice(0, 10).map((v, i) => (
                  <li key={i} className="text-xs text-[#1C2128]">
                    <span className="font-mono font-bold text-critical uppercase">{v.severity}</span>{' '}
                    <span className="font-mono">{v.package}</span> — {v.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-on-paper">None detected.</p>
            )}
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              License compliance
            </div>
            {scan.licenseFindings === null ? (
              <p className="text-xs text-muted-on-paper">No license compliance check available for this scan.</p>
            ) : scan.licenseFindings.length > 0 ? (
              <ul className="space-y-1.5">
                {scan.licenseFindings.map((f, i) => (
                  <li key={i} className="text-xs text-[#1C2128]">
                    <SeverityBadge level={f.riskLevel} />{' '}
                    <span className="font-mono">
                      {f.package}@{f.version}
                    </span>{' '}
                    [{f.license}]
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-on-paper">No copyleft or unclear-license dependencies flagged.</p>
            )}
          </div>
        </div>
      </Section>

      <Section num="04" title="Technical Debt">
        {scan.testCoverage ? (
          <TestCoverageSummary coverage={scan.testCoverage} />
        ) : (
          <p className="text-sm text-muted-on-paper">No test-coverage estimate available.</p>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-on-paper">
          <span>{scan.circularImports?.length ?? 0} circular import chain(s)</span>
          <span>{scan.deadCode?.length ?? 0} possibly dead file(s)</span>
          <span>{scan.duplicates?.length ?? 0} duplicate block(s)</span>
        </div>
      </Section>

      {scan.contributorStats && scan.contributorStats.length > 0 && (
        <Section num="05" title="Talent Concentration Risk">
          <ContributorConcentration stats={scan.contributorStats} />
        </Section>
      )}

      {scan.architectureAssessment && (
        <Section num="06" title="Architecture &amp; Scalability">
          <ArchitectureSummary assessment={scan.architectureAssessment} />
        </Section>
      )}

      {scan.riskAggregation && (
        <Section num="07" title="Remediation Cost Estimate">
          {scan.riskAggregation.remediation.items.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-paper-line">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-paper-line bg-paper text-muted-on-paper uppercase">
                    <th className="px-3 py-2 font-mono">Line item</th>
                    <th className="px-3 py-2 font-mono">Engineer-days</th>
                  </tr>
                </thead>
                <tbody>
                  {scan.riskAggregation.remediation.items.map((item, i) => (
                    <tr key={i} className="border-b border-paper-line last:border-0">
                      <td className="px-3 py-2">
                        <div className="font-bold text-[#1C2128]">{item.category}</div>
                        <div className="text-muted-on-paper">{item.description}</div>
                      </td>
                      <td className="px-3 py-2 align-top font-mono text-[#1C2128]">{item.estimatedDays}</td>
                    </tr>
                  ))}
                  <tr className="bg-paper font-bold text-[#1C2128]">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 font-mono">
                      {scan.riskAggregation.remediation.totalEstimatedDays}d ($
                      {scan.riskAggregation.remediation.estimatedCostLowUsd.toLocaleString('en-US')}–$
                      {scan.riskAggregation.remediation.estimatedCostHighUsd.toLocaleString('en-US')})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-on-paper">No remediation items — nothing significant enough to cost out.</p>
          )}
          <p className="mt-2 text-[11px] text-muted-on-paper">
            Cost estimates assume a blended engineer-day rate and are a planning estimate, not a quote.
          </p>
        </Section>
      )}

      <div className="mt-8 border-t border-paper-line pt-4 text-[11px] text-muted-on-paper">
        Generated by audit/bench&apos;s LLM-plus-static-analysis review engine. Every finding above is traceable to
        the scanned repository at the time of this scan.
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 flex items-baseline gap-2 border-b border-paper-line pb-2 text-sm font-bold text-[#1C2128]">
        <span className="font-mono text-cobalt">{num}</span> {title}
      </h2>
      {children}
    </div>
  );
}
