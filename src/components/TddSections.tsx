import {
  TddAssessment,
  TddCheck,
  TddCheckSeverity,
  TddRating,
  TddRemediationPhase,
} from "@/lib/types";

/**
 * The technical due diligence hierarchy, rendered for DueDiligenceReport:
 * 6 executive risk areas → 15 assessment domains → individual checks with
 * evidence → business impact → phased remediation plan. Everything here is
 * read straight off ScanJob.tddAssessment; nothing is scored client-side.
 */

const INK = "#1C2128";

export const RATING: Record<TddRating, { label: string; hex: string }> = {
  critical: { label: "Critical", hex: "#c92a3d" },
  high: { label: "High", hex: "#d97706" },
  medium: { label: "Medium", hex: "#b08a00" },
  low: { label: "Low", hex: "#2e6fab" },
  pass: { label: "Pass", hex: "#1f7a4d" },
  not_assessed: { label: "N/A", hex: "#8a93a3" },
};

const SEVERITIES: TddCheckSeverity[] = ["critical", "high", "medium", "low"];
const SEVERITY_RANK: Record<TddCheckSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PHASES: Array<{ id: TddRemediationPhase; label: string; note: string }> =
  [
    {
      id: "pre_close",
      label: "Before close",
      note: "Conditions of close or a specific indemnity",
    },
    {
      id: "days_30",
      label: "First 30 days",
      note: "Quick wins once the deal is signed",
    },
    {
      id: "days_90",
      label: "First 90 days",
      note: "Structural work for the 100-day plan",
    },
  ];

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function formatDays(n: number): string {
  return String(Math.round(n * 100) / 100);
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[10px] font-bold tracking-[0.08em] text-muted-on-paper uppercase">
      {children}
    </div>
  );
}

export function RatingPill({ rating }: { rating: TddRating }) {
  const r = RATING[rating];
  const solid = rating !== "pass" && rating !== "not_assessed";
  return (
    <span
      className="inline-block shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase"
      style={
        solid
          ? { backgroundColor: r.hex, color: "#fff" }
          : { color: r.hex, boxShadow: `inset 0 0 0 1px ${r.hex}66` }
      }
    >
      {r.label}
    </span>
  );
}

function PassBar({
  passed,
  run,
  hex,
}: {
  passed: number;
  run: number;
  hex: string;
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#eceef1]">
      {run > 0 && (
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max((passed / run) * 100, 2)}%`,
            backgroundColor: hex,
          }}
        />
      )}
    </div>
  );
}

/** One honest line on how much of the catalog actually ran. */
export function CoverageStrip({ tdd }: { tdd: TddAssessment }) {
  const c = tdd.coverage;
  const items = [
    { value: c.checksRun, label: "checks run" },
    { value: c.checksPassed, label: "passed", hex: RATING.pass.hex },
    {
      value: c.checksFailed,
      label: "failed",
      hex: c.checksFailed > 0 ? RATING.critical.hex : undefined,
    },
    {
      value: tdd.domains.filter((d) => d.checksRun > 0).length,
      label: `of ${tdd.domains.length} domains`,
    },
  ];
  return (
    <div className="rounded-lg border border-paper-line bg-paper px-4 py-3 break-inside-avoid">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-baseline gap-1.5">
            <span
              className="text-xl leading-none font-bold tabular-nums"
              style={{ color: i.hex ?? INK }}
            >
              {i.value}
            </span>
            <span className="font-mono text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
              {i.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-on-paper">
        {c.checksRun} of {c.catalogSize} catalog checks had the data to run on
        this scan; {c.notAssessed} were not assessed and are excluded from every
        rating rather than counted as passed.{" "}
        {c.filesAnalyzed.toLocaleString("en-US")} of{" "}
        {c.filesInRepository.toLocaleString("en-US")} repository files were
        analyzed in depth.
      </p>
    </div>
  );
}

/** Six executive risk areas — the first thing an investor reads. */
export function AreaGrid({ tdd }: { tdd: TddAssessment }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {tdd.areas.map((a) => {
        const r = RATING[a.rating];
        return (
          <div
            key={a.id}
            className="flex flex-col rounded-lg border border-paper-line bg-paper-card px-3.5 py-3 break-inside-avoid"
            style={{ borderTop: `3px solid ${r.hex}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[13px] leading-snug font-bold text-[#1C2128]">
                {a.name}
              </span>
              <RatingPill rating={a.rating} />
            </div>
            <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-snug text-muted-on-paper">
              {a.headline}
            </p>
            <div className="mt-2.5">
              <PassBar passed={a.checksPassed} run={a.checksRun} hex={r.hex} />
              <div className="mt-1 font-mono text-[10px] text-muted-on-paper tabular-nums">
                {a.checksRun > 0
                  ? `${a.checksPassed}/${a.checksRun} checks passed`
                  : "No checks ran"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 15 domains grouped under their area. */
export function DomainScorecard({ tdd }: { tdd: TddAssessment }) {
  return (
    <div className="overflow-hidden rounded-lg border border-paper-line">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-paper-line bg-paper font-mono text-[10px] tracking-[0.08em] text-muted-on-paper uppercase">
            <th className="px-4 py-2 font-bold">Domain</th>
            <th className="hidden w-36 px-4 py-2 font-bold sm:table-cell">
              Checks passed
            </th>
            <th className="w-20 px-4 py-2 text-right font-bold">Rating</th>
          </tr>
        </thead>
        {tdd.areas.map((a) => (
          <tbody key={a.id} className="break-inside-avoid">
            <tr className="border-b border-paper-line bg-[#f6f7f4]">
              <td
                colSpan={2}
                className="px-4 py-2 text-[12px] font-bold text-[#1C2128]"
              >
                {a.name}
              </td>
              <td className="px-4 py-2 text-right">
                <RatingPill rating={a.rating} />
              </td>
            </tr>
            {tdd.domains
              .filter((d) => d.areaId === a.id)
              .map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-paper-line last:border-b-0"
                >
                  <td className="py-2 pr-4 pl-8 text-[13px] text-[#1C2128]">
                    {d.name}
                    <span className="ml-2 font-mono text-[10px] text-muted-on-paper tabular-nums sm:hidden">
                      {d.checksRun > 0
                        ? `${d.checksPassed}/${d.checksRun}`
                        : "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-2 sm:table-cell">
                    {d.checksRun > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <PassBar
                            passed={d.checksPassed}
                            run={d.checksRun}
                            hex={RATING[d.rating].hex}
                          />
                        </div>
                        <span className="w-9 text-right font-mono text-[11px] text-muted-on-paper tabular-nums">
                          {d.checksPassed}/{d.checksRun}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-muted-on-paper">
                        Not assessed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <RatingPill rating={d.rating} />
                  </td>
                </tr>
              ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function failedChecks(tdd: TddAssessment): TddCheck[] {
  return tdd.checks
    .filter((c) => c.status === "fail")
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

function domainPath(tdd: TddAssessment, domainId: string): string {
  const d = tdd.domains.find((x) => x.id === domainId);
  const a = tdd.areas.find((x) => x.id === d?.areaId);
  return [a?.name, d?.name].filter(Boolean).join(" › ");
}

/** Risk classification counts, then every failed check with its evidence and business impact. */
export function FindingsEvidence({ tdd }: { tdd: TddAssessment }) {
  const failed = failedChecks(tdd);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SEVERITIES.map((s) => {
          const n = tdd.riskCounts[s];
          return (
            <div
              key={s}
              className="rounded-lg border border-paper-line bg-paper px-3 py-2.5 break-inside-avoid"
            >
              <div
                className="text-2xl leading-none font-bold tabular-nums"
                style={{ color: n > 0 ? RATING[s].hex : "#b4bac4" }}
              >
                {n}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: n > 0 ? RATING[s].hex : "#d3d7de" }}
                />
                {RATING[s].label}
              </div>
            </div>
          );
        })}
      </div>

      {failed.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg border border-pass/30 bg-pass/10 px-3.5 py-2.5 text-xs text-[#1C2128]">
          <span className="font-bold text-pass">✓</span>
          Every check that ran on this scan passed.
        </p>
      ) : (
        <ol className="space-y-2.5">
          {failed.map((c, i) => (
            <li
              key={c.id}
              className="overflow-hidden rounded-lg border border-paper-line break-inside-avoid"
              style={{ borderLeft: `3px solid ${RATING[c.severity].hex}` }}
            >
              <div className="px-4 pt-3 pb-2.5">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="font-mono text-[10px] font-bold text-muted-on-paper tabular-nums">
                    F{String(i + 1).padStart(2, "0")}
                  </span>
                  <RatingPill rating={c.severity} />
                  <span className="text-[13px] font-bold text-[#1C2128]">
                    {c.title}
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-on-paper">
                  {domainPath(tdd, c.domainId)}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#1C2128]">
                  <span className="font-semibold">Finding: </span>
                  {c.detail}
                </p>
                {c.evidence.length > 0 && (
                  <ul className="mt-2 space-y-0.5 rounded-md border border-paper-line bg-paper px-3 py-2">
                    {c.evidence.map((e, j) => (
                      <li
                        key={j}
                        className="flex min-w-0 gap-2 text-[11px] leading-snug"
                      >
                        <span className="shrink-0 font-mono font-semibold break-all text-[#1C2128]">
                          {e.path}
                          {e.line ? `:${e.line}` : ""}
                        </span>
                        <span className="min-w-0 truncate text-muted-on-paper">
                          {e.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-paper-line bg-[#f6f7f4] px-4 py-2 text-[11px] leading-relaxed text-[#1C2128]">
                <span className="font-mono text-[10px] font-bold tracking-[0.06em] text-muted-on-paper uppercase">
                  Business impact ·{" "}
                </span>
                {c.businessImpact}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Area-level translation for the deal team: what each risk means and what it costs to fix. */
export function BusinessImpact({ tdd }: { tdd: TddAssessment }) {
  const failed = failedChecks(tdd);
  const rows = tdd.areas
    .map((a) => {
      const domainIds = tdd.domains
        .filter((d) => d.areaId === a.id)
        .map((d) => d.id);
      const worst = failed.find((c) => domainIds.includes(c.domainId));
      const days = tdd.remediationPlan.steps
        .filter((s) => s.areaId === a.id)
        .reduce((sum, s) => sum + s.estimatedDays, 0);
      return { area: a, worst, days };
    })
    .filter((r) => r.worst);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-muted-on-paper">
        No failed checks — no business impact to report.
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-paper-line">
      {rows.map(({ area, worst, days }) => (
        <div
          key={area.id}
          className="grid gap-x-4 gap-y-1 border-b border-paper-line px-4 py-3 break-inside-avoid last:border-b-0 sm:grid-cols-[11rem_1fr_auto]"
        >
          <div className="flex items-start gap-2 sm:flex-col sm:gap-1">
            <span className="text-[13px] font-bold text-[#1C2128]">
              {area.name}
            </span>
            <RatingPill rating={area.rating} />
          </div>
          <p className="text-xs leading-relaxed text-[#1C2128]">
            {worst!.businessImpact}
          </p>
          <div className="font-mono text-[11px] text-muted-on-paper tabular-nums sm:text-right">
            {days > 0 ? `${formatDays(days)} days` : "Advisory"}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Phased plan: before close → 30 days → 90 days, each with engineer-days and cost. */
export function RemediationPlan({ tdd }: { tdd: TddAssessment }) {
  const { steps, byPhase } = tdd.remediationPlan;
  if (steps.length === 0) {
    return (
      <p className="rounded-lg border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-muted-on-paper">
        No remediation items — nothing significant enough to cost out.
      </p>
    );
  }
  const totalDays =
    Math.round(PHASES.reduce((s, p) => s + byPhase[p.id].days, 0) * 100) / 100;
  const totalLow = PHASES.reduce((s, p) => s + byPhase[p.id].costLowUsd, 0);
  const totalHigh = PHASES.reduce((s, p) => s + byPhase[p.id].costHighUsd, 0);
  const areaName = (id: string) =>
    tdd.areas.find((a) => a.id === id)?.name ?? "";

  return (
    <>
      <div className="mb-3 grid gap-2.5 sm:grid-cols-3">
        {PHASES.map((p, i) => {
          const b = byPhase[p.id];
          return (
            <div
              key={p.id}
              className="rounded-lg border border-paper-line bg-paper px-3.5 py-3 break-inside-avoid"
            >
              <div className="font-mono text-[10px] font-bold tracking-[0.08em] text-cobalt uppercase">
                Phase {i + 1} · {p.label}
              </div>
              <div className="mt-1.5 text-lg leading-tight font-bold text-[#1C2128] tabular-nums">
                {b.days > 0
                  ? `${formatUsd(b.costLowUsd)}–${formatUsd(b.costHighUsd)}`
                  : "—"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-on-paper">
                {b.days > 0
                  ? `${formatDays(b.days)} engineer-days`
                  : "Nothing scheduled"}{" "}
                · {p.note}
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-paper-line break-inside-avoid">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-paper-line bg-paper font-mono text-[10px] tracking-[0.08em] text-muted-on-paper uppercase">
              <th className="px-4 py-2 font-bold">Workstream</th>
              <th className="hidden w-28 px-4 py-2 font-bold sm:table-cell">
                Phase
              </th>
              <th className="w-16 px-4 py-2 text-right font-bold">Days</th>
              <th className="hidden w-36 px-4 py-2 text-right font-bold sm:table-cell">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => (
              <tr key={i} className="border-b border-paper-line">
                <td className="px-4 py-2.5 align-top">
                  <div className="text-[13px] font-semibold text-[#1C2128]">
                    {s.category}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted-on-paper">
                    {s.description}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-on-paper">
                    {areaName(s.areaId)}
                    <span className="sm:hidden">
                      {" "}
                      · {PHASES.find((p) => p.id === s.phase)?.label}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-2.5 align-top text-[11px] text-[#1C2128] sm:table-cell">
                  {PHASES.find((p) => p.id === s.phase)?.label}
                </td>
                <td className="px-4 py-2.5 text-right align-top font-mono text-[13px] font-semibold text-[#1C2128] tabular-nums">
                  {formatDays(s.estimatedDays)}
                </td>
                <td className="hidden px-4 py-2.5 text-right align-top font-mono text-[11px] text-muted-on-paper tabular-nums sm:table-cell">
                  {formatUsd(s.costLowUsd)}–{formatUsd(s.costHighUsd)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#1C2128] text-white">
              <td className="px-4 py-3 text-[13px] font-bold">Total</td>
              <td className="hidden sm:table-cell" />
              <td className="px-4 py-3 text-right font-mono text-[13px] font-bold tabular-nums">
                {formatDays(totalDays)}
              </td>
              <td className="hidden px-4 py-3 text-right font-mono text-[11px] font-bold tabular-nums sm:table-cell">
                {formatUsd(totalLow)}–{formatUsd(totalHigh)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-on-paper">
        Engineer-days are a static planning estimate at a blended $600–$1,000
        day rate, not a quote. Team and knowledge risks are handled through deal
        terms (retention, transition periods) rather than engineering days.
      </p>
    </>
  );
}

/** Appendix: the full catalog, including what wasn't assessed and why. */
export function CheckCatalog({ tdd }: { tdd: TddAssessment }) {
  return (
    <div className="space-y-4">
      {tdd.areas.map((a) => (
        <div key={a.id}>
          <Label>{a.name}</Label>
          <div className="overflow-hidden rounded-lg border border-paper-line">
            {tdd.domains
              .filter((d) => d.areaId === a.id)
              .flatMap((d) =>
                tdd.checks
                  .filter((c) => c.domainId === d.id)
                  .map((c) => ({ c, d })),
              )
              .map(({ c, d }) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[1.25rem_1fr] gap-x-2 border-b border-paper-line px-3.5 py-2 break-inside-avoid last:border-b-0 ${
                    c.status === "not_assessed" ? "bg-[#fafbf8]" : ""
                  }`}
                >
                  <StatusMark status={c.status} severity={c.severity} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span
                        className={`text-[12px] font-semibold ${c.status === "not_assessed" ? "text-muted-on-paper" : "text-[#1C2128]"}`}
                      >
                        {c.title}
                      </span>
                      <span className="font-mono text-[10px] text-muted-on-paper">
                        {d.name}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug text-muted-on-paper">
                      {c.detail}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusMark({
  status,
  severity,
}: {
  status: TddCheck["status"];
  severity: TddCheckSeverity;
}) {
  if (status === "pass")
    return (
      <span
        className="pt-px text-[13px] font-bold text-pass"
        aria-label="Passed"
      >
        ✓
      </span>
    );
  if (status === "fail")
    return (
      <span
        className="pt-px text-[13px] font-bold"
        style={{ color: RATING[severity].hex }}
        aria-label="Failed"
      >
        ✗
      </span>
    );
  return (
    <span
      className="pt-px text-[13px] font-bold text-[#b4bac4]"
      aria-label="Not assessed"
    >
      –
    </span>
  );
}
