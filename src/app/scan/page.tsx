import type { Metadata } from 'next';
import { HeroEntrance } from '@/components/gsap/HeroEntrance';
import { ScrollReveal } from '@/components/gsap/ScrollReveal';
import { TextReveal } from '@/components/gsap/TextReveal';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { PublicScanForm } from '@/components/PublicScanForm';

export const metadata: Metadata = {
  title: 'Free GitHub repository scan',
  description:
    'Scan any public GitHub repository free, no sign-up: exposed secrets, vulnerable dependencies, license risk, dead code, duplication and an overall health score, with a report you can share.',
  alternates: { canonical: '/scan' },
};

const CHECKS = [
  { title: 'Exposed secrets', detail: 'API keys, private keys and tokens committed to the code.' },
  { title: 'Vulnerable dependencies', detail: 'Known advisories for npm and Python packages from the lockfile.' },
  { title: 'License risk', detail: 'Copyleft or unclear licenses in your dependencies.' },
  {
    title: 'Code checks',
    detail: 'Lint and type errors, risky patterns, complexity and Semgrep rules where available.',
  },
  { title: 'Structure', detail: 'Dead files, duplicated logic and circular imports across the repo.' },
  { title: 'Tests and team', detail: 'Test-to-source ratio, CI test steps, and how concentrated the commits are.' },
];

const STEPS = [
  { n: '1', title: 'Paste a public repo URL', detail: 'Any public GitHub repository. No account, no token.' },
  {
    n: '2',
    title: 'Get a report in about a minute',
    detail: 'An overall risk rating, a health score out of 100 and findings by file.',
  },
  { n: '3', title: 'Share the link', detail: 'Every report has its own URL to send to your team or post on LinkedIn.' },
];

export default function FreeScanPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-line bg-ink px-6 py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-200px] left-1/2 h-[380px] w-[600px] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(43,91,227,0.3) 0%, rgba(43,91,227,0) 70%)' }}
        />
        <HeroEntrance className="relative mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Free · No sign-up
          </div>
          <h1 className="mb-4 text-4xl leading-tight font-bold text-[#E8ECF4] sm:text-5xl">
            Scan any public GitHub repo
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-on-ink">
            Find exposed secrets, vulnerable dependencies and risky code in about a minute, then share the report with
            one link.
          </p>
          <div className="mx-auto max-w-2xl text-left">
            <PublicScanForm />
          </div>
        </HeroEntrance>
      </section>

      <section className="bg-paper px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-[#1C2128]">
            <TextReveal>How it works</TextReveal>
          </h2>
          <ScrollReveal>
            <ol className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-xl border border-paper-line bg-paper-card p-5">
                  <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-cobalt font-mono text-[12px] font-bold text-white">
                    {s.n}
                  </span>
                  <h3 className="text-[15px] font-bold text-[#1C2128]">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-on-paper">{s.detail}</p>
                </li>
              ))}
            </ol>
          </ScrollReveal>

          <h2 className="mt-14 mb-6 text-center text-2xl font-bold text-[#1C2128]">
            <TextReveal>What the free scan checks</TextReveal>
          </h2>
          <ScrollReveal stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((c) => (
              <div key={c.title} className="rounded-lg border border-paper-line bg-paper-card p-4">
                <h3 className="text-[14px] font-bold text-[#1C2128]">{c.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-on-paper">{c.detail}</p>
              </div>
            ))}
          </ScrollReveal>

          <ScrollReveal stagger className="mt-14 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-paper-line bg-paper-card p-6">
              <h3 className="font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">Free scan</h3>
              <ul className="mt-3 space-y-1.5 text-[13px] text-[#1C2128]">
                <li>✓ Public GitHub repositories</li>
                <li>✓ All local checks above</li>
                <li>✓ Shareable report link</li>
                <li className="text-muted-on-paper">– No AI review of risky code</li>
                <li className="text-muted-on-paper">– Secret locations hidden on shared links</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-cobalt bg-paper-card p-6">
              <h3 className="font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase">
                With a free account
              </h3>
              <ul className="mt-3 space-y-1.5 text-[13px] text-[#1C2128]">
                <li>✓ AI review of risky code, with root causes and fixes</li>
                <li>✓ Private repositories on GitHub and GitLab</li>
                <li>✓ Automatic pull request reviews</li>
                <li>✓ Fix with AI and commit back to your branch</li>
              </ul>
              <Link
                href="/signup"
                className="mt-5 inline-block rounded-lg bg-cobalt px-5 py-2.5 text-sm font-bold text-white hover:bg-cobalt-dark"
              >
                Sign up free
              </Link>
            </div>
          </ScrollReveal>

          <p className="mt-10 text-center text-[12px] leading-relaxed text-muted-on-paper">
            We only read public code, never run it, and never store your GitHub credentials for a free scan. Shared
            reports never show where a secret is or who wrote the code.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
