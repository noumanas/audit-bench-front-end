import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { MergeGateArt } from './MergeGateArt';
import { PrChecksCard } from './PrChecksCard';

/** Field styles shared by the login and signup forms. */
export const authLabelClass = 'mb-1.5 block text-xs font-semibold text-muted-on-ink';
export const authInputClass =
  'w-full rounded-lg border border-ink-line bg-ink-soft px-3.5 py-2.5 text-sm text-[#E8ECF4] outline-none transition-colors focus:border-cobalt focus:ring-2 focus:ring-cobalt/25';
export const authButtonClass =
  'group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cobalt px-4 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(43,91,227,0.9)] transition-all hover:-translate-y-px hover:bg-[#3a68ee] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0';

/**
 * Full-height split for /login and /signup: the merge-gate scene (gate + PR
 * checks card, animated in sync) on the left from lg up, the form on the
 * right. The navbar is hidden on these routes, so this owns the viewport.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col overflow-hidden border-r border-ink-line bg-[#0b0f17] px-12 py-10 lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(rgba(74,118,240,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(74,118,240,0.09)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_50%_40%,black_30%,transparent_75%)]"
        />
        <div aria-hidden="true" className="glow-pulse absolute top-[18%] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cobalt/25 blur-[110px]" />

        <div className="relative flex items-center justify-between">
          <Link href="/" aria-label="AuditBench AI home">
            <Logo size="lg" />
          </Link>
          <span className="flex items-center gap-2 rounded-full border border-ink-line bg-ink/70 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.14em] text-muted-on-ink uppercase">
            <span className="step-pulse h-1.5 w-1.5 rounded-full bg-pass" />
            Merge gate · live
          </span>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center py-6">
          <MergeGateArt className="w-full max-w-[380px]" />
          <PrChecksCard className="-mt-6 w-full max-w-[400px]" />
        </div>

        <div className="relative">
          <h2 className="text-[26px] leading-tight font-bold tracking-tight text-[#E8ECF4]">
            Nothing risky reaches <span className="text-[#8fb0ff]">main</span>.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-on-ink">
            AuditBench reviews every pull request for security, secrets and code quality — and holds the
            merge until it&apos;s clean.
          </p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="fade-up w-full max-w-[400px]">
          <Link href="/" aria-label="AuditBench AI home" className="mb-10 inline-block lg:hidden">
            <Logo size="lg" />
          </Link>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt uppercase">{eyebrow}</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#E8ECF4]">{title}</h1>
          <p className="mb-7 text-sm leading-relaxed text-muted-on-ink">{subtitle}</p>
          {children}
          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-on-ink/70">
            By continuing you agree to the{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-[#E8ECF4]">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[#E8ECF4]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
