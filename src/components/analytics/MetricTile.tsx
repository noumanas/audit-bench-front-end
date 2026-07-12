import { ReactNode } from 'react';
import { InfoIcon } from '../icons';

export function MetricTile({
  label,
  hint,
  value,
  subStats,
}: {
  label: string;
  hint: string;
  value?: ReactNode;
  subStats?: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#E8ECF4]">{label}</span>
        <InfoIcon title={hint} className="h-4 w-4 shrink-0 text-muted-on-ink" />
      </div>
      {subStats && subStats.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${subStats.length}, minmax(0,1fr))` }}>
          {subStats.map((s) => (
            <div key={s.label}>
              <div className="mb-1 text-[11px] text-muted-on-ink">{s.label}</div>
              <div className="text-2xl font-bold tabular-nums text-[#E8ECF4]">{s.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-3xl font-bold tabular-nums text-[#E8ECF4]">{value}</div>
      )}
    </div>
  );
}
