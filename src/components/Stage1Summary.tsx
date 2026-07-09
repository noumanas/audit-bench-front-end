'use client';

import { useState } from 'react';
import { Stage1Result } from '@/lib/types';

export function Stage1Summary({ stage1 }: { stage1: Stage1Result }) {
  const [open, setOpen] = useState(false);

  const lintErrors = stage1.lint.filter((l) => l.severity === 'error').length;
  const lintWarnings = stage1.lint.length - lintErrors;

  const chips: string[] = [];
  if (stage1.tsDiagnostics.length > 0) chips.push(`${stage1.tsDiagnostics.length} compile error(s)`);
  if (lintErrors > 0) chips.push(`${lintErrors} lint error(s)`);
  if (lintWarnings > 0) chips.push(`${lintWarnings} lint warning(s)`);
  if (!stage1.formatted && !stage1.formattingSkipped) chips.push('not formatted');
  if (!stage1.semgrep.skipped && stage1.semgrep.findings.length > 0) {
    chips.push(`${stage1.semgrep.findings.length} Semgrep finding(s)`);
  }
  if (stage1.riskyFunctions.length > 0) {
    chips.push(`${stage1.riskyFunctions.length} function(s) flagged for AI review`);
  }

  return (
    <div className="mb-4 rounded-lg border border-paper-line bg-paper-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <span className="font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
          Local checks
        </span>
        <span className="flex-1 text-xs text-muted-on-paper">
          {chips.length > 0 ? chips.join(' · ') : 'Nothing to report'}
        </span>
        <span className="text-xs text-muted-on-paper">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-paper-line px-3.5 py-3 text-xs text-[#1C2128]">
          <Row label="ESLint">
            {stage1.lint.length === 0
              ? 'No issues'
              : stage1.lint.map((l, i) => (
                  <div key={i}>
                    L{l.line} — {l.ruleId ?? 'parse'}: {l.message}
                  </div>
                ))}
          </Row>
          <Row label="TypeScript">
            {stage1.tsDiagnostics.length === 0
              ? 'No errors'
              : stage1.tsDiagnostics.map((d, i) => (
                  <div key={i}>
                    L{d.line} — {d.message}
                  </div>
                ))}
          </Row>
          <Row label="Formatting">
            {stage1.formattingSkipped ? 'Not checked for this file type' : stage1.formatted ? 'Matches Prettier' : 'Differs from Prettier'}
          </Row>
          <Row label="Semgrep">
            {stage1.semgrep.skipped
              ? stage1.semgrep.reason
              : stage1.semgrep.findings.length === 0
                ? 'No findings'
                : stage1.semgrep.findings.map((f, i) => (
                    <div key={i}>
                      L{f.line} — {f.pattern}
                    </div>
                  ))}
          </Row>
          <Row label="Functions">
            {stage1.functions.length} found, {stage1.riskyFunctions.length} flagged for AI review
            {stage1.riskyFunctions.length > 0 && (
              <ul className="mt-1 list-disc pl-4">
                {stage1.riskyFunctions.map((r, i) => (
                  <li key={i}>
                    <code>{r.fn.name}()</code> — {r.reasons.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] font-bold tracking-wide text-muted-on-paper uppercase">
        {label}
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
