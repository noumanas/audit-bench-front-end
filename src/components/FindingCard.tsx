'use client';

import { useState } from 'react';
import { Finding } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';

const SEVERITY_BORDER: Record<Finding['severity'], string> = {
  critical: 'border-l-critical',
  high: 'border-l-high',
  medium: 'border-l-medium',
  low: 'border-l-low',
};

export function FindingCard({ finding, defaultOpen = false }: { finding: Finding; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`mb-2.5 overflow-hidden rounded-lg border border-paper-line bg-paper-card border-l-4 ${SEVERITY_BORDER[finding.severity]}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <SeverityBadge level={finding.severity} />
        <span className="flex-1 text-sm font-semibold text-[#1C2128]">{finding.title}</span>
        {finding.line != null && (
          <span className="font-mono text-xs text-muted-on-paper">L{finding.line}</span>
        )}
        <span className="text-xs text-muted-on-paper">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="space-y-2.5 px-3.5 pb-3.5">
          <div className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">
            {finding.category} · {Math.round(finding.confidence * 100)}% confidence
          </div>
          <p className="text-[13.5px] leading-relaxed text-[#1C2128]">{finding.description}</p>
          <div>
            <div className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              Root cause
            </div>
            <p className="text-[13px] leading-relaxed text-[#1C2128]">{finding.rootCause}</p>
          </div>
          <div className="rounded-md border border-paper-line bg-paper px-3 py-2.5">
            <div className="mb-1 font-mono text-[11px] font-bold tracking-wide text-pass uppercase">
              Suggested fix
            </div>
            <p className="text-[13px] leading-relaxed text-[#1C2128]">{finding.suggestedFix}</p>
            {finding.examplePatch && (
              <pre className="mt-2 overflow-x-auto rounded bg-ink p-2.5 font-mono text-[12px] text-[#E8ECF4]">
                {finding.examplePatch}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
