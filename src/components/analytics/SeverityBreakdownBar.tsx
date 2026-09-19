import { SeverityBreakdown } from '@/lib/types';

const SEVERITY_STYLE = {
  critical: { color: '#c92a3d', label: 'Critical' },
  high: { color: '#d97706', label: 'High' },
  medium: { color: '#b08a00', label: 'Medium' },
  low: { color: '#2e6fab', label: 'Low' },
} as const;

const ORDER = ['critical', 'high', 'medium', 'low'] as const;

export function SeverityBreakdownBar({ breakdown }: { breakdown: SeverityBreakdown }) {
  const total = ORDER.reduce((sum, k) => sum + breakdown[k], 0);

  if (total === 0) {
    return <p className="text-sm text-muted-on-ink">No findings in this window.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        {ORDER.map((k) => {
          const count = breakdown[k];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={k}
              style={{ width: `${pct}%`, backgroundColor: SEVERITY_STYLE[k].color }}
              className="h-full first:ml-0 [&:not(:first-child)]:ml-0.5"
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {ORDER.map((k) => (
          <div key={k} className="flex items-center gap-2 text-[12px]">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: SEVERITY_STYLE[k].color }} />
            <span className="text-muted-on-ink">{SEVERITY_STYLE[k].label}</span>
            <span className="ml-auto tabular-nums font-semibold text-[#E8ECF4]">{breakdown[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
