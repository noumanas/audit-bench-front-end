import Link from 'next/link';
import { CriticalIssue } from '@/lib/types';
import { ChevronRightIcon } from '@/components/icons';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#c92a3d',
  high: '#d97706',
  medium: '#b08a00',
  low: '#2e6fab',
};

function scoreColor(pct: number): string {
  if (pct >= 90) return '#c92a3d';
  if (pct >= 70) return '#d97706';
  return '#8b96ab';
}

export function CriticalIssuesList({ issues }: { issues: CriticalIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-1 text-sm font-bold text-[#E8ECF4]">No critical issues found</div>
        <p className="text-[12px] text-muted-on-ink">Nothing critical or high severity in this window.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {issues.map((issue, i) => {
        const href = issue.resourceKind === 'audit' ? `/app/audit/${issue.resourceId}` : `/app/repository/${issue.resourceId}`;
        return (
          <Link
            key={`${issue.resourceId}:${i}`}
            href={href}
            className="row-hover group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-ink-line"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: SEVERITY_COLOR[issue.severity] ?? '#8b96ab' }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-[#E8ECF4]">{issue.title}</div>
              <div className="truncate text-[11px] text-muted-on-ink">
                {issue.category} · {issue.resourceLabel}
              </div>
            </div>
            <span
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums"
              style={{ color: scoreColor(issue.confidencePct), backgroundColor: `${scoreColor(issue.confidencePct)}1f` }}
            >
              {issue.confidencePct}
            </span>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-on-ink opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        );
      })}
    </div>
  );
}
