export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'clean';

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'bg-critical text-white',
  high: 'bg-high text-white',
  medium: 'bg-medium text-white',
  low: 'bg-low text-white',
  clean: 'bg-pass text-white',
};

/** Solid-color severity chip — critical/high/medium/low, or "clean" for a resolved/no-findings state. */
export function SeverityTag({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide uppercase whitespace-nowrap ${SEVERITY_STYLES[severity]} ${className ?? ''}`}
    >
      {severity}
    </span>
  );
}

/** Neutral outlined chip for a review category — Security, Logic, Performance, Architecture, Testing. */
export function CategoryTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border border-ink-line px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-muted-on-ink uppercase whitespace-nowrap ${className ?? ''}`}
    >
      {label}
    </span>
  );
}
