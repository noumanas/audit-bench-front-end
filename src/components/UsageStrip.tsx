'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsage } from '@/lib/api';
import { Usage } from '@/lib/types';
import { ArrowRightIcon } from './icons';

/**
 * One-line plan + quota summary for the top of the dashboard. The full plan
 * picker lives on the dashboard's "Plan & usage" tab (PlanPanel).
 */
export function UsageStrip({ planHref }: { planHref: string }) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage) {
    return (
      <div className="mb-6 h-[74px] animate-pulse rounded-lg border border-ink-line bg-ink-soft" aria-hidden="true" />
    );
  }

  const expires = usage.planExpiresAt ? new Date(usage.planExpiresAt) : null;

  return (
    <div className="shadow-panel mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-ink-line bg-ink-soft px-4 py-3">
      <div className="min-w-[150px]">
        <div className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
          {usage.scope === 'organization' ? `Team plan · ${usage.organizationName}` : 'Your plan'}
        </div>
        <div className="text-sm font-bold text-[#E8ECF4]">{usage.plan.name}</div>
        {expires && (
          <div className="text-[11px] text-muted-on-ink">
            Until{' '}
            {expires.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}
      </div>
      <Meter label="AI audits today" used={usage.dailyUsed} limit={usage.dailyLimit} />
      <Meter label="AI audits this month" used={usage.monthlyUsed} limit={usage.monthlyLimit} />
      <Meter label="AI repo scans this month" used={usage.repoScansUsed} limit={usage.repoScanLimit} />
      <Link
        href={planHref}
        className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase hover:underline"
      >
        Manage plan
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const full = limit != null && used >= limit;
  return (
    <div className="min-w-[140px] flex-1">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted-on-ink">{label}</span>
        <span className={`font-mono text-[11px] tabular-nums ${full ? 'font-bold text-critical' : 'text-[#E8ECF4]'}`}>
          {limit == null ? `${used} · unlimited` : `${used}/${limit}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
        {limit != null && (
          <div
            className={`h-full rounded-full ${full ? 'bg-critical' : 'bg-cobalt'}`}
            style={{ width: `${Math.max(pct, used > 0 ? 4 : 0)}%` }}
          />
        )}
      </div>
    </div>
  );
}
