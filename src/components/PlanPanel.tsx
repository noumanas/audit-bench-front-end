'use client';

import { useEffect, useState } from 'react';
import { getUsage, listPlans, changePlan } from '@/lib/api';
import { Plan, Usage } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}

function formatLimit(n: number | null): string {
  return n == null ? 'Unlimited' : String(n);
}

export function PlanPanel() {
  const { refreshUser } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    Promise.all([getUsage(), listPlans()])
      .then(([u, p]) => {
        setUsage(u);
        setPlans(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plan info.'));
  };

  useEffect(load, []);

  const handleSwitch = async (slug: string) => {
    setSwitching(slug);
    setError(null);
    try {
      await changePlan(slug);
      await refreshUser();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch plan.');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
        Plan &amp; usage
      </h2>

      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {usage && (
        <div className="mb-4 grid grid-cols-2 gap-3">
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
        </div>
      )}
      <p className="mb-4 text-[11px] text-muted-on-ink">
        Only counts audits that actually used AI — local checks (lint, types, complexity,
        formatting) and cached results are unlimited and free.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = usage?.plan.slug === plan.slug;
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
              <div className="mb-2 text-xs text-muted-on-ink">{formatPrice(plan.priceMonthlyCents)}</div>
              <ul className="mb-3 space-y-0.5 text-[11px] text-muted-on-ink">
                <li>{formatLimit(plan.dailyAuditLimit)} AI audits/day</li>
                <li>{formatLimit(plan.monthlyAuditLimit)} AI audits/month</li>
                <li>{plan.repositoryScan ? 'Repository scan' : 'No repository scan'}</li>
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleSwitch(plan.slug)}
                  disabled={switching !== null}
                  className="w-full cursor-pointer rounded-md border border-cobalt px-2 py-1.5 text-xs font-bold text-cobalt disabled:cursor-wait disabled:opacity-60"
                >
                  {switching === plan.slug ? 'Switching…' : 'Switch'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-muted-on-ink">
        Demo only — plan switching here is self-service and skips real billing.
      </p>
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
