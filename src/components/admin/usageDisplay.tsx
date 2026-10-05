import { AdminQuota } from '@/lib/types';

/** 1234 → "1.2K", 2_500_000 → "2.5M". */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** True when any of the pool's limits is used up — the user is blocked from new AI runs of that kind. */
export function isAtLimit(q: AdminQuota | undefined): boolean {
  if (!q) return false;
  return (
    (q.dailyLimit != null && q.dailyUsed >= q.dailyLimit) ||
    (q.monthlyLimit != null && q.monthlyUsed >= q.monthlyLimit) ||
    (q.repoScanLimit != null && q.repoScansUsed >= q.repoScanLimit)
  );
}

export function UsageMeter({
  label,
  used,
  limit,
  compact,
}: {
  label: string;
  used: number;
  limit: number | null;
  compact?: boolean;
}) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const full = limit != null && used >= limit;
  const near = !full && limit != null && pct >= 80;
  const bar = full ? 'bg-critical' : near ? 'bg-high' : 'bg-cobalt';
  return (
    <div className={compact ? '' : 'rounded-lg border border-ink-line bg-ink-soft px-3 py-2'}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} truncate text-muted-on-ink`}>{label}</span>
        <span
          className={`shrink-0 font-mono text-[11px] tabular-nums ${full ? 'font-bold text-critical' : near ? 'text-high' : 'text-[#E8ECF4]'}`}
        >
          {limit == null ? `${used} / ∞` : `${used}/${limit}`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-ink-line">
        {limit != null && (
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(pct, used > 0 ? 4 : 0)}%` }} />
        )}
      </div>
    </div>
  );
}
