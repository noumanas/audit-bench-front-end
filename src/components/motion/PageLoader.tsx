import { LogoMark } from '@/components/Logo';

/**
 * Branded loading state for route segments (app/loading.tsx,
 * app/app/loading.tsx): the logo's scan line sweeps while the page loads.
 * Pure CSS so it shows instantly, before any client JavaScript runs.
 */
export function PageLoader({ label = 'Loading', tone = 'ink' }: { label?: string; tone?: 'ink' | 'paper' }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-6">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-cobalt/20 motion-reduce:hidden" />
        <LogoMark className="relative h-12 w-12" />
      </div>
      <div
        className={`flex items-center gap-1 font-mono text-[12px] tracking-[0.12em] uppercase ${tone === 'paper' ? 'text-muted-on-paper' : 'text-muted-on-ink'}`}
      >
        {label}
        <span className="loader-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
