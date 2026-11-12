import Link from 'next/link';
import { Logo } from '@/components/Logo';

/** Field styles shared by the login and signup forms. */
export const authLabelClass = 'mb-1.5 block text-xs font-semibold text-muted-on-ink';
export const authInputClass =
  'w-full rounded-lg border border-ink-line bg-ink-soft px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-cobalt focus:ring-2 focus:ring-cobalt/25';
export const authButtonClass =
  'group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cobalt px-4 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(117,70,244,0.9)] transition-all hover:-translate-y-px hover:bg-[#7546f4] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0';

/**
 * Full-height split for /login, /signup and /forgot-password: the brand
 * "Dusk" mesh panel (same art as the homepage hero) on the left from lg up,
 * the form on the right. The navbar is hidden on these routes, so this owns
 * the viewport.
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
      <aside className="sticky top-0 hidden h-screen self-start bg-black p-2.5 lg:block">
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] p-10">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand texture, already compressed WebP */}
          <img
            src="/brand/mesh-dusk.webp"
            alt=""
            aria-hidden="true"
            width={1536}
            height={1024}
            className="mesh-drift absolute inset-0 h-full w-full object-cover object-[55%_50%]"
          />
          {/* Darkens the lower edge so the small copy there keeps its contrast. */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

          <Link href="/" aria-label="AuditBench AI home" className="relative self-start">
            <Logo size="lg" />
          </Link>

          <div className="relative">
            <h2 className="text-[clamp(28px,2.6vw,40px)] leading-[1.1] font-light tracking-[-0.03em] text-white">
              See the risk.
              <br />
              Decide what ships.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/80">
              AuditBench reviews pull requests for security gaps, exposed secrets and logic bugs, and reports a merge
              check. You decide what goes into main.
            </p>
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="fade-up w-full max-w-[400px]">
          <Link href="/" aria-label="AuditBench AI home" className="mb-10 inline-block lg:hidden">
            <Logo size="lg" />
          </Link>
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-cobalt uppercase">{eyebrow}</span>
          </div>
          <h1 className="mb-2 text-3xl text-white font-light tracking-[-0.03em]">{title}</h1>
          <p className="mb-7 text-sm leading-relaxed text-muted-on-ink">{subtitle}</p>
          {children}
          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-on-ink/70">
            By continuing you agree to the{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-white">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
