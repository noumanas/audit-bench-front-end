'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const AUTO_ADVANCE_MS = 6000;

function ChromeDots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-critical/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-high/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
    </div>
  );
}

function Dot({ tone }: { tone: 'critical' | 'high' | 'medium' | 'low' }) {
  const cls = { critical: 'bg-critical', high: 'bg-high', medium: 'bg-medium', low: 'bg-low' }[tone];
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${cls}`} />;
}

function ScanDemo() {
  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <div className="text-muted-on-ink">$ auditbench scan .</div>
      <div className="mt-2 text-muted-on-ink">Scanning 42 files across src/, api/, lib/…</div>
      <div className="text-muted-on-ink">12 files flagged for AI review — 30 skipped, no risk found</div>
      <div className="mt-3 flex items-center gap-2 rounded-md border-l-4 border-l-critical bg-ink px-3 py-2">
        <Dot tone="critical" />
        <span className="text-[#E8ECF4]">api/webhooks/stripe.ts — signature not verified before processing</span>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-md bg-ink-soft px-3 py-2">
        <span className="text-muted-on-ink">Verdict</span>
        <span className="rounded bg-critical px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          do_not_ship
        </span>
      </div>
    </div>
  );
}

function CategoriesDemo() {
  const rows: { label: string; tone: 'critical' | 'high' | 'medium' | 'low'; finding: string }[] = [
    { label: 'Security', tone: 'critical', finding: 'Hardcoded API key in config/stripe.ts' },
    { label: 'Logic', tone: 'high', finding: 'Off-by-one in pagination cursor' },
    { label: 'Performance', tone: 'medium', finding: 'N+1 query in orders.list()' },
    { label: 'Architecture', tone: 'low', finding: 'Circular import: services ↔ utils' },
  ];
  return (
    <div className="space-y-2 font-mono text-[12px]">
      {rows.map((r) => (
        <div key={r.label} className="rounded-md border border-ink-line bg-ink px-3 py-2">
          <div className="mb-1 flex items-center gap-2">
            <Dot tone={r.tone} />
            <span className="text-[10px] font-bold tracking-wide text-muted-on-ink uppercase">{r.label}</span>
          </div>
          <div className="text-[#E8ECF4]">{r.finding}</div>
        </div>
      ))}
    </div>
  );
}

function FixLoopDemo() {
  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <div className="whitespace-pre text-[#E8ECF4]">
        {'const rows = await db.orders.findMany();\nfor (const o of rows) {\n  await db.customers.findOne(o.customerId);\n}'}
      </div>
      <div className="mt-2 rounded bg-pass/15 px-2 py-1 text-pass">
        {'+ const rows = await db.orders.findMany({ include: { customer: true } });'}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md border-l-4 border-l-pass bg-ink px-3 py-2">
        <Dot tone="low" />
        <span className="text-[#E8ECF4]">Fix applied — re-audited automatically, N+1 resolved.</span>
      </div>
    </div>
  );
}

function PrGateDemo() {
  return (
    <div className="font-mono text-[12px] leading-relaxed">
      <div className="rounded-md border border-ink-line bg-ink px-3 py-2">
        <div className="mb-1 text-[10px] tracking-wide text-muted-on-ink uppercase">src/auth/session.ts · line 41</div>
        <div className="text-[#E8ECF4]">Session token isn&apos;t invalidated on password change — same bug we flagged last week, still open.</div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-md bg-ink-soft px-3 py-2">
        <span className="text-muted-on-ink">audit/bench / do_not_ship</span>
        <span className="rounded bg-critical px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Merge blocked
        </span>
      </div>
    </div>
  );
}

function CiGateDemo() {
  return (
    <div className="font-mono text-[12px] leading-relaxed text-muted-on-ink">
      <div>Run auditbench scan . --fail-on do_not_ship</div>
      <div className="mt-1">Verdict: do_not_ship (2 critical, 1 high)</div>
      <div className="mt-3 rounded-md border-l-4 border-l-critical bg-ink px-3 py-2 text-[#E8ECF4]">
        Error: Process completed with exit code 1.
      </div>
      <div className="mt-2 text-[11px] text-muted-on-ink">The build fails here — before review, not after.</div>
    </div>
  );
}

function DashboardDemo() {
  const files: { name: string; tone: 'critical' | 'high' | 'low' }[] = [
    { name: 'api/webhooks/stripe.ts', tone: 'critical' },
    { name: 'auth/session.ts', tone: 'high' },
    { name: 'billing/invoices.ts', tone: 'low' },
  ];
  return (
    <div className="font-mono text-[12px]">
      <div className="mb-2 text-[10px] font-bold tracking-wide text-muted-on-ink uppercase">Riskiest files · 30d</div>
      <div className="space-y-1.5">
        {files.map((f) => (
          <div key={f.name} className="flex items-center gap-2 rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
            <Dot tone={f.tone} />
            <span className="truncate text-[#E8ECF4]">{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineDemo() {
  const stages = [
    { n: '01', label: 'Free local checks', detail: 'ESLint, types, secrets — no AI, no cost' },
    { n: '02', label: 'AI on flagged code', detail: 'Only the functions Stage 1 flags' },
    { n: '03', label: 'Cached by hash', detail: 'Unchanged code costs nothing, returns instantly' },
  ];
  return (
    <div className="space-y-2 font-mono text-[12px]">
      {stages.map((s) => (
        <div key={s.n} className="rounded-md border border-ink-line bg-ink px-3 py-2">
          <div className="flex items-center gap-2 text-[#E8ECF4]">
            <span className="text-muted-on-ink">{s.n}</span>
            <span className="font-bold">{s.label}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-on-ink">{s.detail}</div>
        </div>
      ))}
    </div>
  );
}

const ROWS = [
  {
    n: '01',
    label: 'One engine: files, PRs, whole repos',
    code: 'auditbench scan .',
    render: ScanDemo,
  },
  {
    n: '02',
    label: 'Security, logic, performance, architecture',
    code: null,
    render: CategoriesDemo,
  },
  {
    n: '03',
    label: 'Fix with AI, then re-audit before you commit',
    code: null,
    render: FixLoopDemo,
  },
  {
    n: '04',
    label: 'Inline PR & MR comments, merge-blocking gate',
    code: null,
    render: PrGateDemo,
  },
  {
    n: '05',
    label: 'A CLI built for CI',
    code: '--fail-on do_not_ship',
    render: CiGateDemo,
  },
  {
    n: '06',
    label: 'Team dashboard, trends over time',
    code: null,
    render: DashboardDemo,
  },
  {
    n: '07',
    label: 'Free checks first, AI only when warranted',
    code: null,
    render: PipelineDemo,
  },
];

export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = setInterval(() => setActive((i) => (i + 1) % ROWS.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const Demo = ROWS[active].render;

  return (
    <section className="border-t border-ink-line bg-ink">
      <div className="border-b border-ink-line px-6 py-5">
        <div className="mx-auto max-w-5xl font-mono text-sm text-muted-on-ink">
          <span className="text-cobalt">// </span>one audit engine, wired into everywhere you ship.
        </div>
      </div>

      <div className="border-b border-ink-line px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <p className="max-w-md text-sm leading-relaxed text-muted-on-ink">
            Reviews. Gates. Fixes. Reports. Same findings whether it&apos;s a file, a PR, or a whole repository.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/features" className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#10141C]">
              Explore all features →
            </Link>
            <Link
              href="/cli"
              className="rounded-full border border-ink-line px-4 py-2 text-xs font-bold text-muted-on-ink hover:text-[#E8ECF4]"
            >
              Docs
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2">
          <div className="md:border-r md:border-ink-line">
            {ROWS.map((r, i) => (
              <button
                key={r.n}
                onClick={() => setActive(i)}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                className={`block w-full cursor-pointer border-b border-ink-line px-6 py-5 text-left transition-colors ${
                  i === active ? 'bg-ink-soft' : 'hover:bg-ink-soft/60'
                }`}
              >
                <span className="mr-3 font-mono text-[11px] text-muted-on-ink">{r.n}</span>
                <span className={`text-[15px] font-medium ${i === active ? 'text-[#E8ECF4]' : 'text-muted-on-ink'}`}>
                  {r.label}
                </span>
                {r.code && (
                  <code className="ml-2 rounded bg-ink-line px-1.5 py-0.5 font-mono text-[11px] text-muted-on-ink">
                    {r.code}
                  </code>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center px-6 py-8">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <ChromeDots />
                <span className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">audit/bench</span>
              </div>
              <div key={active} className="fade-up min-h-[168px]">
                <Demo />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3">
                <span className="font-mono text-[10px] font-bold tracking-wide text-cobalt uppercase">
                  {ROWS[active].n} — {ROWS[active].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
