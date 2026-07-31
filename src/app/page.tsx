import type { Metadata } from 'next';
import Link from 'next/link';
import {
  siReact,
  siNextdotjs,
  siNodedotjs,
  siNestjs,
  siPython,
  siFastapi,
  siDjango,
  siLaravel,
  siSpringboot,
  siSupabase,
  siDeno,
  siFirebase,
  siAnthropic,
  siGooglegemini,
  siDeepseek,
  siZdotai,
  siQwen,
  siKimi,
  siMistralai,
  siMinimax,
} from 'simple-icons';
import { Footer } from '@/components/Footer';
import { PricingTeaser } from '@/components/PricingTeaser';
import { HeroShowcase } from '@/components/HeroShowcase';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { Reveal } from '@/components/Reveal';
import { TechLogo } from '@/components/TechLogo';
import { TypingText, TypingSegment } from '@/components/TypingText';

export const metadata: Metadata = {
  title: 'AI code review before it ships',
  description:
    'Combine LLM reasoning with static analysis to catch security holes, logic bugs, and framework misuse — on a single file, a pull request, or a whole repository.',
  alternates: { canonical: '/' },
};

const HERO_HEADLINE: TypingSegment[] = [
  { text: 'AI coding assistants ship fast.\nMake sure what they ship is ' },
  { text: 'safe', className: 'text-cobalt' },
  { text: '.' },
];

const STATS = [
  { value: '5', label: 'Review lenses per audit' },
  { value: '10', label: 'LLM providers to choose from' },
  { value: '11+', label: 'Frameworks understood' },
  { value: '2', label: 'Git providers, native PR/MR review' },
];

// icons: [] for the two brands (OpenAI, xAI) with no accurate mark available
// in simple-icons — left as text-only rather than approximating a logo.
const LLM_PROVIDERS = [
  { label: 'Anthropic', icons: [siAnthropic] },
  { label: 'OpenAI', icons: [] },
  { label: 'Gemini', icons: [siGooglegemini] },
  { label: 'DeepSeek', icons: [siDeepseek] },
  { label: 'Z.AI (GLM)', icons: [siZdotai] },
  { label: 'Qwen', icons: [siQwen] },
  { label: 'Kimi', icons: [siKimi] },
  { label: 'xAI (Grok)', icons: [] },
  { label: 'Mistral', icons: [siMistralai] },
  { label: 'MiniMax', icons: [siMinimax] },
];

const TEAM_CAPABILITIES = [
  {
    title: 'Pull & merge request review',
    detail:
      'Review a GitHub PR or GitLab MR scoped to just the changed lines — findings post back as inline review comments, a summary, and a merge-blocking status check.',
  },
  {
    title: 'Team analytics dashboard',
    detail:
      'Security, performance, and technical-debt scores trended over time, plus a breakdown of your most common findings and riskiest files.',
  },
  {
    title: 'CLI for CI pipelines',
    href: '/cli',
    detail:
      'Run `auditbench scan` or `auditbench audit` from a pipeline step, a pre-commit hook, or a terminal — same engine, same findings, scriptable output.',
  },
  {
    title: 'Role-ready plans & quotas',
    detail:
      'Daily and monthly AI-audit limits per plan, usage-based — not a flat seat count — so cost scales with what a team actually reviews.',
  },
];

const WORKFLOW_INTEGRATIONS = [
  {
    title: 'Inline PR & MR comments',
    detail:
      'Findings land as real review comments on the exact changed lines — GitHub review threads or GitLab discussions — not a dashboard you have to remember to check.',
  },
  {
    title: 'Auto-generated summary',
    detail:
      'Every review posts a plain-English walkthrough alongside the inline comments — verdict, finding counts, and a link to the full report.',
  },
  {
    title: 'Merge-blocking quality gates',
    detail:
      'A commit status check reports pass/fail on every PR and MR. Wire it into branch protection and stop shippable-looking regressions before they merge.',
  },
  {
    title: 'README score badge',
    detail: 'A live, always-current badge for your README showing the verdict of your most recent scan.',
  },
  {
    title: 'Dependency vulnerability scanning',
    detail:
      'npm audit for Node, OSV.dev for Python — known-vulnerable packages surface automatically, no extra tooling to install.',
  },
  {
    title: 'Conversational PR chat',
    detail:
      '@-mention the bot in any PR or MR thread and it replies in context, using the diff to answer follow-up questions.',
  },
];

const PIPELINE_STAGES = [
  {
    stage: '01',
    title: 'Free local checks',
    detail: 'ESLint, TypeScript diagnostics, complexity, formatting, and secret scanning run first — no AI, no cost.',
  },
  {
    stage: '02',
    title: 'AI on flagged code only',
    detail: 'Only the functions Stage 1 flags as risky go to an LLM, with just the relevant code and types — not the whole file.',
  },
  {
    stage: '03',
    title: 'Cached by content hash',
    detail: 'Re-scanning unchanged code — the common case across repeated repo scans — costs nothing and returns instantly.',
  },
];

const FRAMEWORKS = [
  { label: 'React', icons: [siReact] },
  { label: 'Next.js', icons: [siNextdotjs] },
  { label: 'Node.js', icons: [siNodedotjs] },
  { label: 'NestJS', icons: [siNestjs] },
  { label: 'Python/FastAPI', icons: [siPython, siFastapi] },
  { label: 'Django', icons: [siDjango] },
  { label: 'Laravel', icons: [siLaravel] },
  { label: 'Spring Boot', icons: [siSpringboot] },
  { label: 'Supabase', icons: [siSupabase] },
  { label: 'Deno', icons: [siDeno] },
  { label: 'Firebase', icons: [siFirebase] },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-line bg-ink px-6 py-20">
        <div
          aria-hidden="true"
          className="glow-pulse pointer-events-none absolute top-[-220px] left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(43,91,227,0.35) 0%, rgba(43,91,227,0) 70%)' }}
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="fade-up mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
                AI code review, before it ships
              </div>
              {/* Reserves the heading's final rendered size immediately via an
                  invisible copy of the full text, so the typing animation
                  fills already-allocated space instead of growing the box
                  and pushing everything below it down frame by frame (this
                  was a real, measured CLS regression — see WebVital data). */}
              <div className="relative mb-5">
                <h1
                  aria-hidden="true"
                  className="invisible text-4xl leading-tight font-bold sm:text-5xl"
                >
                  {HERO_HEADLINE.map((seg, i) => (
                    <span key={i}>
                      {seg.text.split('\n').map((line, j) => (
                        <span key={j}>
                          {j > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </span>
                  ))}
                </h1>
                <h1
                  className="fade-up absolute inset-0 text-4xl leading-tight font-bold text-[#E8ECF4] sm:text-5xl"
                  style={{ animationDelay: '80ms' }}
                >
                  <TypingText segments={HERO_HEADLINE} />
                </h1>
              </div>
              <p
                className="fade-up mb-8 max-w-md text-base leading-relaxed text-muted-on-ink"
                style={{ animationDelay: '160ms' }}
              >
                Audit Bench Ai combines LLM reasoning with static analysis to catch the security holes,
                logic bugs, and framework misuse that traditional linters miss — on a single file, a
                pull request, or a whole repository.
              </p>
              <div className="fade-up flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
                <Link
                  href="/signup"
                  className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
                >
                  Get started free
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
                >
                  See pricing
                </Link>
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: '200ms' }}>
              <HeroShowcase />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-ink-line pt-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className="fade-up" style={{ animationDelay: `${300 + i * 80}ms` }}>
                <div className="text-2xl font-bold text-[#E8ECF4]">{s.value}</div>
                <div className="mt-1 text-xs leading-snug text-muted-on-ink">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack / integrations bar */}
      <section className="border-b border-ink-line bg-ink px-6 py-10">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-5 text-center font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Works with the stack your team already runs
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {FRAMEWORKS.map((fw) => (
              <span
                key={fw.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink transition-colors duration-200 hover:border-cobalt/50 hover:text-[#E8ECF4]"
              >
                {fw.icons.map((icon) => (
                  <TechLogo
                    key={icon.slug}
                    icon={icon}
                    className="h-3.5 w-3.5 shrink-0 text-muted-on-ink transition-colors duration-200 group-hover:text-[color:var(--brand)]"
                  />
                ))}
                {fw.label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* LLM provider bar */}
      <section className="border-b border-ink-line bg-ink px-6 py-10">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-5 text-center font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Bring the model you already have a key for
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {LLM_PROVIDERS.map((p) => (
              <span
                key={p.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink transition-colors duration-200 hover:border-cobalt/50 hover:text-[#E8ECF4]"
              >
                {p.icons.map((icon) => (
                  <TechLogo
                    key={icon.slug}
                    icon={icon}
                    className="h-3.5 w-3.5 shrink-0 text-muted-on-ink transition-colors duration-200 group-hover:text-[color:var(--brand)]"
                  />
                ))}
                {p.label}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-lg text-center text-xs leading-relaxed text-muted-on-ink">
            Every provider runs the same three-stage pipeline and the same review lenses — pick
            the one that fits your budget or your existing contract, per audit or as your account default.
          </p>
        </Reveal>
      </section>

      {/* Problem statement */}
      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mb-3 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
            The problem
          </div>
          <p className="text-lg leading-relaxed text-[#1C2128]">
            Modern AI coding assistants generate code quickly but frequently introduce hidden bugs,
            security issues, and framework misuse. Traditional linters catch syntax problems — not
            business logic or intent.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <FeatureShowcase />
      </Reveal>

      {/* Built for teams */}
      <section className="border-t border-ink-line bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
              For engineering organizations
            </div>
            <h2 className="text-2xl font-bold text-[#1C2128]">Built for how teams actually ship</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-on-paper">
              Beyond one-off audits: review the code your team merges, track quality trends over
              time, and wire it into the pipeline you already have.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TEAM_CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="rounded-lg border border-paper-line bg-paper-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <h3 className="mb-2 text-sm font-bold text-[#1C2128]">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-cobalt">
                      {c.title}
                    </Link>
                  ) : (
                    c.title
                  )}
                </h3>
                <p className="text-sm leading-relaxed text-muted-on-paper">{c.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Workflow integrations */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
              Where you already work
            </div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">Lives inside the review you're already doing</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-on-ink">
              Not another tab to check. Findings, gates, and answers show up directly on the PR or MR.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_INTEGRATIONS.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-ink-line bg-ink-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <h3 className="mb-2 font-mono text-sm font-bold text-[#E8ECF4]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{f.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Cost governance / pipeline */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
              Cost control
            </div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">Engineered to control AI spend</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-on-ink">
              AI credits, not raw request counts. A three-stage pipeline keeps the LLM off the
              critical path until the code actually warrants it.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {PIPELINE_STAGES.map((s) => (
              <div
                key={s.stage}
                className="rounded-lg border border-ink-line bg-ink-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <div className="mb-2 font-mono text-[11px] text-muted-on-ink">{s.stage}</div>
                <div className="mb-1 text-sm font-bold text-[#E8ECF4]">{s.title}</div>
                <p className="text-xs leading-relaxed text-muted-on-ink">{s.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Pricing teaser */}
      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
              Plans
            </div>
            <h2 className="text-2xl font-bold text-[#1C2128]">Start free, upgrade when you need more</h2>
          </div>
          <PricingTeaser />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
            <Link href="/pricing" className="group text-sm font-semibold text-cobalt">
              Compare all plans{' '}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <span className="text-sm text-muted-on-paper">
              Need a custom rollout?{' '}
              <a href="mailto:noumanqureshi15@gmail.com" className="font-semibold text-cobalt hover:underline">
                Talk to sales
              </a>
              .
            </span>
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="border-t border-ink-line bg-ink px-6 py-16 text-center">
        <Reveal>
          <h2 className="mb-3 text-2xl font-bold text-[#E8ECF4]">Review your first repository free</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
            No credit card required. Connect GitHub or GitLab, or upload a .zip, and see what an audit
            finds in your own code.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
            >
              Get started free
            </Link>
            <a
              href="mailto:noumanqureshi15@gmail.com"
              className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
            >
              Talk to sales
            </a>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
