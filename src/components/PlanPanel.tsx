"use client";

import { useEffect, useState } from "react";
import { getUsage, listPlans, changePlan, getMyPlanRequests } from "@/lib/api";
import { Plan, PlanRequest, Usage } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";

function formatPrice(plan: Plan): string {
  // Enterprise is stored at $0 as a "contact sales" placeholder, not a free tier.
  if (plan.slug === "enterprise") return "Custom";
  if (plan.priceMonthlyCents === 0) return "Free";
  return `$${(plan.priceMonthlyCents / 100).toFixed(0)}/mo`;
}

function repoScanQuotaLabel(plan: Plan): string | null {
  if (!plan.repositoryScan) return null;
  if (plan.monthlyRepoScanLimit == null) return "Unlimited AI repo scans";
  return `${plan.monthlyRepoScanLimit} AI repo scan${plan.monthlyRepoScanLimit === 1 ? "" : "s"}/month`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatLimit(n: number | null): string {
  return n == null ? "Unlimited" : String(n);
}

function repoScanLabel(plan: Plan): string {
  if (!plan.repositoryScan) return "No repository scan";
  if (plan.maxRepositories == null) return "Repository scan";
  return `Repository scan (${plan.maxRepositories} repo${plan.maxRepositories === 1 ? "" : "s"})`;
}

function alignmentLabLabel(plan: Plan): string | null {
  if (!plan.alignmentLabEnabled) return null;
  if (plan.monthlyInvestigationLimit == null)
    return "Alignment Lab (unlimited)";
  return `Alignment Lab (${plan.monthlyInvestigationLimit}/month)`;
}

// Mirrors the backend's UsersService.isSelfServicePlan — only used here to
// pick the right button label; the server is what actually enforces it.
function isSelfServicePlan(plan: Plan): boolean {
  return plan.priceMonthlyCents === 0 && plan.slug !== "enterprise";
}

export function PlanPanel() {
  const { user, refreshUser } = useAuth();
  const canManageOrgPlan =
    user?.orgRole === "owner" || user?.orgRole === "admin";
  const [usage, setUsage] = useState<Usage | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    Promise.all([getUsage(), listPlans(), getMyPlanRequests()])
      .then(([u, p, r]) => {
        setUsage(u);
        setPlans(p);
        setPlanRequests(r);
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load plan info.",
        ),
      );
  };

  useEffect(load, []);

  const pendingRequest = planRequests.find((r) => r.status === "pending");

  const handleApply = async (plan: Plan) => {
    setSwitching(plan.slug);
    setError(null);
    setNotice(null);
    try {
      const result = await changePlan(plan.slug);
      if (result.applied) {
        await refreshUser();
        load();
      } else {
        setNotice(
          `Request submitted — ${plan.name} is pending admin approval.`,
        );
        load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change plan.");
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
        {usage?.scope === "organization" ? "Team plan & usage" : "Plan & usage"}
      </h2>
      {usage?.scope === "organization" && (
        <p className="mb-3 text-[11px] text-muted-on-ink">
          Shared across everyone in{" "}
          <strong className="text-[#E8ECF4]">{usage.organizationName}</strong> —
          every teammate&apos;s audits and scans draw from the same pool.
        </p>
      )}

      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-3 rounded-lg border border-cobalt/40 bg-cobalt/10 px-3.5 py-2.5 text-[13px] text-[#B9CCF7]">
          {notice}
        </div>
      )}

      {pendingRequest && (
        <div className="mb-3 rounded-lg border border-high/40 bg-high/10 px-3.5 py-2.5 text-[13px] text-[#F0CE9A]">
          Your request for <strong>{pendingRequest.requestedPlan.name}</strong>{" "}
          is awaiting admin approval (submitted{" "}
          {new Date(pendingRequest.createdAt).toLocaleString()}).
        </div>
      )}

      {usage?.planExpiresAt && (
        <ExpiryNotice
          planName={usage.plan.name}
          expiresAt={usage.planExpiresAt}
        />
      )}

      {usage && (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <UsageCard
            label="AI audits today"
            used={usage.dailyUsed}
            limit={usage.dailyLimit}
            resetsAt={usage.dailyResetsAt}
          />
          <UsageCard
            label="AI audits this month"
            used={usage.monthlyUsed}
            limit={usage.monthlyLimit}
            resetsAt={usage.monthlyResetsAt}
          />
          <UsageCard
            label="AI repo scans this month"
            used={usage.repoScansUsed}
            limit={usage.repoScanLimit}
            resetsAt={usage.monthlyResetsAt}
          />
        </div>
      )}
      <p className="mb-4 text-[11px] text-muted-on-ink">
        Only counts audits and repository scans that actually used AI — local
        checks (lint, types, complexity, formatting) and cached results are
        unlimited and free. Pull/merge request reviews don&apos;t count toward
        repo scans.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = usage?.plan.slug === plan.slug;
          const selfService = isSelfServicePlan(plan);
          const isPendingThis =
            pendingRequest?.requestedPlan.slug === plan.slug;
          const blockedByOtherPending =
            Boolean(pendingRequest) && !isPendingThis;

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-3.5 ${
                isCurrent
                  ? "border-cobalt bg-ink-soft"
                  : "border-ink-line bg-ink-soft"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#E8ECF4]">
                  {plan.name}
                </span>
                {isCurrent && (
                  <span className="rounded bg-cobalt px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                    Current
                  </span>
                )}
              </div>
              <div className="mb-2 text-xs text-muted-on-ink">
                {formatPrice(plan)}
              </div>
              <ul className="mb-3 space-y-0.5 text-[11px] text-muted-on-ink">
                <li>{formatLimit(plan.dailyAuditLimit)} AI audits/day</li>
                <li>{formatLimit(plan.monthlyAuditLimit)} AI audits/month</li>
                <li>{repoScanLabel(plan)}</li>
                {repoScanQuotaLabel(plan) && (
                  <li>{repoScanQuotaLabel(plan)}</li>
                )}
                {plan.dueDiligence && (
                  <li className="font-semibold text-[#E8ECF4]">
                    Technical due diligence
                  </li>
                )}
                {alignmentLabLabel(plan) && <li>{alignmentLabLabel(plan)}</li>}
              </ul>
              {!isCurrent && isPendingThis && (
                <div className="w-full rounded-md border border-high/40 px-2 py-1.5 text-center text-xs font-bold text-high">
                  Pending approval
                </div>
              )}
              {!isCurrent &&
                !isPendingThis &&
                (usage?.scope === "organization" && !canManageOrgPlan ? (
                  <div
                    title="Only an organization owner or admin can change the team plan"
                    className="w-full rounded-md border border-ink-line px-2 py-1.5 text-center text-xs font-medium text-muted-on-ink"
                  >
                    Owner/admin only
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(plan)}
                    disabled={switching !== null || blockedByOtherPending}
                    title={
                      blockedByOtherPending
                        ? "You already have a pending plan request"
                        : undefined
                    }
                    className="w-full cursor-pointer rounded-md border border-cobalt px-2 py-1.5 text-xs font-bold text-cobalt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {switching === plan.slug
                      ? "Submitting…"
                      : selfService
                        ? "Switch"
                        : "Request"}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-on-ink">
        Free switches instantly. Paid plans need admin approval, run for 30 days
        from approval, then switch back to Free automatically unless renewed.
      </p>
    </div>
  );
}

function ExpiryNotice({
  planName,
  expiresAt,
}: {
  planName: string;
  expiresAt: string;
}) {
  const when = new Date(expiresAt);
  // Snapshot "now" at render rather than ticking: the panel reloads after any plan change anyway.
  const [now] = useState(() => Date.now());
  const daysLeft = Math.max(0, Math.ceil((when.getTime() - now) / DAY_MS));
  const soon = daysLeft <= 7;
  return (
    <div
      className={`mb-3 rounded-lg border px-3.5 py-2.5 text-[13px] ${
        soon
          ? "border-high/40 bg-high/10 text-[#F0CE9A]"
          : "border-ink-line bg-ink-soft text-muted-on-ink"
      }`}
    >
      <strong className={soon ? "" : "text-[#E8ECF4]"}>{planName}</strong> is
      active until{" "}
      {when.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}{" "}
      ({daysLeft} day
      {daysLeft === 1 ? "" : "s"} left). After that the account switches to Free
      automatically — contact us at noumanqureshi15@gmail.com to renew.
    </div>
  );
}

function UsageCard({
  label,
  used,
  limit,
  resetsAt,
}: {
  label: string;
  used: number;
  limit: number | null;
  resetsAt: string;
}) {
  const pct =
    limit != null ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
          {label}
        </span>
        <span className="font-mono text-xs text-muted-on-ink">
          {limit != null ? `${used}/${limit}` : `${used} (unlimited)`}
        </span>
      </div>
      {limit != null && (
        <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-line">
          <div
            className={`h-full rounded-full ${pct >= 100 ? "bg-critical" : "bg-cobalt"}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
      )}
      <div className="text-[10px] text-muted-on-ink">
        Resets {new Date(resetsAt).toLocaleString()}
      </div>
    </div>
  );
}
