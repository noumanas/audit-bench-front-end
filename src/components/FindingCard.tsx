'use client';

import { useState } from 'react';
import { Finding } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';
import { SparkleIcon } from './icons';

const SEVERITY_BORDER: Record<Finding['severity'], string> = {
  critical: 'border-l-critical',
  high: 'border-l-high',
  medium: 'border-l-medium',
  low: 'border-l-low',
};

export function FindingCard({
  finding,
  defaultOpen = false,
  onLineClick,
  onFixWithAi,
  fixingWithAi = false,
  fixWithAiDisabled = false,
}: {
  finding: Finding;
  defaultOpen?: boolean;
  /** When provided, the "L<n>" badge becomes clickable and jumps the editor to that line instead of just displaying it. */
  onLineClick?: (line: number) => void;
  /** When provided, shows a "Fix with AI" button (Pro+ plans) that sends this finding to the AI and applies the fix directly. */
  onFixWithAi?: () => void;
  fixingWithAi?: boolean;
  /** Disables this card's button while another finding's AI fix is in flight. */
  fixWithAiDisabled?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`mb-2.5 overflow-hidden rounded-lg border border-paper-line bg-paper-card border-l-4 ${SEVERITY_BORDER[finding.severity]}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <SeverityBadge level={finding.severity} />
        <span className="flex-1 text-sm font-semibold text-[#1C2128]">{finding.title}</span>
        {finding.line != null &&
          (onLineClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLineClick(finding.line!);
              }}
              title={`Jump to line ${finding.line}`}
              className="cursor-pointer rounded px-1.5 py-0.5 font-mono text-xs text-muted-on-paper hover:bg-cobalt/15 hover:text-cobalt"
            >
              L{finding.line}
            </button>
          ) : (
            <span className="font-mono text-xs text-muted-on-paper">L{finding.line}</span>
          ))}
        <span className="text-xs text-muted-on-paper">{open ? '▲' : '▼'}</span>
      </div>
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
            {onFixWithAi && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFixWithAi();
                }}
                disabled={fixingWithAi || fixWithAiDisabled}
                className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="h-3.5 w-3.5" />
                {fixingWithAi ? 'Asking AI…' : 'Fix with AI'}
                <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] tracking-wide uppercase">Pro</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
