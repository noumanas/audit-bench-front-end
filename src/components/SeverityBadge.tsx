import { Severity } from '@/lib/types';

const STYLES: Record<Severity, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-critical' },
  high: { label: 'High', className: 'bg-high' },
  medium: { label: 'Medium', className: 'bg-medium' },
  low: { label: 'Low', className: 'bg-low' },
};

export function SeverityBadge({ level }: { level: Severity }) {
  const s = STYLES[level] ?? STYLES.low;
  return (
    <span
      className={`${s.className} rounded px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-white uppercase whitespace-nowrap`}
    >
      {s.label}
    </span>
  );
}
