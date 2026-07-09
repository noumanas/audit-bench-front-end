'use client';

import { useEffect, useState } from 'react';

const STEPS = ['Running local checks (lint, types, complexity)', 'Reviewing with AI', 'Compiling findings'];

const SKELETON_WIDTHS = ['92%', '68%', '84%', '55%', '76%', '40%'];

export function AuditLoader() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    const id = setInterval(() => {
      setTick((t) => (t >= STEPS.length - 1 ? t : t + 1));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fade-up mx-auto mt-12 max-w-md">
      <div className="relative mb-6 overflow-hidden rounded-lg border border-paper-line bg-paper-card p-4">
        <div className="space-y-2.5">
          {SKELETON_WIDTHS.map((w, i) => (
            <div key={i} style={{ width: w }} className="h-2.5 rounded-full bg-paper-line" />
          ))}
        </div>
        <div className="scan-sweep absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-cobalt/15 to-transparent" />
      </div>

      <div className="mb-5 text-center">
        <div className="mb-1 font-mono text-sm font-semibold text-[#1C2128]">Auditing your code…</div>
        <p className="text-[13px] text-muted-on-paper">
          Checking security, logic, performance, and architecture.
        </p>
      </div>

      <ul className="space-y-2.5">
        {STEPS.map((step, i) => {
          const done = i < tick;
          const active = i === tick;
          return (
            <li key={step} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  done
                    ? 'border-pass bg-pass text-white'
                    : active
                      ? 'step-pulse border-cobalt text-cobalt'
                      : 'border-paper-line text-muted-on-paper'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={
                  done
                    ? 'text-[#1C2128]'
                    : active
                      ? 'font-medium text-[#1C2128]'
                      : 'text-muted-on-paper'
                }
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
