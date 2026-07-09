'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listPlans } from '@/lib/api';
import { Plan } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { Footer } from '@/components/Footer';

const TIER_COPY: Record<string, { blurb: string; extras: string[] }> = {
  free: {
    blurb: 'Try it out on real code with no commitment.',
    extras: ['Single-file audits', 'Community support'],
  },
  pro: {
    blurb: 'For individual developers shipping AI-assisted code daily.',
    extras: ['Repository scans', 'Dependency graph & dead code analysis', 'Priority model access'],
  },
  team: {
    blurb: 'For teams that want shared visibility across a codebase.',
    extras: ['Everything in Pro', 'Organization-wide reports (roadmap)', 'Shared audit history (roadmap)'],
  },
  enterprise: {
    blurb: 'For orgs that need control over deployment and data.',
    extras: ['Private deployment (roadmap)', 'SSO (roadmap)', 'Custom AI models (roadmap)'],
  },
};

function formatPrice(plan: Plan): string {
  if (plan.slug === 'enterprise') return 'Custom';
  if (plan.priceMonthlyCents === 0) return '$0';
  return `$${(plan.priceMonthlyCents / 100).toFixed(0)}`;
}

function formatLimit(n: number | null): string {
  return n == null ? 'Unlimited' : String(n);
}

export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans.'));
  }, []);

  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">Pricing</div>
        <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4]">Simple plans, real limits</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-on-ink">
          Every plan shares the same audit engine, and local checks — linting, type errors,
          complexity, formatting — are unlimited on every tier, free. What a plan caps is how many
          <strong className="text-[#E8ECF4]"> AI-reviewed</strong> audits you get per day and per
          month, and whether repository scanning is included.
        </p>
      </section>

      <section className="bg-paper px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-sm text-critical">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const copy = TIER_COPY[plan.slug] ?? { blurb: '', extras: [] };
              const isCurrent = user?.plan.slug === plan.slug;
              const isEnterprise = plan.slug === 'enterprise';
              const ctaHref = isEnterprise
                ? 'mailto:nouman@blacklionapp.xyz'
                : !user
                  ? '/signup'
                  : '/app/dashboard';
              const ctaLabel = isEnterprise
                ? 'Talk to sales'
                : !user
                  ? 'Get started'
                  : isCurrent
                    ? 'Current plan'
                    : 'Switch in dashboard';

              return (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-xl border border-paper-line bg-paper-card p-6"
                >
                  <div className="mb-1 font-mono text-sm font-bold tracking-wide text-muted-on-paper uppercase">
                    {plan.name}
                  </div>
                  <div className="mb-1 text-3xl font-bold text-[#1C2128]">
                    {formatPrice(plan)}
                    {plan.priceMonthlyCents > 0 && (
                      <span className="text-sm font-normal text-muted-on-paper">/mo</span>
                    )}
                  </div>
                  <p className="mb-4 text-xs leading-relaxed text-muted-on-paper">{copy.blurb}</p>

                  <ul className="mb-4 space-y-1.5 border-t border-paper-line pt-4 text-sm text-[#1C2128]">
                    <li>{formatLimit(plan.dailyAuditLimit)} AI audits/day</li>
                    <li>{formatLimit(plan.monthlyAuditLimit)} AI audits/month</li>
                    <li>Unlimited local checks (lint, types, complexity)</li>
                    <li>{plan.repositoryScan ? 'Repository scanning' : 'No repository scanning'}</li>
                  </ul>

                  <ul className="mb-6 flex-1 space-y-1.5 text-xs text-muted-on-paper">
                    {copy.extras.map((extra) => (
                      <li key={extra}>+ {extra}</li>
                    ))}
                  </ul>

                  <Link
                    href={ctaHref}
                    className={`rounded-lg px-4 py-2.5 text-center text-sm font-bold ${
                      isCurrent
                        ? 'border border-paper-line text-muted-on-paper'
                        : 'bg-cobalt text-white'
                    }`}
                  >
                    {ctaLabel}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-on-paper">
            Plan switching is self-service from your dashboard — no payment step in this build.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-[#E8ECF4]">Questions</h2>
          <div className="space-y-6">
            <FaqItem
              q="What counts against my limit?"
              a="Only audits that actually use AI. Every audit first runs free local checks — linting, TypeScript diagnostics, complexity, formatting, dependency vulnerabilities. If nothing there warrants a closer look, that's the whole audit — no AI call, no quota used. Re-auditing code you've already scanned is also free, served from cache. Your limit only counts the audits where an LLM actually got involved."
            />
            <FaqItem
              q="How does a repository scan use quota?"
              a="The same way — each file in the scan runs through the free local checks first, and only files flagged as risky get an AI review. A scan where nothing looks risky costs nothing, even though every file was checked."
            />
            <FaqItem
              q="What happens when I hit my limit?"
              a="Audit runs return a clear message telling you whether it's your daily or monthly limit, plus when it resets. You can upgrade at any time to keep going immediately."
            />
            <FaqItem
              q="Can I switch plans later?"
              a="Yes — switch anytime from your dashboard. Changes apply immediately, including to your remaining quota for the current period."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-5">
      <div className="mb-1.5 text-sm font-bold text-[#E8ECF4]">{q}</div>
      <p className="text-sm leading-relaxed text-muted-on-ink">{a}</p>
    </div>
  );
}
