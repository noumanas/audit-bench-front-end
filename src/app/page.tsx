import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { StructuredData } from '@/components/StructuredData';
import { PrPreview } from '@/components/home/PrPreview';
import { BitbucketLogoIcon, GithubLogoIcon, GitlabLogoIcon } from '@/components/icons';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'AI code review before it ships',
  description:
    'Audit Bench Ai reviews every pull request with static analysis and AI, comments on the exact lines with fixes, and blocks the merge until critical issues are resolved.',
  keywords: [
    'AI code review',
    'auditbench',
    'audit bench',
    'secure code review checklist',
    'secure coding checklist',
    'audit ai code',
    'ai code audit',
    'ai code security checklist',
    'ai audit for code quality',
    'pull request approval',
    'ai code review tools for large codebases',
    'ai code quality checker',
    'ai audit pricing',
    'owasp top 10',
  ],
  alternates: { canonical: '/' },
};

const HOW_IT_REVIEWS = [
  {
    step: '01',
    title: 'Free checks first',
    body: 'ESLint, TypeScript, Semgrep and secret scanning run on every change at no cost, so AI is spent only where it matters.',
  },
  {
    step: '02',
    title: 'Context beyond the diff',
    body: 'It finds where changed functions are used across the repository, so a breaking change in one file is caught in another.',
  },
  {
    step: '03',
    title: 'Learns your standards',
    body: 'Rules in plain English or auditbench.md, plus what it learns from replies and reactions. Noise drops every week.',
  },
];

const EXAMPLES = [
  {
    stack: 'TypeScript · Express',
    kind: 'Security',
    tone: 'text-ab-coral',
    codeTone: 'bg-tomato/10 text-[#FFD9D3]',
    code: "db.query(`SELECT * FROM orders WHERE id = '${id}'`)",
    title: 'SQL built from the request query',
    body: 'Any visitor can read every order. Suggested fix uses a parameter.',
  },
  {
    stack: 'Go · net/http',
    kind: 'Logic',
    tone: 'text-ab-amber',
    codeTone: 'bg-ab-amber/10 text-[#FBEFC7]',
    code: 'json.NewDecoder(r.Body).Decode(&req)',
    title: 'Decode error ignored',
    body: 'Invalid input silently creates an empty order. Return 400 on error.',
  },
  {
    stack: 'TypeScript · Prisma',
    kind: 'Concurrency',
    tone: 'text-ab-amber',
    codeTone: 'bg-ab-amber/10 text-[#FBEFC7]',
    code: 'data: { uses: coupon.uses + 1 }',
    title: 'Read-then-write race',
    body: 'Two requests at once redeem a coupon past its limit. Use an atomic increment.',
  },
];

const STACK = [
  {
    label: 'Git hosts',
    title: 'GitHub, GitLab, Bitbucket',
    body: 'A bot identity, inline reviews and a pass/fail check on each.',
    href: '/features',
  },
  {
    label: 'Editor & CI',
    title: 'VS Code and CLI',
    body: 'Review before you push, or gate any pipeline with one command.',
    href: '/cli',
  },
  {
    label: 'Your model',
    title: 'Ten AI providers',
    body: 'Anthropic, OpenAI, Gemini and more, with automatic fallback if one fails.',
    href: '/features',
  },
  {
    label: 'Whole repository',
    title: 'Deep scans',
    body: 'Secrets, vulnerable dependencies, licenses, dead and duplicate code.',
    href: '/scan',
  },
];

const SECURITY = [
  { title: 'Least-privilege GitHub App', body: 'Contents read-only; writes only reviews and checks.' },
  { title: 'Never trains on your code', body: 'Not by us, not by our AI providers.' },
  { title: 'No source kept', body: 'Findings are stored, not your code. Secrets are masked.' },
  { title: 'Delete on demand', body: 'Remove a report or the whole account in one click.' },
  { title: 'Only the changed lines', body: 'Pull request reviews send the diff, not the repository.' },
  { title: 'Your choice of AI provider', body: 'Pick the provider your security team already approved.' },
];

const FAQ = [
  {
    q: 'How much does it cost?',
    a: 'Free to start. Pro is $29 a month, Team $99 a month, and Enterprise is priced for your organisation.',
  },
  { q: 'Is my code used to train AI?', a: 'No. Neither we nor our AI providers train on your code.' },
  {
    q: 'Which languages are supported?',
    a: 'TypeScript, JavaScript, Python, Go, Java, PHP, Ruby and more, with framework-aware checks for React, Next.js, NestJS, Django, Laravel and Spring Boot.',
  },
  {
    q: 'Can it block a merge?',
    a: 'Yes. Make "Audit Bench Ai" a required status check and blocking issues lock the merge button.',
  },
  {
    q: 'Which git providers are supported?',
    a: 'GitHub, GitLab and Bitbucket, with inline pull request reviews and a pass/fail status on each.',
  },
  { q: 'Is it free for open source?', a: 'Paste any public pull request at auditbenchai.com/scan for a free review.' },
];

const HOMEPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    'AI code review that combines LLM reasoning with static analysis to catch security holes, logic bugs, and framework misuse, and blocks risky merges.',
  offers: [
    { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Pro', price: '29', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Team', price: '99', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Enterprise', price: 'Custom', priceCurrency: 'USD' },
  ],
};

// Must match the FAQ shown on the page.
const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

function SectionLabel({ children, className = 'text-lavender' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-ab-mono text-[11.5px] font-medium tracking-[0.14em] uppercase ${className}`}>
      [ {children} ]
    </span>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="font-display font-medium tracking-[-0.02em] italic">{children}</span>;
}

export default function HomePage() {
  return (
    <div className="bg-ab-bg font-ab text-ab-text">
      <StructuredData data={[HOMEPAGE_SCHEMA, HOME_FAQ_SCHEMA]} />

      {/* Hero */}
      <section aria-labelledby="hero-title" className="overflow-hidden">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-4 pt-20 pb-16 text-center sm:px-8 md:pt-24">
          <Link
            href="/features"
            className="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-ab-line-2 bg-[#170B1F] py-1 pr-1.5 pl-3.5 text-[13px] text-[#E2CFEC]"
          >
            New: answers @auditbench in a thread on the exact line
            <span className="rounded-full bg-ab-line px-2.5 py-1 text-xs whitespace-nowrap text-chartreuse">Read more →</span>
          </Link>
          <h1
            id="hero-title"
            className="m-0 max-w-[13em] text-[clamp(44px,6.6vw,88px)] leading-[0.98] font-semibold tracking-[-0.045em] text-white"
          >
            The merge gate for{' '}
            <span className="text-lavender">
              <Accent>AI-written</Accent>
            </span>{' '}
            code.
          </h1>
          <p className="m-0 max-w-[40em] text-[18.5px] leading-relaxed text-ab-muted">
            Audit Bench Ai reviews every pull request with static analysis and AI, comments on the exact lines with
            fixes, and blocks the merge until critical issues are resolved.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[50px] items-center gap-2.5 rounded-[10px] bg-chartreuse px-6 text-[15.5px] font-semibold text-ab-bg"
            >
              <GithubLogoIcon className="h-[17px] w-[17px]" />
              Start free on GitHub
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[50px] items-center rounded-[10px] border border-ab-line-3 px-6 text-[15.5px] font-medium text-white hover:border-lavender"
            >
              Book a demo
            </Link>
          </div>
          <span className="font-ab-mono text-[12.5px] text-ab-dim">
            Free plan · Read-only code access · Never used to train AI
          </span>
        </div>
        <div className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-8">
          <PrPreview />
        </div>
      </section>

      {/* Works with */}
      <section aria-label="Works with" className="border-y border-ab-line">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-9 sm:px-8">
          <SectionLabel className="text-ab-dim">Works where you ship</SectionLabel>
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-ab-soft">
            <GithubLogoIcon className="h-5 w-5" /> GitHub
          </span>
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-ab-soft">
            <GitlabLogoIcon className="h-5 w-5" /> GitLab
          </span>
          <span className="inline-flex items-center gap-2 text-lg font-semibold text-ab-soft">
            <BitbucketLogoIcon className="h-5 w-5" /> Bitbucket
          </span>
          <span className="text-lg font-semibold text-ab-soft">VS Code</span>
          <span className="text-lg font-semibold text-ab-soft">CLI for CI</span>
        </div>
      </section>

      {/* How it reviews */}
      <section
        aria-labelledby="how-title"
        className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 pt-28 pb-16 sm:px-8"
      >
        <div className="flex max-w-[780px] flex-col gap-3.5">
          <SectionLabel>How it reviews</SectionLabel>
          <h2
            id="how-title"
            className="m-0 text-[clamp(36px,4.4vw,52px)] leading-[1.02] font-semibold tracking-[-0.04em] text-white"
          >
            Reads the change like your <Accent>best</Accent> reviewer would.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[18px] border border-ab-line bg-ab-line md:grid-cols-3">
          {HOW_IT_REVIEWS.map((s) => (
            <div key={s.step} className="flex flex-col gap-3.5 bg-ab-deep p-8">
              <span className="font-ab-mono text-[13px] font-medium text-chartreuse">{s.step}</span>
              <h3 className="m-0 text-[22px] font-semibold text-white">{s.title}</h3>
              <p className="m-0 text-[15px] leading-relaxed text-ab-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it catches */}
      <section
        aria-labelledby="catches-title"
        className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pt-16 pb-28 sm:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex max-w-[720px] flex-col gap-3.5">
            <SectionLabel>What it catches</SectionLabel>
            <h2
              id="catches-title"
              className="m-0 text-[clamp(36px,4.4vw,52px)] leading-[1.02] font-semibold tracking-[-0.04em] text-white"
            >
              Bugs linters miss, in every stack.
            </h2>
          </div>
          <Link
            href="/scan"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-[#E9D5F5] hover:text-white"
          >
            Try it on a public PR →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {EXAMPLES.map((e) => (
            <article
              key={e.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-ab-line bg-ab-panel"
            >
              <div className="flex justify-between gap-2 border-b border-ab-line px-4 py-3 font-ab-mono text-xs text-ab-dim">
                <span>{e.stack}</span>
                <span className={e.tone}>{e.kind}</span>
              </div>
              <pre className={`m-0 overflow-x-auto px-4 py-2.5 font-ab-mono text-xs leading-[1.7] ${e.codeTone}`}>
                {e.code}
              </pre>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="m-0 text-[15px] font-semibold text-white">{e.title}</h3>
                <p className="m-0 text-[13.5px] leading-relaxed text-ab-muted">{e.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Merge gate */}
      <section aria-labelledby="gate-title" className="bg-lavender text-ab-bg">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-14 px-4 py-24 sm:px-8">
          <div className="flex flex-[1_1_420px] flex-col gap-4">
            <SectionLabel className="text-ab-bg">The merge gate</SectionLabel>
            <h2
              id="gate-title"
              className="m-0 text-[clamp(38px,4.6vw,56px)] leading-none font-semibold tracking-[-0.045em]"
            >
              Advice is optional. <Accent>A gate isn&apos;t.</Accent>
            </h2>
            <p className="m-0 max-w-[32em] text-[17px] leading-relaxed">
              Make &quot;Audit Bench Ai&quot; a required check. Critical issues, high-severity security findings,
              exposed secrets, conflicts and failing CI keep the merge button locked until they&apos;re fixed.
            </p>
            <Link
              href="/docs/required-check"
              className="inline-flex min-h-12 items-center self-start rounded-[10px] bg-ab-bg px-5 text-[15px] font-semibold text-white"
            >
              Set it up in 2 minutes →
            </Link>
          </div>
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2.5">
            <div className="flex items-center gap-3.5 rounded-2xl bg-ab-bg px-5 py-4 text-ab-text">
              <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-tomato">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0E0612"
                  strokeWidth="3"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M7 7l10 10M17 7L7 17" />
                </svg>
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="text-[15px] text-white">Audit Bench Ai — Blocking issues found</strong>
                <span className="text-[13px] text-ab-muted">Required · 1 critical in refunds.service.ts:42</span>
              </span>
            </div>
            <div className="flex items-center gap-3.5 rounded-2xl bg-ab-bg px-5 py-4 text-ab-text">
              <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-chartreuse">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0E0612"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="text-[15px] text-white">build / test (ubuntu-latest)</strong>
                <span className="text-[13px] text-ab-muted">Successful in 2m 14s</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border-[1.5px] border-dashed border-ab-bg bg-ab-bg/10 px-5 py-4">
              <strong className="text-[15px]">Merge pull request</strong>
              <span className="font-ab-mono text-xs font-medium tracking-[0.08em] uppercase">Blocked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Your stack */}
      <section aria-labelledby="stack-title" className="mx-auto flex max-w-[1280px] flex-col gap-11 px-4 py-28 sm:px-8">
        <div className="flex max-w-[780px] flex-col gap-3.5">
          <SectionLabel>Your stack</SectionLabel>
          <h2
            id="stack-title"
            className="m-0 text-[clamp(36px,4.4vw,52px)] leading-[1.02] font-semibold tracking-[-0.04em] text-white"
          >
            One review layer, everywhere code changes.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="flex flex-col gap-2.5 rounded-2xl border border-ab-line bg-ab-panel p-6 transition-colors hover:border-ab-line-3"
            >
              <span className="font-ab-mono text-xs font-medium text-chartreuse">{s.label}</span>
              <strong className="text-lg text-white">{s.title}</strong>
              <span className="text-sm leading-relaxed text-ab-muted">{s.body}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Enterprise security */}
      <section aria-labelledby="security-title" className="border-y border-ab-line bg-ab-deep">
        <div className="mx-auto flex max-w-[1280px] flex-wrap gap-14 px-4 py-24 sm:px-8">
          <div className="flex flex-[1_1_380px] flex-col gap-4">
            <SectionLabel>Enterprise</SectionLabel>
            <h2
              id="security-title"
              className="m-0 text-[clamp(34px,4vw,48px)] leading-[1.04] font-semibold tracking-[-0.04em] text-white"
            >
              Security your CISO can <Accent>sign off</Accent> on.
            </h2>
            <p className="m-0 text-[16.5px] leading-relaxed text-ab-muted">
              Least-privilege access, no training on your code, and data you can delete at any time.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/contact"
                className="inline-flex min-h-[46px] items-center rounded-[10px] bg-chartreuse px-5 text-[14.5px] font-semibold text-ab-bg"
              >
                Talk to sales
              </Link>
              <Link
                href="/security"
                className="inline-flex min-h-[46px] items-center rounded-[10px] border border-ab-line-3 px-5 text-[14.5px] font-medium text-white hover:border-lavender"
              >
                Security overview
              </Link>
            </div>
          </div>
          <div className="grid flex-[1_1_560px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ab-line bg-ab-line sm:grid-cols-2">
            {SECURITY.map((s) => (
              <div key={s.title} className="flex flex-col gap-1.5 bg-ab-panel p-6">
                <strong className="text-[15.5px] text-white">{s.title}</strong>
                <span className="text-sm leading-relaxed text-ab-muted">{s.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto flex max-w-[1280px] flex-wrap gap-12 px-4 py-28 sm:px-8">
        <div className="flex flex-[1_1_300px] flex-col gap-3.5">
          <SectionLabel>FAQ</SectionLabel>
          <h2
            id="faq-title"
            className="m-0 text-[clamp(34px,3.8vw,44px)] leading-[1.04] font-semibold tracking-[-0.04em] text-white"
          >
            Questions, answered.
          </h2>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center self-start text-[15px] text-[#E9D5F5] hover:text-white"
          >
            See full pricing →
          </Link>
        </div>
        <div className="flex flex-[2_1_560px] flex-col border-t border-ab-line">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group border-b border-ab-line py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-white [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-xl text-ab-dim transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 mb-0 text-[15px] leading-relaxed text-ab-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section aria-labelledby="cta-title" className="px-4 pb-28 sm:px-8">
        <div className="mx-auto flex max-w-[1216px] flex-col items-center gap-5 rounded-[28px] bg-tomato px-6 py-[72px] text-center text-ab-bg sm:px-10">
          <h2
            id="cta-title"
            className="m-0 max-w-[14em] text-[clamp(38px,5.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.045em]"
          >
            Ship code, not <Accent>surprises</Accent>.
          </h2>
          <p className="m-0 max-w-[34em] text-[17px] leading-relaxed">
            Install in two minutes. Your next pull request gets a full review.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-[52px] items-center rounded-[10px] bg-ab-bg px-6 text-[15.5px] font-semibold text-white"
            >
              Start free
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[52px] items-center rounded-[10px] border-[1.5px] border-ab-bg px-6 text-[15.5px] font-semibold text-ab-bg"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
