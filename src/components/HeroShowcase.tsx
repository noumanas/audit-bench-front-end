'use client';

import { useEffect, useRef, useState } from 'react';

const AUTO_ADVANCE_MS = 5000;

const BEFORE_LINES = [
  'await supabase',
  '  .from("invoices")',
  '  .update({ status: "sent" })',
  '  .eq("id", invoiceId);',
];

const AFTER_LINES = [
  'await supabase',
  '  .from("invoices")',
  '  .update({ status: "sent" })',
  '  .eq("id", invoiceId)',
];

function ChromeDots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-critical/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-high/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
    </div>
  );
}

function BeforeSlide() {
  return (
    <>
      <div className="mb-3 whitespace-pre text-[#E8ECF4]">
        {BEFORE_LINES.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="rounded-md border-l-4 border-l-critical bg-ink px-3 py-2">
        <div className="mb-1 text-[10px] font-bold tracking-wide text-critical uppercase">Critical · Security</div>
        <div className="text-[#E8ECF4]">No auth check — any caller can mark any invoice as sent.</div>
      </div>
    </>
  );
}

function AfterSlide() {
  return (
    <>
      <div className="mb-3 whitespace-pre text-[#E8ECF4]">
        {AFTER_LINES.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div className="rounded bg-pass/15 pl-1 text-pass">{'+ .eq("owner_id", session.userId);'}</div>
      </div>
      <div className="rounded-md border-l-4 border-l-pass bg-ink px-3 py-2">
        <div className="mb-1 text-[10px] font-bold tracking-wide text-pass uppercase">Resolved · Ship it</div>
        <div className="text-[#E8ECF4]">Ownership check added from the suggested fix — re-audited and passing.</div>
      </div>
    </>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-ink-line bg-ink px-2.5 py-2">
      <div className="text-base font-bold text-[#E8ECF4] tabular-nums">{value}</div>
      <div className="text-[9px] tracking-wide text-muted-on-ink uppercase">{label}</div>
    </div>
  );
}

function MiniRow({ name, verdict }: { name: string; verdict: 'pass' | 'needs_work' }) {
  const style =
    verdict === 'pass' ? { label: 'Ship it', className: 'bg-pass' } : { label: 'Needs work', className: 'bg-high' };
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
      <span className="truncate text-[#E8ECF4]">{name}</span>
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase ${style.className}`}>
        {style.label}
      </span>
    </div>
  );
}

function DashboardSlide() {
  return (
    <>
      <div className="mb-2.5 text-[10px] font-bold tracking-wide text-muted-on-ink uppercase">Score trend · 30d</div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        <MiniScore label="Security" value={94} />
        <MiniScore label="Performance" value={88} />
        <MiniScore label="Tech debt" value={91} />
      </div>
      <div className="space-y-1.5">
        <MiniRow name="billing/invoices.ts" verdict="pass" />
        <MiniRow name="api/webhooks/stripe.ts" verdict="needs_work" />
      </div>
    </>
  );
}

const SLIDES = [
  { key: 'before', step: '01 — Catches it', render: BeforeSlide },
  { key: 'after', step: '02 — Confirms the fix', render: AfterSlide },
  { key: 'dashboard', step: '03 — Tracks it on your dashboard', render: DashboardSlide },
];

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  const Slide = SLIDES[active].render;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-xl border border-ink-line bg-ink-soft p-4 font-mono text-[12px] leading-relaxed"
    >
      <div className="mb-3 flex items-center justify-between">
        <ChromeDots />
        <span className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">audit/bench</span>
      </div>

      <div key={active} className="fade-up min-h-[172px]">
        <Slide />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3">
        <span className="text-[10px] font-bold tracking-wide text-cobalt uppercase">{SLIDES[active].step}</span>
        <div className="flex gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${
                i === active ? 'w-4 bg-cobalt' : 'w-1.5 bg-ink-line hover:bg-muted-on-ink'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
