"use client";

import {
  ScanJob,
  Finding,
  Severity,
  RiskAggregation,
  DependencyVulnerability,
  TestCoverageEstimate,
  ContributorStat,
  ArchitectureAssessment,
  TddAssessment,
} from "@/lib/types";
import { SeverityBadge } from "./SeverityBadge";
import { SEVERITY_HEX, groupDependencies } from "@/lib/dependencyGroups";
import {
  AreaGrid,
  BusinessImpact,
  CheckCatalog,
  CoverageStrip,
  DomainScorecard,
  FindingsEvidence,
  RemediationPlan,
} from "./TddSections";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const RISK_LEVEL: Record<
  "high" | "medium" | "low",
  { label: string; hex: string; pill: string }
> = {
  high: {
    label: "High",
    hex: "#c92a3d",
    pill: "border-critical/30 bg-critical/10 text-critical",
  },
  medium: {
    label: "Medium",
    hex: "#d97706",
    pill: "border-high/30 bg-high/10 text-high",
  },
  low: {
    label: "Low",
    hex: "#1f7a4d",
    pill: "border-pass/30 bg-pass/10 text-pass",
  },
};

const INK = "#1C2128";

function allFindings(scan: ScanJob): Array<Finding & { path: string }> {
  return (scan.files || []).flatMap((f) =>
    f.findings.map((finding) => ({ ...finding, path: f.path })),
  );
}

function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of findings) counts[f.severity]++;
  return counts;
}

/** Older scans stored raw float sums (0.30000000000000004); never print those. */
function formatDays(n: number): string {
  return String(Math.round(n * 100) / 100);
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
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
  const sortedFindings = [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
  const topFindings = sortedFindings.slice(0, 10);

  // Numbered dynamically from which sections actually render — Talent
  // Concentration and Architecture are conditional on data being available,
  // so a hardcoded "04, 05, 06, 07" would visibly skip a number (e.g. jump
  // straight from 04 to 07) any time either is missing, which reads as a
  // mistake in a document meant to look authoritative to a deal team.
  //
  // With a TDD assessment the report follows its hierarchy — areas →
  // domains → findings & evidence → business impact → remediation plan —
  // and the per-category sections become supporting detail behind it.
  const tdd = scan.riskAggregation ? (scan.tddAssessment ?? null) : null;
  const outline = [
    {
      id: "executive-summary",
      title: "Executive Summary",
      included: Boolean(scan.riskAggregation),
    },
    { id: "tdd-scorecard", title: "TDD Scorecard", included: Boolean(tdd) },
    {
      id: "findings-evidence",
      title: "Findings & Evidence",
      included: Boolean(tdd),
    },
    { id: "business-impact", title: "Business Impact", included: Boolean(tdd) },
    {
      id: "remediation-plan",
      title: "Remediation Plan",
      included: Boolean(tdd),
    },
    { id: "security-exposure", title: "Security Exposure", included: true },
    {
      id: "dependency-license-risk",
      title: "Dependency & License Risk",
      included: true,
    },
    { id: "technical-debt", title: "Technical Debt", included: true },
    {
      id: "talent-concentration",
      title: "Talent Concentration",
      included: Boolean(scan.contributorStats?.length),
    },
    {
      id: "architecture-scalability",
      title: "Architecture & Scalability",
      included: Boolean(scan.architectureAssessment),
    },
    {
      id: "remediation-cost-estimate",
      title: "Remediation Cost",
      included: Boolean(scan.riskAggregation) && !tdd,
    },
    { id: "check-coverage", title: "Check Coverage", included: Boolean(tdd) },
  ];
  const sectionNum = new Map<string, string>();
  let n = 0;
  for (const s of outline) {
    if (s.included) sectionNum.set(s.id, String(++n).padStart(2, "0"));
  }

  const scannedOn = new Date(scan.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="print-exact mx-auto max-w-4xl overflow-hidden rounded-xl border border-paper-line bg-paper-card shadow-2xl shadow-black/40 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
      {/* Cover band */}
      <header className="bg-ink px-8 pt-7 pb-6 text-[#E8ECF4]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] uppercase">
            <span className="text-muted-on-ink">
              Technical Due Diligence Report
            </span>
            <span className="rounded-sm border border-ink-line px-1.5 py-0.5 text-[10px] text-muted-on-ink">
              Confidential
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="shrink-0 cursor-pointer rounded-md border border-ink-line px-3.5 py-1.5 text-xs font-bold text-muted-on-ink transition-colors hover:border-cobalt hover:text-[#E8ECF4] print:hidden"
          >
            Print / Save as PDF
          </button>
        </div>

        <h1 className="mb-6 text-[28px] leading-tight font-bold tracking-tight break-words text-balance">
          {scan.sourceName}
        </h1>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-line pt-4 sm:grid-cols-4">
          <MetaItem
            label="Framework"
            value={scan.framework || "Not detected"}
          />
          <MetaItem label="Scanned" value={scannedOn} />
          <MetaItem
            label="Files analyzed"
            value={`${scan.filesScanned.toLocaleString("en-US")} of ${scan.fileCount.toLocaleString("en-US")}`}
          />
          <MetaItem
            label="Report ID"
            value={scan.id.slice(0, 8).toUpperCase()}
            mono
          />
        </dl>
      </header>

      <div className="px-8 pt-6 pb-8 print:px-0">
        <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-paper-line pb-4 font-mono text-[11px] print:hidden">
          {outline
            .filter((s) => s.included)
            .map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-muted-on-paper transition-colors hover:text-cobalt"
              >
                <span className="text-cobalt">{sectionNum.get(s.id)}</span>{" "}
                {s.title}
              </a>
            ))}
        </nav>

        {scan.riskAggregation ? (
          <Section
            num={sectionNum.get("executive-summary")!}
            id="executive-summary"
            title="Executive Summary"
          >
            <ExecutiveSummary aggregation={scan.riskAggregation} tdd={tdd} />
          </Section>
        ) : (
          <p className="mb-8 rounded-lg border border-paper-line bg-paper px-4 py-3 text-sm text-muted-on-paper">
            This scan hasn&apos;t completed, or didn&apos;t gather enough data
            to compute a risk assessment yet.
          </p>
        )}

        {tdd && (
          <>
            <Section
              num={sectionNum.get("tdd-scorecard")!}
              id="tdd-scorecard"
              title="TDD Scorecard"
            >
              <p className="mb-3 max-w-[68ch] text-xs leading-relaxed text-muted-on-paper">
                Each executive risk area breaks down into assessment domains. A
                domain&apos;s rating is the most severe check that failed inside
                it; domains with no data are marked N/A, never passed.
              </p>
              <DomainScorecard tdd={tdd} />
            </Section>

            <Section
              num={sectionNum.get("findings-evidence")!}
              id="findings-evidence"
              title="Findings & Evidence"
            >
              <FindingsEvidence tdd={tdd} />
            </Section>

            <Section
              num={sectionNum.get("business-impact")!}
              id="business-impact"
              title="Business Impact"
            >
              <BusinessImpact tdd={tdd} />
            </Section>

            <Section
              num={sectionNum.get("remediation-plan")!}
              id="remediation-plan"
              title="Remediation Plan"
            >
              <RemediationPlan tdd={tdd} />
            </Section>
          </>
        )}

        <Section
          num={sectionNum.get("security-exposure")!}
          id="security-exposure"
          title="Security Exposure"
        >
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {SEVERITY_ORDER.map((s) => (
              <CountTile
                key={s}
                label={s}
                value={counts[s]}
                hex={SEVERITY_HEX[s]}
              />
            ))}
            <CountTile
              label="Exposed secrets"
              value={scan.secrets?.length ?? 0}
              hex={SEVERITY_HEX.critical}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {topFindings.length > 0 ? (
            <>
              <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line">
                {topFindings.map((f, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 px-4 py-3 break-inside-avoid"
                  >
                    <div className="pt-0.5">
                      <SeverityBadge level={f.severity} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="text-[13px] font-bold text-[#1C2128]">
                          {f.title}
                        </span>
                        <span className="truncate font-mono text-[11px] text-muted-on-paper">
                          {f.path}
                          {f.line ? `:${f.line}` : ""}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-on-paper">
                        {f.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {sortedFindings.length > topFindings.length && (
                <p className="mt-2 text-[11px] text-muted-on-paper">
                  Showing the {topFindings.length} most severe of{" "}
                  {sortedFindings.length} findings.
                </p>
              )}
            </>
          ) : (
            <EmptyNote>No code-level findings surfaced by this scan.</EmptyNote>
          )}
        </Section>

        <Section
          num={sectionNum.get("dependency-license-risk")!}
          id="dependency-license-risk"
          title="Dependency & License Risk"
        >
          <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
            <div>
              <SubHeading>Vulnerable dependencies</SubHeading>
              {scan.dependencyVulnerabilities === null ? (
                <EmptyNote>
                  No dependency scan available for this scan.
                </EmptyNote>
              ) : scan.dependencyVulnerabilities.length > 0 ? (
                <DependencyTable vulns={scan.dependencyVulnerabilities} />
              ) : (
                <CleanNote>
                  No known-vulnerable dependency versions detected.
                </CleanNote>
              )}
            </div>
            <div>
              <SubHeading>License compliance</SubHeading>
              {scan.licenseFindings === null ? (
                <EmptyNote>
                  No license compliance check available for this scan.
                </EmptyNote>
              ) : scan.licenseFindings.length > 0 ? (
                <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line">
                  {scan.licenseFindings.map((f, i) => (
                    <li key={i} className="px-3 py-2.5 break-inside-avoid">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs font-bold text-[#1C2128]">
                          {f.package}@{f.version}
                        </span>
                        <SeverityBadge level={f.riskLevel} />
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-on-paper">
                        <span className="font-mono">{f.license}</span> —{" "}
                        {f.reason}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <CleanNote>
                  No copyleft or unclear-license dependencies flagged.
                </CleanNote>
              )}
            </div>
          </div>
        </Section>

        <Section
          num={sectionNum.get("technical-debt")!}
          id="technical-debt"
          title="Technical Debt"
        >
          <TechnicalDebt
            coverage={scan.testCoverage}
            circular={scan.circularImports?.length ?? 0}
            dead={scan.deadCode?.length ?? 0}
            duplicates={scan.duplicates?.length ?? 0}
          />
        </Section>

        {scan.contributorStats && scan.contributorStats.length > 0 && (
          <Section
            num={sectionNum.get("talent-concentration")!}
            id="talent-concentration"
            title="Talent Concentration"
          >
            <Contributors stats={scan.contributorStats} />
          </Section>
        )}

        {scan.architectureAssessment && (
          <Section
            num={sectionNum.get("architecture-scalability")!}
            id="architecture-scalability"
            title="Architecture & Scalability"
          >
            <Architecture assessment={scan.architectureAssessment} />
          </Section>
        )}

        {scan.riskAggregation && !tdd && (
          <Section
            num={sectionNum.get("remediation-cost-estimate")!}
            id="remediation-cost-estimate"
            title="Remediation Cost Estimate"
          >
            <RemediationTable aggregation={scan.riskAggregation} />
          </Section>
        )}

        {tdd && (
          <Section
            num={sectionNum.get("check-coverage")!}
            id="check-coverage"
            title="Appendix: Check Coverage"
          >
            <CheckCatalog tdd={tdd} />
          </Section>
        )}

        <footer className="mt-10 flex flex-wrap items-end justify-between gap-3 border-t border-paper-line pt-4 text-[11px] leading-relaxed text-muted-on-paper">
          <p className="max-w-xl">
            Generated by audit/bench&apos;s LLM-plus-static-analysis review
            engine. Every finding above is traceable to the scanned repository
            at the time of this scan.
          </p>
          <span className="font-mono">
            auditbenchai.com · {scan.id.slice(0, 8).toUpperCase()}
          </span>
        </footer>
      </div>
    </article>
  );
}

function MetaItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="mb-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-on-ink uppercase">
        {label}
      </dt>
      <dd
        className={`truncate text-[13px] font-semibold ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function Section({
  num,
  id,
  title,
  children,
}: {
  num: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    // scroll-mt so a jump from the quick-nav doesn't land the heading flush
    // against the viewport edge.
    <section id={id} className="mb-10 scroll-mt-6 last:mb-0">
      <h2 className="mb-4 flex items-baseline gap-3 border-b-2 border-[#1C2128] pb-2 break-after-avoid">
        <span className="font-mono text-xs font-bold text-cobalt">{num}</span>
        <span className="text-[17px] font-bold text-[#1C2128]">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
      {children}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-muted-on-paper">
      {children}
    </p>
  );
}

function CleanNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-pass/30 bg-pass/10 px-3.5 py-2.5 text-xs text-[#1C2128]">
      <span className="font-bold text-pass">✓</span>
      {children}
    </p>
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
    <div
      className={`rounded-lg border border-paper-line bg-paper px-3 py-2.5 break-inside-avoid ${className ?? ""}`}
    >
      <div
        className="text-2xl leading-none font-bold tabular-nums"
        style={{ color: active ? hex : "#b4bac4" }}
      >
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: active ? hex : "#d3d7de" }}
        />
        {label}
      </div>
    </div>
  );
}

function HealthRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const hex = clamped >= 80 ? "#1f7a4d" : clamped >= 50 ? "#d97706" : "#c92a3d";
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width="76"
      height="76"
      viewBox="0 0 76 76"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#e6e8ec"
        strokeWidth="7"
      />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke={hex}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${(clamped / 100) * c} ${c}`}
        transform="rotate(-90 38 38)"
      />
      <text
        x="38"
        y="42"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill={INK}
      >
        {clamped}
      </text>
    </svg>
  );
}

function ExecutiveSummary({
  aggregation,
  tdd,
}: {
  aggregation: RiskAggregation;
  tdd: TddAssessment | null;
}) {
  const rating = RISK_LEVEL[aggregation.overallRiskRating];
  const { remediation } = aggregation;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div
          className="rounded-lg border px-4 py-3.5 break-inside-avoid"
          style={{
            borderColor: `${rating.hex}55`,
            backgroundColor: `${rating.hex}0d`,
          }}
        >
          <SubHeading>Overall risk</SubHeading>
          <div
            className="text-[28px] leading-none font-bold tracking-tight uppercase"
            style={{ color: rating.hex }}
          >
            {rating.label}
          </div>
          <p className="mt-2 text-[11px] text-muted-on-paper">
            Across security, dependencies, debt and team.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-paper-line bg-paper px-4 py-3 break-inside-avoid">
          <HealthRing score={aggregation.overallHealthScore} />
          <div>
            <SubHeading>Health score</SubHeading>
            <div className="text-[13px] font-semibold text-[#1C2128]">
              {aggregation.overallHealthScore} out of 100
            </div>
            <p className="mt-0.5 text-[11px] text-muted-on-paper">
              Under 50 is at risk
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-paper-line bg-paper px-4 py-3.5 break-inside-avoid">
          <SubHeading>Est. remediation</SubHeading>
          <div className="text-[22px] leading-tight font-bold tracking-tight text-[#1C2128] tabular-nums">
            {formatUsd(remediation.estimatedCostLowUsd)}–
            {formatUsd(remediation.estimatedCostHighUsd)}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-on-paper">
            {formatDays(remediation.totalEstimatedDays)} engineer-days
          </p>
        </div>
      </div>

      <p className="max-w-[68ch] text-sm leading-relaxed text-[#1C2128]">
        {aggregation.summary}
      </p>

      {tdd ? (
        <>
          <CoverageStrip tdd={tdd} />
          <div>
            <SubHeading>Six executive risk areas</SubHeading>
            <AreaGrid tdd={tdd} />
          </div>
        </>
      ) : (
        <div>
          <SubHeading>Risk scorecard</SubHeading>
          <div className="grid overflow-hidden rounded-lg border border-paper-line sm:grid-cols-2">
            {aggregation.categories.map((c) => {
              const level = c.riskLevel ? RISK_LEVEL[c.riskLevel] : null;
              return (
                <div
                  key={c.category}
                  className="flex items-start justify-between gap-3 border-b border-paper-line px-3.5 py-2.5 break-inside-avoid sm:odd:border-r"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#1C2128]">
                      {c.category}
                    </div>
                    {c.detail && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-on-paper">
                        {c.detail}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase ${
                      level
                        ? level.pill
                        : "border-paper-line text-muted-on-paper"
                    }`}
                  >
                    {level ? level.label : "n/a"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {aggregation.recommendations.length > 0 && (
        <div className="rounded-lg bg-paper px-4 py-3.5 break-inside-avoid">
          <SubHeading>Key actions</SubHeading>
          <ol className="space-y-2">
            {aggregation.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex gap-3 text-[13px] leading-relaxed text-[#1C2128]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C2128] font-mono text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function DependencyTable({ vulns }: { vulns: DependencyVulnerability[] }) {
  const groups = groupDependencies(vulns);
  return (
    <>
      <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line">
        {groups.map((g) => (
          <li key={g.pkg} className="px-3.5 py-2.5 break-inside-avoid">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-mono text-[13px] font-bold text-[#1C2128]">
                {g.pkg}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[10px] text-muted-on-paper">
                  {g.advisories} advisor{g.advisories === 1 ? "y" : "ies"}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-white uppercase"
                  style={{ backgroundColor: SEVERITY_HEX[g.severity] }}
                >
                  {g.severity}
                </span>
              </span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {g.titles.slice(0, 4).map((t) => (
                <li
                  key={t}
                  className="text-[11px] leading-snug text-muted-on-paper"
                >
                  {t}
                </li>
              ))}
              {g.titles.length > 4 && (
                <li className="text-[11px] text-muted-on-paper">
                  + {g.titles.length - 4} more
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-on-paper">
        {vulns.length} advisories across {groups.length} package
        {groups.length === 1 ? "" : "s"}.
      </p>
    </>
  );
}

function TechnicalDebt({
  coverage,
  circular,
  dead,
  duplicates,
}: {
  coverage: TestCoverageEstimate | null;
  circular: number;
  dead: number;
  duplicates: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-paper-line bg-paper px-3 py-2.5 break-inside-avoid">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl leading-none font-bold text-[#1C2128] tabular-nums">
              {coverage ? `${Math.round(coverage.testFileRatio * 100)}%` : "—"}
            </span>
            {coverage && <SeverityBadge level={coverage.riskLevel} />}
          </div>
          <div className="mt-1.5 font-mono text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
            Test-to-source
          </div>
          {coverage && (
            <div className="mt-0.5 text-[11px] text-muted-on-paper">
              {coverage.testFileCount} / {coverage.sourceFileCount} files
            </div>
          )}
        </div>
        <CountTile
          label="Circular imports"
          value={circular}
          hex={SEVERITY_HEX.high}
        />
        <CountTile
          label="Possibly dead files"
          value={dead}
          hex={SEVERITY_HEX.medium}
        />
        <CountTile
          label="Duplicate blocks"
          value={duplicates}
          hex={SEVERITY_HEX.medium}
        />
      </div>

      {coverage ? (
        <div className="space-y-2.5">
          <p className="max-w-[68ch] text-xs leading-relaxed text-[#1C2128]">
            {coverage.reason}
          </p>
          <div className="flex flex-wrap gap-2">
            <CheckChip
              ok={coverage.hasCoverageConfig}
              label="Coverage config"
            />
            <CheckChip ok={coverage.hasCiTestStep} label="CI test step" />
          </div>
          {coverage.untestedDirectories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-on-paper">
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
      ) : (
        <EmptyNote>No test-coverage estimate available.</EmptyNote>
      )}
    </div>
  );
}

function CheckChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        ok
          ? "border-pass/30 bg-pass/10 text-pass"
          : "border-critical/30 bg-critical/10 text-critical"
      }`}
    >
      <span className="font-bold">{ok ? "✓" : "✗"}</span>
      {label} {ok ? "found" : "missing"}
    </span>
  );
}

function Contributors({ stats }: { stats: ContributorStat[] }) {
  const sorted = [...stats].sort((a, b) => b.commits - a.commits);
  const total = sorted.reduce((sum, s) => sum + s.commits, 0);
  if (total === 0) return <EmptyNote>No commit history available.</EmptyNote>;

  const topShare = sorted[0].commits / total;
  const concentration =
    topShare >= 0.5
      ? { label: "High concentration", hex: SEVERITY_HEX.critical }
      : topShare >= 0.3
        ? { label: "Moderate concentration", hex: SEVERITY_HEX.high }
        : null;

  return (
    <div className="space-y-4">
      {concentration && (
        <div
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border px-4 py-3 break-inside-avoid"
          style={{
            borderColor: `${concentration.hex}55`,
            backgroundColor: `${concentration.hex}0d`,
          }}
        >
          <span
            className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase"
            style={{ color: concentration.hex }}
          >
            {concentration.label}
          </span>
          <span className="text-[13px] text-[#1C2128]">
            <span className="font-mono font-bold">{sorted[0].author}</span>{" "}
            authored {Math.round(topShare * 100)}% of{" "}
            {total.toLocaleString("en-US")} commits.
          </span>
        </div>
      )}

      <div className="space-y-2">
        {sorted.slice(0, 8).map((c, i) => {
          const pct = (c.commits / total) * 100;
          const barHex =
            i === 0 && concentration ? concentration.hex : "#2b5be3";
          return (
            <div
              key={c.author}
              className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 break-inside-avoid"
            >
              <span className="truncate font-mono text-xs text-[#1C2128]">
                {c.author}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-[#eceef1]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(pct, 1.5)}%`,
                    backgroundColor: barHex,
                  }}
                />
              </div>
              <span className="w-28 text-right text-xs text-muted-on-paper tabular-nums">
                {c.commits.toLocaleString("en-US")} · {Math.round(pct)}%
              </span>
            </div>
          );
        })}
        {sorted.length > 8 && (
          <p className="text-[11px] text-muted-on-paper">
            + {sorted.length - 8} more contributor(s)
          </p>
        )}
      </div>
    </div>
  );
}

function Architecture({ assessment }: { assessment: ArchitectureAssessment }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SeverityBadge level={assessment.riskLevel} />
        <span className="text-[13px] font-semibold text-[#1C2128]">
          Consistency score {assessment.consistencyScore}/100
        </span>
      </div>
      <p className="max-w-[68ch] text-xs leading-relaxed text-[#1C2128]">
        {assessment.summary}
      </p>
      {assessment.inconsistencies.length > 0 && (
        <ul className="divide-y divide-paper-line overflow-hidden rounded-lg border border-paper-line">
          {assessment.inconsistencies.map((inc, i) => (
            <li key={i} className="px-4 py-3 break-inside-avoid">
              <div className="text-[13px] font-bold text-[#1C2128]">
                {inc.title}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-on-paper">
                {inc.description}
              </p>
              {inc.files.length > 0 && (
                <div className="mt-1 font-mono text-[11px] break-all text-muted-on-paper">
                  {inc.files.join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RemediationTable({ aggregation }: { aggregation: RiskAggregation }) {
  const {
    items,
    totalEstimatedDays,
    estimatedCostLowUsd,
    estimatedCostHighUsd,
  } = aggregation.remediation;
  if (items.length === 0) {
    return (
      <EmptyNote>
        No remediation items — nothing significant enough to cost out.
      </EmptyNote>
    );
  }
  const maxDays = Math.max(...items.map((i) => i.estimatedDays), 0.01);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-paper-line break-inside-avoid">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-paper-line bg-paper font-mono text-[10px] tracking-[0.08em] text-muted-on-paper uppercase">
              <th className="px-4 py-2 font-bold">Line item</th>
              <th className="hidden w-40 px-4 py-2 font-bold sm:table-cell">
                Share of effort
              </th>
              <th className="w-24 px-4 py-2 text-right font-bold">Days</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-paper-line">
                <td className="px-4 py-2.5 align-top">
                  <div className="text-[13px] font-semibold text-[#1C2128]">
                    {item.category}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted-on-paper">
                    {item.description}
                  </div>
                </td>
                <td className="hidden px-4 py-2.5 align-middle sm:table-cell">
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#eceef1]">
                    <div
                      className="h-full rounded-full bg-[#1C2128]"
                      style={{
                        width: `${Math.max((item.estimatedDays / maxDays) * 100, 3)}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right align-top font-mono text-[13px] font-semibold text-[#1C2128] tabular-nums">
                  {formatDays(item.estimatedDays)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#1C2128] text-white">
              <td className="px-4 py-3 text-[13px] font-bold">
                Total
                <span className="ml-2 font-mono text-[11px] font-normal text-[#c9ced8]">
                  {formatUsd(estimatedCostLowUsd)}–
                  {formatUsd(estimatedCostHighUsd)}
                </span>
              </td>
              <td className="hidden sm:table-cell" />
              <td className="px-4 py-3 text-right font-mono text-[13px] font-bold tabular-nums">
                {formatDays(totalEstimatedDays)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-on-paper">
        Cost estimates assume a blended engineer-day rate and are a planning
        estimate, not a quote.
      </p>
    </>
  );
}
