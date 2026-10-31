'use client';

import { useEffect, useState } from 'react';
import { getUsage, listPlans, changePlan, getMyPlanRequests } from '@/lib/api';
import { Plan, PlanRequest, Usage } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

function formatPrice(plan: Plan): string {
  // Enterprise is stored at $0 as a "contact sales" placeholder, not a free tier.
  if (plan.slug === 'enterprise') return 'Custom';
  if (plan.priceMonthlyCents === 0) return 'Free';
  return `$${(plan.priceMonthlyCents / 100).toFixed(0)}/mo`;
}

function repoScanQuotaLabel(plan: Plan): string | null {
  if (!plan.repositoryScan) return null;
  if (plan.monthlyRepoScanLimit == null) return 'Unlimited AI repo scans';
  return `${plan.monthlyRepoScanLimit} AI repo scan${plan.monthlyRepoScanLimit === 1 ? '' : 's'}/month`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatLimit(n: number | null): string {
  return n == null ? 'Unlimited' : String(n);
}

function repoScanLabel(plan: Plan): string {
  if (!plan.repositoryScan) return 'No repository scan';
  if (plan.maxRepositories == null) return 'Repository scan';
  return `Repository scan (${plan.maxRepositories} repo${plan.maxRepositories === 1 ? '' : 's'})`;
}

function alignmentLabLabel(plan: Plan): string | null {
  if (!plan.alignmentLabEnabled) return null;
  if (plan.monthlyInvestigationLimit == null) return 'Alignment Lab (unlimited)';
  return `Alignment Lab (${plan.monthlyInvestigationLimit}/month)`;
}

// Mirrors the backend's UsersService.isSelfServicePlan — only used here to
// pick the right button label; the server is what actually enforces it.
function isSelfServicePlan(plan: Plan): boolean {
  return plan.priceMonthlyCents === 0 && plan.slug !== 'enterprise';
}

// Paid plans are paid off-site, then an admin matches the payment and
// approves the request (the backend emails hello@auditbenchai.com on submit).
const PAYMENT_URL = 'https://wise.com/pay/r/CybqhkY2UDfTvIs';
const BILLING_EMAIL = 'hello@auditbenchai.com';

// Fallback when the Wise link fails: a direct transfer to the Wise USD account.
const BANK_DETAILS: { label: string; value: string; hint?: string }[] = [
  { label: 'Account holder', value: 'Muhammad Nouman Qureshi' },
  { label: 'Account type', value: 'Deposit' },
  { label: 'Routing number (wire & ACH)', value: '084009519', hint: 'From a US bank' },
  { label: 'Account number', value: '168832787556766' },
  { label: 'Swift/BIC', value: 'TRWIUS35XXX', hint: 'From outside the US' },
  { label: 'Bank address', value: 'Wise US Inc, 108 W 13th St, Wilmington, DE, 19801, United States' },
];

// Enterprise is "contact sales" with no fixed price, so it skips the payment step.
function needsPayment(plan: Plan): boolean {
  return plan.priceMonthlyCents > 0;
}

export function PlanPanel() {
  const { user, refreshUser } = useAuth();
  const canManageOrgPlan = user?.orgRole === 'owner' || user?.orgRole === 'admin';
  const [usage, setUsage] = useState<Usage | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>([]);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [payingFor, setPayingFor] = useState<Plan | null>(null);

  const load = () => {
    Promise.all([getUsage(), listPlans(), getMyPlanRequests()])
      .then(([u, p, r]) => {
        setUsage(u);
        setPlans(p);
        setPlanRequests(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plan info.'));
  };

  useEffect(load, []);

  const pendingRequest = planRequests.find((r) => r.status === 'pending');

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
          needsPayment(plan)
            ? `Request submitted — we'll confirm your payment and activate ${plan.name}, usually within 24 hours.`
            : `Request submitted — ${plan.name} is pending admin approval.`,
        );
        load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan.');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
        {usage?.scope === 'organization' ? 'Team plan & usage' : 'Plan & usage'}
      </h2>
      {usage?.scope === 'organization' && (
        <p className="mb-3 text-[11px] text-muted-on-ink">
          Shared across everyone in <strong className="text-[#E8ECF4]">{usage.organizationName}</strong> — every
          teammate&apos;s audits and scans draw from the same pool.
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
          Your request for <strong>{pendingRequest.requestedPlan.name}</strong> is awaiting approval (submitted{' '}
          {new Date(pendingRequest.createdAt).toLocaleString()}). We activate it once your payment is confirmed —
          questions? {BILLING_EMAIL}
        </div>
      )}

      {usage?.planExpiresAt && <ExpiryNotice planName={usage.plan.name} expiresAt={usage.planExpiresAt} />}

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
        Only counts audits and repository scans that actually used AI — local checks (lint, types, complexity,
        formatting) and cached results are unlimited and free. Pull/merge request reviews don&apos;t count toward repo
        scans.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = usage?.plan.slug === plan.slug;
          const selfService = isSelfServicePlan(plan);
          const isPendingThis = pendingRequest?.requestedPlan.slug === plan.slug;
          const blockedByOtherPending = Boolean(pendingRequest) && !isPendingThis;

          return (
            <div
              key={plan.id}
              className={`rounded-lg border p-3.5 ${
                isCurrent ? 'border-cobalt bg-ink-soft' : 'border-ink-line bg-ink-soft'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-[#E8ECF4]">{plan.name}</span>
                {isCurrent && (
                  <span className="rounded bg-cobalt px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                    Current
                  </span>
                )}
              </div>
              <div className="mb-2 text-xs text-muted-on-ink">{formatPrice(plan)}</div>
              <ul className="mb-3 space-y-0.5 text-[11px] text-muted-on-ink">
                <li>{formatLimit(plan.dailyAuditLimit)} AI audits/day</li>
                <li>{formatLimit(plan.monthlyAuditLimit)} AI audits/month</li>
                <li>{repoScanLabel(plan)}</li>
                {repoScanQuotaLabel(plan) && <li>{repoScanQuotaLabel(plan)}</li>}
                {plan.dueDiligence && <li className="font-semibold text-[#E8ECF4]">Technical due diligence</li>}
                {alignmentLabLabel(plan) && <li>{alignmentLabLabel(plan)}</li>}
              </ul>
              {!isCurrent && isPendingThis && (
                <div className="w-full rounded-md border border-high/40 px-2 py-1.5 text-center text-xs font-bold text-high">
                  Pending approval
                </div>
              )}
              {!isCurrent &&
                !isPendingThis &&
                (usage?.scope === 'organization' && !canManageOrgPlan ? (
                  <div
                    title="Only an organization owner or admin can change the team plan"
                    className="w-full rounded-md border border-ink-line px-2 py-1.5 text-center text-xs font-medium text-muted-on-ink"
                  >
                    Owner/admin only
                  </div>
                ) : (
                  <button
                    onClick={() => (needsPayment(plan) ? setPayingFor(plan) : handleApply(plan))}
                    disabled={switching !== null || blockedByOtherPending}
                    title={blockedByOtherPending ? 'You already have a pending plan request' : undefined}
                    className="w-full cursor-pointer rounded-md border border-cobalt px-2 py-1.5 text-xs font-bold text-cobalt disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {switching === plan.slug ? 'Submitting…' : selfService ? 'Switch' : 'Request'}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-on-ink">
        Free switches instantly. Paid plans need admin approval, run for 30 days from approval, then switch back to Free
        automatically unless renewed.
      </p>

      {payingFor && (
        <PaymentModal
          plan={payingFor}
          email={user?.email}
          submitting={switching === payingFor.slug}
          onCancel={() => setPayingFor(null)}
          onConfirm={async () => {
            await handleApply(payingFor);
            setPayingFor(null);
          }}
        />
      )}
    </div>
  );
}

function PaymentModal({
  plan,
  email,
  submitting,
  onCancel,
  onConfirm,
}: {
  plan: Plan;
  email?: string;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={() => !submitting && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="shadow-panel fade-up max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-ink-line bg-ink-soft p-6"
      >
        <div className="mb-1 font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt uppercase">Upgrade</div>
        <h3 id="payment-modal-title" className="mb-1 text-lg font-bold text-[#E8ECF4]">
          {plan.name} · {formatPrice(plan)}
        </h3>
        <p className="mb-5 text-[13px] leading-relaxed text-muted-on-ink">
          Pay first (Wise link or bank transfer), then submit your request. We check the payment and activate {plan.name} for 30 days — usually
          within 24 hours.
        </p>

        <ol className="mb-5 space-y-4 text-[13px] text-[#E8ECF4]">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cobalt font-mono text-[11px] font-bold text-white">
              1
            </span>
            <div className="flex-1">
              <div className="mb-2 font-semibold">Pay {formatPrice(plan)} via Wise</div>
              <a
                href={PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpened(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-cobalt px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-cobalt-dark"
              >
                Open payment page ↗
              </a>
              {email && (
                <p className="mt-2 text-[11px] text-muted-on-ink">
                  Add <strong className="text-[#E8ECF4]">{email}</strong> as the payment reference so we can match it to
                  your account.
                </p>
              )}
              <BankTransferDetails />
            </div>
          </li>
          <li className="flex gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                opened ? 'bg-cobalt text-white' : 'bg-ink-line text-muted-on-ink'
              }`}
            >
              2
            </span>
            <div className="flex-1">
              <div className="font-semibold">Submit your request</div>
              <p className="mt-0.5 text-[11px] text-muted-on-ink">
                Our team is notified and activates the plan once the payment arrives.
              </p>
            </div>
          </li>
        </ol>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 cursor-pointer rounded-md border border-ink-line px-3 py-2 text-xs font-bold text-muted-on-ink hover:text-[#E8ECF4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-[2] cursor-pointer rounded-md border border-cobalt bg-cobalt/15 px-3 py-2 text-xs font-bold text-[#B9CCF7] hover:bg-cobalt/25 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : "I've paid — submit request"}
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-muted-on-ink">
          Questions about billing?{' '}
          <a href={`mailto:${BILLING_EMAIL}`} className="text-cobalt hover:underline">
            {BILLING_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}

function BankTransferDetails() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (label: string, value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(label);
        setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500);
      })
      .catch(() => {});
  };

  return (
    <details className="group mt-3 rounded-md border border-ink-line bg-ink/60">
      <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-semibold text-muted-on-ink hover:text-[#E8ECF4]">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90">›</span>
        Payment link not working? Pay by bank transfer
      </summary>
      <div className="border-t border-ink-line px-3 py-2.5">
        <p className="mb-2 text-[11px] leading-relaxed text-muted-on-ink">
          USD account on Wise. From a US bank, send a domestic wire or ACH; from anywhere else, send an international
          Swift transfer.
        </p>
        <dl className="space-y-1.5">
          {BANK_DETAILS.map(({ label, value, hint }) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <dt className="text-[10px] text-muted-on-ink">
                  {label}
                  {hint && <span className="text-muted-on-ink/70"> · {hint}</span>}
                </dt>
                <dd className="font-mono text-[12px] break-words text-[#E8ECF4]">{value}</dd>
              </div>
              <button
                type="button"
                onClick={() => copy(label, value)}
                className="mt-2.5 shrink-0 cursor-pointer rounded border border-ink-line px-1.5 py-0.5 font-mono text-[10px] text-muted-on-ink hover:text-[#E8ECF4]"
              >
                {copied === label ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

function ExpiryNotice({ planName, expiresAt }: { planName: string; expiresAt: string }) {
  const when = new Date(expiresAt);
  // Snapshot "now" at render rather than ticking: the panel reloads after any plan change anyway.
  const [now] = useState(() => Date.now());
  const daysLeft = Math.max(0, Math.ceil((when.getTime() - now) / DAY_MS));
  const soon = daysLeft <= 7;
  return (
    <div
      className={`mb-3 rounded-lg border px-3.5 py-2.5 text-[13px] ${
        soon ? 'border-high/40 bg-high/10 text-[#F0CE9A]' : 'border-ink-line bg-ink-soft text-muted-on-ink'
      }`}
    >
      <strong className={soon ? '' : 'text-[#E8ECF4]'}>{planName}</strong> is active until{' '}
      {when.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}{' '}
      ({daysLeft} day
      {daysLeft === 1 ? '' : 's'} left). After that the account switches to Free automatically — contact us at
      {BILLING_EMAIL} to renew.
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
  const pct = limit != null ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{label}</span>
        <span className="font-mono text-xs text-muted-on-ink">
          {limit != null ? `${used}/${limit}` : `${used} (unlimited)`}
        </span>
      </div>
      {limit != null && (
        <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-line">
          <div
            className={`h-full rounded-full ${pct >= 100 ? 'bg-critical' : 'bg-cobalt'}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
      )}
      <div className="text-[10px] text-muted-on-ink">Resets {new Date(resetsAt).toLocaleString()}</div>
    </div>
  );
}
