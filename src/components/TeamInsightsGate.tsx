'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsage } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type Access = 'checking' | 'allowed' | 'locked';

/**
 * DORA delivery metrics and the compliance evidence report are Team and
 * Enterprise features. The API refuses other plans (QuotaService.
 * assertTeamInsights); this shows an upgrade prompt instead of an error, and
 * never calls those endpoints for a plan that can't use them.
 * admin/super_admin always pass, matching the API.
 */
export function useTeamInsightsAccess(): Access {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'super_admin';
  const [fromPlan, setFromPlan] = useState<Access>('checking');

  useEffect(() => {
    if (isStaff) return;
    let cancelled = false;
    getUsage()
      .then((u) => !cancelled && setFromPlan(u.teamInsights ? 'allowed' : 'locked'))
      .catch(() => !cancelled && setFromPlan('locked'));
    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  return isStaff ? 'allowed' : fromPlan;
}

/** The upgrade prompt, full size for a page or compact for a dashboard section. */
export function TeamInsightsUpsell({ feature, compact = false }: { feature: 'dora' | 'compliance'; compact?: boolean }) {
  const copy =
    feature === 'dora'
      ? {
          title: 'Delivery metrics (DORA) are part of Team and Enterprise',
          body: 'See how often each repository ships, how long a change takes to reach production, how often a release fails and how fast you recover, rated against the DORA bands.',
        }
      : {
          title: 'Compliance reports are part of Team and Enterprise',
          body: 'Turn your code reviews into evidence for SOC 2 and ISO 27001: what was reviewed before merge, what the security checks caught, and which control each finding relates to. Export it for your auditor as a PDF or CSV.',
        };
  return (
    <div className={`rounded-xl border border-cobalt/40 bg-cobalt/10 ${compact ? 'px-5 py-4' : 'px-6 py-7'}`}>
      <div className="mb-2 text-[11px] font-medium tracking-[0.1em] text-cobalt uppercase">Team plan</div>
      <h2 className={`mb-2 font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>{copy.title}</h2>
      <p className="mb-4 max-w-[62ch] text-sm leading-relaxed text-muted-on-ink">{copy.body}</p>
      <Link
        href="/app/dashboard?tab=plan"
        className="inline-block rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark"
      >
        See Team plan
      </Link>
    </div>
  );
}
