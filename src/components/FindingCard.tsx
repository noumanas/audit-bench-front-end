'use client';

import { useState } from 'react';
import { Finding, FindingStatus } from '@/lib/types';
import { SeverityBadge } from './SeverityBadge';
import { ChevronRightIcon, SparkleIcon } from './icons';

const SEVERITY_BORDER: Record<Finding['severity'], string> = {
  critical: 'border-l-critical',
  high: 'border-l-high',
  medium: 'border-l-medium',
  low: 'border-l-low',
};

const STATUS_LABEL: Record<FindingStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  wont_fix: "Won't fix",
};

const STATUS_PILL: Record<FindingStatus, string> = {
  open: '',
  in_progress: 'border-cobalt/40 bg-cobalt/10 text-cobalt',
  wont_fix: 'border-paper-line bg-paper text-muted-on-paper',
};

export function FindingCard({
  finding,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  number,
  anchorId,
  onLineClick,
  onFixWithAi,
  fixingWithAi = false,
  fixWithAiDisabled = false,
  status = 'open',
  onStatusChange,
  statusUpdating = false,
}: {
  finding: Finding;
  defaultOpen?: boolean;
  /** Controlled open state (e.g. an "Expand all" toggle); falls back to internal state when omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Shown as "F01" so a finding can be referred to in a conversation or ticket. */
  number?: number;
  /** DOM id so a finding can be linked to directly. */
  anchorId?: string;
  /** When provided, the "L<n>" badge becomes clickable and jumps the editor to that line instead of just displaying it. */
  onLineClick?: (line: number) => void;
  /** When provided, shows a "Fix with AI" button (Pro+ plans) that sends this finding to the AI and applies the fix directly. */
  onFixWithAi?: () => void;
  fixingWithAi?: boolean;
  /** Disables this card's button while another finding's AI fix is in flight. */
  fixWithAiDisabled?: boolean;
  /** Triage state — defaults to 'open' when the caller doesn't track status (e.g. a preview card). */
  status?: FindingStatus;
  /** When provided, shows Open / In progress / Won't fix buttons inside the card. */
  onStatusChange?: (status: FindingStatus) => void;
  statusUpdating?: boolean;
}) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = controlledOpen ?? innerOpen;
  const toggle = () => {
    const next = !open;
    if (controlledOpen === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const dismissed = status === 'wont_fix';

  return (
    <div
      id={anchorId}
      className={`mb-2.5 scroll-mt-6 overflow-hidden rounded-lg border border-l-4 border-paper-line bg-paper-card ${SEVERITY_BORDER[finding.severity]} ${
        dismissed ? 'opacity-60' : ''
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
        className="flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-3 text-left hover:bg-paper/60"
      >
        <div className="pt-0.5">
          <SeverityBadge level={finding.severity} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {number != null && (
              <span className="font-mono text-[11px] text-muted-on-paper tabular-nums">
                F{String(number).padStart(2, '0')}
              </span>
            )}
            <span className={`text-sm font-semibold text-[#1C2128] ${dismissed ? 'line-through' : ''}`}>
              {finding.title}
            </span>
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-on-paper">
            {finding.category} · {Math.round(finding.confidence * 100)}% confidence
          </div>
        </div>
        {status !== 'open' && (
          <span
            className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap uppercase ${STATUS_PILL[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        )}
        {finding.line != null &&
          (onLineClick ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLineClick(finding.line!);
              }}
              title={`Jump to line ${finding.line}`}
              className="mt-0.5 shrink-0 cursor-pointer rounded border border-paper-line px-1.5 py-0.5 font-mono text-[11px] text-muted-on-paper hover:border-cobalt hover:text-cobalt"
            >
              L{finding.line}
            </button>
          ) : (
            <span className="mt-0.5 shrink-0 rounded border border-paper-line px-1.5 py-0.5 font-mono text-[11px] text-muted-on-paper">
              L{finding.line}
            </span>
          ))}
        <ChevronRightIcon
          className={`mt-1 h-4 w-4 shrink-0 text-muted-on-paper transition-transform ${open ? 'rotate-90' : ''}`}
        />
      </div>

      {open && (
        <div className="space-y-3 border-t border-paper-line px-3.5 pt-3 pb-3.5">
          <p className="text-[13.5px] leading-relaxed text-[#1C2128]">{finding.description}</p>

          <div>
            <div className="mb-1 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              Root cause
            </div>
            <p className="text-[13px] leading-relaxed text-[#1C2128]">{finding.rootCause}</p>
          </div>

          <div className="rounded-md border border-pass/25 bg-pass/5 px-3 py-2.5">
            <div className="mb-1 font-mono text-[11px] font-bold tracking-wide text-pass uppercase">Suggested fix</div>
            <p className="text-[13px] leading-relaxed text-[#1C2128]">{finding.suggestedFix}</p>
            {finding.examplePatch && <PatchBlock patch={finding.examplePatch} />}
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

          {onStatusChange && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">Status</span>
              <div
                className="flex rounded-md border border-paper-line bg-paper p-0.5"
                role="group"
                aria-label="Finding status"
              >
                {(Object.keys(STATUS_LABEL) as FindingStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => s !== status && onStatusChange(s)}
                    disabled={statusUpdating}
                    aria-pressed={status === s}
                    className={`cursor-pointer rounded px-2.5 py-1 text-[12px] font-medium disabled:cursor-wait ${
                      status === s ? 'bg-[#1C2128] text-white' : 'text-muted-on-paper hover:text-[#1C2128]'
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
              {statusUpdating && <span className="text-[11px] text-muted-on-paper">Saving…</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatchBlock({ patch }: { patch: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2.5 overflow-hidden rounded-md bg-ink">
      <div className="flex items-center justify-between border-b border-ink-line px-3 py-1.5">
        <span className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">Example patch</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigator.clipboard.writeText(patch).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="cursor-pointer text-[11px] font-semibold text-muted-on-ink hover:text-[#E8ECF4]"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[#E8ECF4]">{patch}</pre>
    </div>
  );
}
