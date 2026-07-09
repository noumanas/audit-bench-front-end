'use client';

import { useEffect, useState } from 'react';
import { listPlans } from '@/lib/api';
import { Plan } from '@/lib/types';

function formatPrice(plan: Plan): string {
  if (plan.slug === 'enterprise') return 'Custom';
  if (plan.priceMonthlyCents === 0) return 'Free';
  return `$${(plan.priceMonthlyCents / 100).toFixed(0)}/mo`;
}

function formatLimit(n: number | null): string {
  return n == null ? 'Unlimited' : `${n}/day`;
}

export function PricingTeaser() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

  if (plans.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <div key={plan.id} className="rounded-lg border border-paper-line bg-paper-card p-5">
          <div className="mb-1 font-mono text-sm font-bold text-[#1C2128]">{plan.name}</div>
          <div className="mb-3 text-2xl font-bold text-[#1C2128]">{formatPrice(plan)}</div>
          <div className="text-xs text-muted-on-paper">{formatLimit(plan.dailyAuditLimit)} AI audits</div>
        </div>
      ))}
    </div>
  );
}
