import { Verdict } from '@/lib/types';

const STYLES: Record<Verdict, { label: string; className: string }> = {
  pass: { label: 'Ship it', className: 'bg-pass' },
  needs_work: { label: 'Needs work', className: 'bg-high' },
  do_not_ship: { label: 'Do not ship', className: 'bg-critical' },
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const s = STYLES[verdict] ?? STYLES.needs_work;
  return (
    <span
      className={`${s.className} rounded-md px-3 py-1.5 font-mono text-[13px] font-bold tracking-wide text-white uppercase`}
    >
      {s.label}
    </span>
  );
}
