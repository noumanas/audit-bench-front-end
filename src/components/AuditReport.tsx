'use client';

import { useMemo, useState } from 'react';
import { Audit, FindingStatus, Severity } from '@/lib/types';
import { VerdictBadge } from './VerdictBadge';
import { FindingCard } from './FindingCard';
import { PipelineBadge } from './PipelineBadge';
import { Stage1Summary } from './Stage1Summary';
import { TokenUsageNote } from './TokenUsageNote';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const SEVERITY_HEX: Record<Severity, string> = {
  critical: '#c92a3d',
  high: '#d97706',
  medium: '#b08a00',
  low: '#2e6fab',
};
const STATUS_FILTERS: Array<{ key: FindingStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'wont_fix', label: "Won't fix" },
];

export function AuditReport({
  audit,
  onStatusChange,
  updatingIndex,
}: {
  audit: Audit;
  /** When provided, each finding gets Open / In progress / Won't fix triage buttons. */
  onStatusChange?: (index: number, status: FindingStatus) => void;
  updatingIndex?: number | null;
}) {
  const statusOf = (i: number): FindingStatus => audit.findingStatuses?.[i] ?? 'open';

  // Worst first, then by line, keeping each finding's original index (what
  // triage statuses are keyed by on the server).
  const ordered = useMemo(
    () =>
      audit.findings
        .map((finding, index) => ({ finding, index }))
        .sort(
          (a, b) =>
            SEVERITY_RANK[a.finding.severity] - SEVERITY_RANK[b.finding.severity] ||
            (a.finding.line ?? Infinity) - (b.finding.line ?? Infinity),
        ),
    [audit.findings],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of audit.findings) c[f.severity]++;
    return c;
  }, [audit.findings]);
  const categories = useMemo(() => [...new Set(audit.findings.map((f) => f.category))].sort(), [audit.findings]);

  const [severity, setSeverity] = useState<Severity | null>(null);
  const [status, setStatus] = useState<FindingStatus | 'all'>('all');
  const [category, setCategory] = useState('all');
  const [sortByLine, setSortByLine] = useState(false);
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set(ordered.length ? [ordered[0].index] : []));

  const tracking = Boolean(onStatusChange);
  const statusCounts = audit.findings.reduce<Record<FindingStatus, number>>(
    (acc, _f, i) => {
      acc[statusOf(i)]++;
      return acc;
    },
    { open: 0, in_progress: 0, wont_fix: 0 },
  );
  const handled = statusCounts.in_progress + statusCounts.wont_fix;

  const visible = ordered
    .filter(
      ({ finding, index }) =>
        (!severity || finding.severity === severity) &&
        (status === 'all' || statusOf(index) === status) &&
        (category === 'all' || finding.category === category),
    )
    .sort((a, b) => (sortByLine ? (a.finding.line ?? Infinity) - (b.finding.line ?? Infinity) : 0));
  const filtering = severity !== null || status !== 'all' || category !== 'all';
  const allOpen = visible.length > 0 && visible.every((v) => openSet.has(v.index));

  const setOpen = (index: number, open: boolean) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (open) next.add(index);
      else next.delete(index);
      return next;
    });

  return (
    <div>
      {/* Verdict and summary */}
      <div className="mb-4 rounded-lg border border-paper-line bg-paper-card p-4">
        <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
          <VerdictBadge verdict={audit.verdict} />
          <PipelineBadge aiInvoked={audit.aiInvoked} fromCache={audit.fromCache} />
          <TokenUsageNote inputTokens={audit.inputTokens} outputTokens={audit.outputTokens} />
        </div>
        <p className="text-sm leading-relaxed text-[#1C2128]">{audit.summary}</p>

        {audit.findings.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SEVERITIES.map((s) => {
              const n = counts[s];
              const active = severity === s;
              return (
                <button
                  key={s}
                  onClick={() => setSeverity(active ? null : s)}
                  disabled={n === 0}
                  aria-pressed={active}
                  title={n ? `Show only ${s} findings` : undefined}
                  className={`rounded-md border px-3 py-2 text-left transition-colors disabled:cursor-default ${
                    active ? 'border-[#1C2128] bg-paper' : 'border-paper-line bg-paper hover:border-muted-on-paper'
                  } ${n ? 'cursor-pointer' : ''}`}
                >
                  <div
                    className="text-xl leading-none font-bold tabular-nums"
                    style={{ color: n ? SEVERITY_HEX[s] : '#b4bac4' }}
                  >
                    {n}
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-wide text-muted-on-paper uppercase">{s}</div>
                </button>
              );
            })}
          </div>
        )}

        {tracking && audit.findings.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[12px] text-muted-on-paper">
              <span>Triage progress</span>
              <span className="tabular-nums">
                {handled} of {audit.findings.length} handled · {statusCounts.open} open
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-paper-line">
              <div
                className="h-full bg-cobalt"
                style={{ width: `${(statusCounts.in_progress / audit.findings.length) * 100}%` }}
              />
              <div
                className="h-full bg-muted-on-paper"
                style={{ width: `${(statusCounts.wont_fix / audit.findings.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {audit.stage1 && <Stage1Summary stage1={audit.stage1} />}

      {audit.findings.length === 0 ? (
        <div className="rounded-lg border border-[#BFDCCB] bg-[#E7F2EB] px-4 py-3 text-sm text-pass">
          No issues found in the selected focus areas. Still worth a human skim before merge.
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
              Findings{' '}
              <span className="tabular-nums">
                {filtering ? `${visible.length} of ${audit.findings.length}` : audit.findings.length}
              </span>
            </h2>
            {tracking && (
              <div
                className="flex rounded-md border border-paper-line bg-paper-card p-0.5"
                role="group"
                aria-label="Filter by status"
              >
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatus(f.key)}
                    aria-pressed={status === f.key}
                    className={`cursor-pointer rounded px-2 py-1 text-[12px] ${
                      status === f.key ? 'bg-[#1C2128] text-white' : 'text-muted-on-paper hover:text-[#1C2128]'
                    }`}
                  >
                    {f.label}
                    {f.key !== 'all' && <span className="ml-1 tabular-nums opacity-70">{statusCounts[f.key]}</span>}
                  </button>
                ))}
              </div>
            )}
            {categories.length > 1 && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className="rounded-md border border-paper-line bg-paper-card px-2 py-1.5 text-[12px] text-[#1C2128] outline-none"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <select
              value={sortByLine ? 'line' : 'severity'}
              onChange={(e) => setSortByLine(e.target.value === 'line')}
              aria-label="Sort findings"
              className="rounded-md border border-paper-line bg-paper-card px-2 py-1.5 text-[12px] text-[#1C2128] outline-none"
            >
              <option value="severity">Sort: severity</option>
              <option value="line">Sort: line number</option>
            </select>
            <button
              onClick={() => setOpenSet(allOpen ? new Set() : new Set(visible.map((v) => v.index)))}
              className="cursor-pointer rounded-md border border-paper-line bg-paper-card px-2.5 py-1.5 text-[12px] font-medium text-[#1C2128] hover:border-muted-on-paper"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-lg border border-paper-line bg-paper-card px-4 py-4 text-sm text-muted-on-paper">
              No findings match these filters.{' '}
              <button
                onClick={() => {
                  setSeverity(null);
                  setStatus('all');
                  setCategory('all');
                }}
                className="cursor-pointer font-semibold text-cobalt hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            visible.map(({ finding, index }) => (
              <FindingCard
                key={index}
                finding={finding}
                number={ordered.findIndex((o) => o.index === index) + 1}
                anchorId={`finding-${index + 1}`}
                open={openSet.has(index)}
                onOpenChange={(o) => setOpen(index, o)}
                status={statusOf(index)}
                onStatusChange={onStatusChange ? (s) => onStatusChange(index, s) : undefined}
                statusUpdating={updatingIndex === index}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
