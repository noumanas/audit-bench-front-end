import { GithubLogoIcon } from '@/components/icons';

function Tick() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-pass">
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.8 6.2l2 2 4.4-4.6" />
      </svg>
    </span>
  );
}

function Cross() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-critical">
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
        <path d="M3.8 3.8l4.4 4.4m0-4.4L3.8 8.2" />
      </svg>
    </span>
  );
}

function CheckRow({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-line px-4 py-2.5 text-[13px]">
      <span className="truncate text-[#c9d1e0]">{name}</span>
      <span className="grid shrink-0 justify-items-end">{children}</span>
    </div>
  );
}

const slot = 'col-start-1 row-start-1 flex items-center gap-1.5 text-xs font-semibold';

/**
 * Pull-request checks panel under the merge gate. It narrates the same 9s
 * loop as MergeGateArt via the shared .mg-* keyframes: the AuditBench review
 * goes pending -> 2 critical -> clean, and the merge box goes blocked ->
 * ready -> merged. Each slot stacks its states in one grid cell and only
 * the active one is visible.
 */
export function PrChecksCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden rounded-xl border border-ink-line bg-ink-soft/90 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)] backdrop-blur ${className ?? ''}`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        <GithubLogoIcon className="h-4 w-4 shrink-0 text-[#E8ECF4]" />
        <span className="truncate font-mono text-xs text-muted-on-ink">
          acme/web <span className="text-[#E8ECF4]">#128</span> feat/checkout → main
        </span>
      </div>

      <CheckRow name="Lint & type check">
        <span className={`${slot} text-pass`}>
          <Tick /> 12s
        </span>
      </CheckRow>
      <CheckRow name="Secret scan">
        <span className={`${slot} text-pass`}>
          <Tick /> 4s
        </span>
      </CheckRow>
      <CheckRow name="AuditBench AI review">
        <span className={`${slot} mg-pending text-[#f5b642]`}>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#f5b642] border-t-transparent" />
          Reviewing…
        </span>
        <span className={`${slot} mg-fail text-[#ff8a9a]`}>
          <Cross /> 2 critical
        </span>
        <span className={`${slot} mg-green text-[#4ade94]`}>
          <Tick /> 0 findings
        </span>
      </CheckRow>

      <div className="grid border-t border-ink-line p-3">
        <div className="mg-red col-start-1 row-start-1 flex items-center justify-between rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-xs font-semibold text-[#ff8a9a]">
          Merging is blocked
          <span className="rounded-md bg-ink-line/80 px-2.5 py-1 text-muted-on-ink">Merge</span>
        </div>
        <div className="mg-ready col-start-1 row-start-1 flex items-center justify-between rounded-lg border border-pass/50 bg-pass/15 px-3 py-2 text-xs font-semibold text-[#4ade94]">
          All checks passed
          <span className="rounded-md bg-pass px-2.5 py-1 text-white">Merge pull request</span>
        </div>
        <div className="mg-merged col-start-1 row-start-1 flex items-center justify-between rounded-lg border border-[#8957e5]/50 bg-[#8957e5]/15 px-3 py-2 text-xs font-semibold text-[#c4a5ff]">
          Merged into main
          <span className="rounded-md bg-[#8957e5] px-2.5 py-1 text-white">Merged</span>
        </div>
      </div>
    </div>
  );
}
