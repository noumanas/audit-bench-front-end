'use client';

import { useEffect, useState } from 'react';
import { getUsage } from '@/lib/api';
import { Usage } from '@/lib/types';

export function UsageBar({ refreshKey }: { refreshKey?: number }) {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => {});
  }, [refreshKey]);

  if (!usage) return null;

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-ink-line bg-ink-soft px-3.5 py-2.5">
      <UsageStat label="AI audits today" used={usage.dailyUsed} limit={usage.dailyLimit} />
      <UsageStat label="AI audits this month" used={usage.monthlyUsed} limit={usage.monthlyLimit} />
      <span className="self-center text-[11px] text-muted-on-ink">
        Local checks &amp; cached results are free and don&apos;t count here.
      </span>
    </div>
  );
}

function UsageStat({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const pct = limit != null ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="min-w-[140px] flex-1 text-xs text-muted-on-ink">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono tracking-wide uppercase">{label}</span>
        <span className="font-mono">{limit != null ? `${used}/${limit}` : `${used} (unlimited)`}</span>
      </div>
      {limit != null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-line">
          <div
            className={`h-full rounded-full ${pct >= 100 ? 'bg-critical' : 'bg-cobalt'}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
      )}
    </div>
  );
}
