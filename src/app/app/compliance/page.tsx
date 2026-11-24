"use client";

import { useEffect, useState } from "react";
import { getComplianceReport } from "@/lib/api";
import { ComplianceFramework, ComplianceReport } from "@/lib/types";
import { RequireAuth } from "@/components/RequireAuth";
import { PageHeader } from "@/components/PageHeader";
import {
  ComplianceReportView,
  complianceCsv,
} from "@/components/ComplianceReportView";
import {
  TeamInsightsUpsell,
  useTeamInsightsAccess,
} from "@/components/TeamInsightsGate";

const FRAMEWORKS: Array<{ id: ComplianceFramework; label: string }> = [
  { id: "soc2", label: "SOC 2" },
  { id: "iso27001", label: "ISO 27001" },
];

const WINDOWS = [30, 90, 180, 365];

const toggle = (active: boolean) =>
  `rounded px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase ${
    active ? "bg-cobalt text-white" : "text-muted-on-ink hover:bg-ink-line"
  }`;

export default function CompliancePage() {
  const [framework, setFramework] = useState<ComplianceFramework>("soc2");
  const [days, setDays] = useState(90);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const filterKey = `${framework}:${days}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const reloading = report != null && loadedKey !== filterKey;
  const access = useTeamInsightsAccess();

  useEffect(() => {
    if (access !== "allowed") return;
    let cancelled = false;
    getComplianceReport(framework, days)
      .then((r) => {
        if (cancelled) return;
        setReport(r);
        setError(null);
        setLoadedKey(`${framework}:${days}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load the compliance report.",
        );
        setLoadedKey(`${framework}:${days}`);
      });
    return () => {
      cancelled = true;
    };
  }, [framework, days, access]);

  const downloadCsv = () => {
    if (!report) return;
    const blob = new Blob([complianceCsv(report)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-bench-${report.framework}-evidence-${report.generatedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10 print:max-w-none print:p-0">
        <div className="print:hidden">
          <PageHeader
            kicker="Audit evidence"
            title="Compliance report"
            description="Your code reviews as evidence for SOC 2 and ISO 27001: what was reviewed before merge, what the security checks caught, and which controls each finding relates to. Share it with your auditor as a PDF or CSV."
            action={
              access === "allowed" ? (
                <div className="flex gap-2">
                  <button
                    onClick={downloadCsv}
                    disabled={!report}
                    className="rounded-lg border border-ink-line px-4 py-2 text-sm font-bold text-muted-on-ink hover:border-cobalt hover:text-white disabled:opacity-50"
                  >
                    Download CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    disabled={!report}
                    className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark disabled:opacity-50"
                  >
                    Save as PDF
                  </button>
                </div>
              ) : undefined
            }
          />

          {access === "checking" && (
            <div className="text-sm text-muted-on-ink">Checking your plan…</div>
          )}
          {access === "locked" && <TeamInsightsUpsell feature="compliance" />}
        </div>

        {access === "allowed" && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2 print:hidden">
              <div
                className="flex gap-1 rounded-md border border-ink-line bg-ink-soft p-0.5"
                role="group"
                aria-label="Framework"
              >
                {FRAMEWORKS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFramework(f.id)}
                    className={toggle(framework === f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div
                className="flex gap-1 rounded-md border border-ink-line bg-ink-soft p-0.5"
                role="group"
                aria-label="Period"
              >
                {WINDOWS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={toggle(days === d)}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
                {error}
              </div>
            )}

            {!report && !error && (
              <div
                className="h-[420px] animate-pulse rounded-xl border border-ink-line bg-ink-soft"
                aria-busy="true"
                aria-label="Loading report"
              />
            )}

            {report && (
              <div
                className={`transition-opacity ${reloading ? "pointer-events-none opacity-50" : ""}`}
                aria-busy={reloading}
              >
                <ComplianceReportView report={report} />
              </div>
            )}
          </>
        )}
      </div>
    </RequireAuth>
  );
}
