'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsage } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type Access = 'checking' | 'allowed' | 'locked';

/**
 * Technical due diligence is Enterprise-only. The API already withholds the
 * TDD assessment from other plans (RepositoryService.findOne); this keeps
 * the investor pages themselves behind the same rule, with an upgrade
 * prompt instead of a half-empty report. admin/super_admin always pass,
 * matching QuotaService.canUseDueDiligence.
 */
export function useDueDiligenceAccess(): Access {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'super_admin';
  const [fromPlan, setFromPlan] = useState<Access>('checking');

  useEffect(() => {
    if (isStaff) return;
    let cancelled = false;
    getUsage()
      .then((u) => !cancelled && setFromPlan(u.dueDiligence ? 'allowed' : 'locked'))
      .catch(() => !cancelled && setFromPlan('locked'));
    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  return isStaff ? 'allowed' : fromPlan;
}

export function DueDiligenceGate({ children }: { children: React.ReactNode }) {
  const access = useDueDiligenceAccess();

  if (access === 'checking') return <div className="text-sm text-muted-on-ink">Checking your plan…</div>;
  if (access === 'allowed') return <>{children}</>;

  return (
    <div className="rounded-xl border border-cobalt/40 bg-cobalt/10 px-6 py-7">
      <div className="mb-2 font-mono text-[11px] font-bold tracking-[0.1em] text-cobalt uppercase">Enterprise plan</div>
      <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">Technical due diligence is part of Enterprise</h2>
      <p className="mb-4 max-w-[62ch] text-sm leading-relaxed text-muted-on-ink">
        Investor-ready reports rate 6 risk areas across 15 domains, show the evidence behind every finding, and price
        the fixes in engineer-days and dollars. Your repository scans and developer reports stay available on your
        current plan.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app/dashboard"
          className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark"
        >
          Request Enterprise
        </Link>
        <a
          href="/audit-bench-sample-tdd-report.pdf"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-ink-line px-4 py-2 text-sm font-bold text-[#E8ECF4] hover:border-cobalt"
        >
          See a sample report
        </a>
      </div>
    </div>
  );
}
