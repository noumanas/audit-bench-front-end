import { ReactNode } from 'react';

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-ink-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
          <span className="text-[11px] font-medium tracking-[0.14em] text-cobalt uppercase">{kicker}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl text-white font-light tracking-[-0.03em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-on-ink">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
