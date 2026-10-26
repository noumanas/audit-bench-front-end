"use client";

import { useState } from "react";
import type {
  RiskAggregation,
  ScanJob,
  SecretFinding,
  SkipReason,
  SkippedFiles,
  Verdict,
} from "@/lib/types";

const SKIP_LABEL: Record<SkipReason, { label: string; why: string }> = {
  generated: {
    label: "Generated code",
    why: "Designer files, migrations, resource files and other tool output. Excluded by default; still searched for secrets.",
  },
  vendor: {
    label: "Third-party code",
    why: "Libraries copied into the repository, such as jQuery under wwwroot/lib.",
  },
  not_source: {
    label: "Not source code",
    why: "Project, markup, resource and data files the code review doesn’t read.",
  },
  file_limit: {
    label: "Over the file limit",
    why: "Each scan reviews a fixed number of files, riskiest first (accounts, money, data access, endpoints).",
  },
  too_large: { label: "Too large", why: "Over the per-file size limit." },
  binary: { label: "Binary", why: "Images, fonts and other non-text files." },
  ignored_by_rule: {
    label: "Ignored by your rules",
    why: "Matched an ignore path in your review rules or auditbench.md.",
  },
};

const SKIP_ORDER: SkipReason[] = [
  "file_limit",
  "not_source",
  "generated",
  "vendor",
  "too_large",
  "ignored_by_rule",
  "binary",
];

/** Distinct secrets: the same key pasted in several files is one key to rotate. Older scans have no fingerprint. */
export function groupSecrets(secrets: SecretFinding[]) {
  const groups = new Map<
    string,
    {
      rule: string;
      snippet: string;
      places: Array<{ path: string; line: number }>;
    }
  >();
  secrets.forEach((s, i) => {
    const key = s.fingerprint ?? `${i}`;
    const g = groups.get(key);
    if (g) g.places.push({ path: s.path, line: s.line });
    else
      groups.set(key, {
        rule: s.rule,
        snippet: s.snippet,
        places: [{ path: s.path, line: s.line }],
      });
  });
  return [...groups.values()];
}

/**
 * The verdict shown in the header, kept consistent with the risk assessment
 * below it — reports made before the backend reconciled the two could say
 * "pass" next to exposed secrets.
 */
export function displayVerdict(
  scan: Pick<ScanJob, "verdict" | "secrets" | "riskAggregation">,
): Verdict | null {
  if (!scan.verdict) return null;
  if (scan.secrets?.length) return "do_not_ship";
  if (
    scan.verdict === "pass" &&
    scan.riskAggregation?.overallRiskRating === "high"
  )
    return "needs_work";
  return scan.verdict;
}

export function SecretGroups({ secrets }: { secrets: SecretFinding[] }) {
  const groups = groupSecrets(secrets);
  return (
    <div className="space-y-3">
      {groups.length < secrets.length && (
        <p className="text-xs text-[#1C2128]">
          <strong>{groups.length}</strong> distinct secret
          {groups.length === 1 ? "" : "s"} found in{" "}
          <strong>{secrets.length}</strong> places. Rotate each key once, then
          remove every copy.
        </p>
      )}
      <ul className="divide-y divide-paper-line">
        {groups.map((g, i) => (
          <li key={i} className="py-2 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="rounded bg-critical/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-critical uppercase">
                {g.rule}
              </span>
              <span className="font-mono text-xs break-all text-[#1C2128]">
                {g.places[0].path}:{g.places[0].line}
              </span>
              {g.places.length > 1 && (
                <span className="text-[11px] text-muted-on-paper">
                  and {g.places.length - 1} more place
                  {g.places.length === 2 ? "" : "s"}
                </span>
              )}
            </div>
            <code className="mt-1 block truncate font-mono text-[11px] text-muted-on-paper">
              {g.snippet}
            </code>
            {g.places.length > 1 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[11px] text-cobalt">
                  Show all {g.places.length} places
                </summary>
                <ul className="mt-1 space-y-0.5 font-mono text-[11px] break-all text-muted-on-paper">
                  {g.places.map((p, j) => (
                    <li key={j}>
                      {p.path}:{p.line}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </li>
        ))}
      </ul>
      <div className="rounded-md border border-paper-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-[#1C2128]">
        <div className="mb-1 font-bold">How to fix exposed secrets</div>
        <ol className="list-decimal space-y-1 pl-4">
          <li>
            <strong>Revoke and rotate</strong> each key at the provider (Shopify
            admin, Azure portal, AWS IAM…). Do this even if the key looks
            expired: we can’t tell from the code whether it still works.
          </li>
          <li>
            <strong>Move it out of the code</strong> into configuration the
            repository doesn’t contain: environment variables or user secrets
            locally, and a vault such as Azure Key Vault or AWS Secrets Manager
            in production.
          </li>
          <li>
            <strong>Remove it from git history</strong> with{" "}
            <code>git filter-repo</code> or BFG, then force-push and ask
            everyone to re-clone. Deleting the line in a new commit leaves the
            key in every old commit.
          </li>
          <li>
            <strong>Stop it happening again</strong>: add a secret scanner to
            your pre-commit hooks or CI, and enable GitHub secret scanning on
            the repository.
          </li>
        </ol>
      </div>
    </div>
  );
}

/** Every file the scan didn't review, grouped by why — nothing is skipped silently. */
export function SkippedFilesList({
  skipped,
  reviewed,
}: {
  skipped: SkippedFiles;
  reviewed: number;
}) {
  const [openReason, setOpenReason] = useState<SkipReason | null>(null);
  const reasons = SKIP_ORDER.filter((r) => (skipped.counts[r] ?? 0) > 0);
  const total = reasons.reduce((n, r) => n + (skipped.counts[r] ?? 0), 0);
  if (!total)
    return (
      <p className="text-xs">Every file in the repository was reviewed.</p>
    );
  return (
    <div className="space-y-2">
      <p className="text-xs text-[#1C2128]">
        Reviewed <strong>{reviewed}</strong> file{reviewed === 1 ? "" : "s"}.{" "}
        <strong>{total}</strong> other file
        {total === 1 ? " was" : "s were"} left out:
      </p>
      <ul className="divide-y divide-paper-line rounded-md border border-paper-line">
        {reasons.map((r) => {
          const paths = skipped.files.filter((f) => f.reason === r);
          const open = openReason === r;
          return (
            <li key={r} className="px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenReason(open ? null : r)}
                aria-expanded={open}
                className="flex w-full cursor-pointer items-baseline gap-2 text-left"
              >
                <span className="font-mono text-xs font-bold text-[#1C2128] tabular-nums">
                  {skipped.counts[r]}
                </span>
                <span className="text-xs font-semibold text-[#1C2128]">
                  {SKIP_LABEL[r].label}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-muted-on-paper">
                  {SKIP_LABEL[r].why}
                </span>
                {paths.length > 0 && (
                  <span className="shrink-0 text-[11px] text-cobalt">
                    {open ? "Hide" : "Show"}
                  </span>
                )}
              </button>
              {open && (
                <ul className="mt-1.5 max-h-56 space-y-0.5 overflow-y-auto font-mono text-[11px] break-all text-muted-on-paper">
                  {paths.map((f) => (
                    <li key={f.path}>{f.path}</li>
                  ))}
                  {paths.length < (skipped.counts[r] ?? 0) && (
                    <li>…and {(skipped.counts[r] ?? 0) - paths.length} more</li>
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The arithmetic behind the remediation estimate, so a reader can check and adjust it. */
export function RemediationBasis({
  remediation,
}: {
  remediation: RiskAggregation["remediation"];
}) {
  if (!remediation.items.length) return null;
  return (
    <details className="rounded-lg border border-paper-line px-4 py-2.5 text-xs text-[#1C2128]">
      <summary className="cursor-pointer font-semibold">
        How the remediation estimate is calculated
      </summary>
      <table className="mt-2 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-paper-line text-[10px] tracking-[0.06em] text-muted-on-paper uppercase">
            <th className="py-1 pr-3 font-mono font-bold">Item</th>
            <th className="py-1 pr-3 font-mono font-bold">Basis</th>
            <th className="py-1 text-right font-mono font-bold">Days</th>
          </tr>
        </thead>
        <tbody>
          {remediation.items.map((item) => (
            <tr
              key={item.category}
              className="border-b border-paper-line align-top last:border-0"
            >
              <td className="py-1.5 pr-3">
                <div className="font-semibold">{item.category}</div>
                <div className="text-muted-on-paper">{item.description}</div>
              </td>
              <td className="py-1.5 pr-3 text-muted-on-paper">
                {item.basis ?? "—"}
              </td>
              <td className="py-1.5 text-right font-mono tabular-nums">
                {item.estimatedDays}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-muted-on-paper">
        {remediation.rateBasis ??
          "Engineer-days × a blended rate of $600–$1,000 per day. A planning range from fixed per-finding allowances, not a quote."}
      </p>
    </details>
  );
}
