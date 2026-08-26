import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { StructuredData } from '@/components/StructuredData';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Technical Due Diligence for M&A',
  description:
    'Technical due diligence on a software acquisition or investment, in days not weeks — security exposure, technical debt, talent concentration risk, and a remediation cost estimate your IC can use.',
  keywords: [
    'technical due diligence',
    'software due diligence',
    'M&A technical diligence',
    'code audit for acquisition',
    'private equity technical diligence',
    'venture capital code audit',
    'technical risk report',
    'technical due diligence checklist',
    'technical due diligence cost',
    'how much does technical due diligence cost',
    'how long does technical due diligence take',
    'AI technical due diligence',
    'automated technical due diligence',
    'technical due diligence for startups',
    'technical due diligence for mid-market acquisition',
  ],
  alternates: { canonical: '/due-diligence' },
};

const WHAT_YOU_GET = [
  {
    title: 'Security exposure',
    detail: 'Vulnerabilities, exposed secrets, and dependency/license compliance gaps in the target codebase.',
  },
  {
    title: 'Technical debt',
    detail: 'A test-coverage read plus structural debt — circular imports, dead code, duplication — costed out in engineer-days.',
  },
  {
    title: 'Talent concentration risk',
    detail: 'How dependent the codebase is on one or two developers, and where the bus factor is thin.',
  },
  {
    title: 'Architecture consistency',
    detail: 'Whether the codebase reads as one coherent system or several styles stitched together — with cited examples, not a vibe.',
  },
  {
    title: 'Remediation estimate',
    detail: 'Engineer-days and a dollar range to fix what we found, rolled up into one overall risk rating your IC can act on.',
  },
];

// The actual pipeline, in the order it runs — see the technical writeup for
// specifics; this is deliberately literal about what does and doesn't
// happen (e.g. we never execute a target's code), since overclaiming here
// is the kind of thing a technical buyer would catch immediately.
const HOW_IT_WORKS = [
  {
    stage: '01',
    title: 'Full-repo ingestion',
    detail: 'Connect a GitHub or GitLab repo (read-only) or upload a zip. Every source file gets scanned, and commit-level contributor stats are pulled directly from the provider’s own API — no local git-history walk.',
  },
  {
    stage: '02',
    title: 'Security & dependency scan',
    detail: 'Static analysis plus LLM review on flagged code, known-vulnerability checks against your lockfile, and a license-compliance pass that flags GPL/AGPL/copyleft dependencies when your own codebase looks closed-source.',
  },
  {
    stage: '03',
    title: 'Test coverage read',
    detail: 'A static, no-execution estimate — test-to-source file ratio, plus whether a coverage threshold and CI test step are actually configured. We never run a target company’s test suite on our infrastructure.',
  },
  {
    stage: '04',
    title: 'Architecture consistency',
    detail: 'One LLM pass sampled across the codebase flags mixed state-management patterns, inconsistent conventions, and ad-hoc development — cited to real files, not a generic score.',
  },
  {
    stage: '05',
    title: 'Talent concentration',
    detail: 'Contributor commit-share analysis surfaces bus-factor risk — the module one departing engineer would take the most knowledge out of — before it’s your problem.',
  },
  {
    stage: '06',
    title: 'Aggregation & scoring',
    detail: 'Every category above rolls up into one weighted Overall Risk Rating and a remediation-cost estimate in engineer-days and dollars — deterministic math over real findings, not another LLM guess.',
  },
];

const TIERS = [
  {
    name: 'T1 — Investment Screening',
    price: '$5,000',
    detail: 'A fast first-pass read on whether the tech merits deeper diligence.',
    turnaround: 'Go/no-go signal in 3–5 business days',
  },
  {
    name: 'T2 — Full Technical Diligence',
    price: '$12,000–$20,000',
    detail: 'A complete report built for your investment committee — security, debt, talent risk, and scalability, with remediation cost estimates.',
    turnaround: 'Delivered in 1–2 weeks',
    featured: true,
  },
  {
    name: 'T3 — Post-Close Monitoring',
    price: 'Custom',
    detail: 'Ongoing scanning through the holding period, so portfolio companies don’t quietly accumulate the same risks you just paid to identify.',
    turnaround: 'Optional add-on, billed per period',
  },
];

const WHY_US = [
  {
    title: 'Days, not weeks',
    detail: 'Automated scanning means turnaround measured in days for a screening read, not the 2–3 weeks a consultant engagement takes to staff and start.',
  },
  {
    title: 'Software, not just consultants',
    detail: 'You’re buying a repeatable engine, not a pair of contractor hours — the same review depth every time, not whoever a boutique firm could staff that week.',
  },
  {
    title: 'Per-engagement pricing',
    detail: '$5,000–$20,000 per report, billed once for the engagement — not a monthly seat license you have to justify renewing.',
  },
  {
    title: 'Built on a production tool',
    detail: 'The same engine already reviewing live pull requests for engineering teams, not a one-off diligence product assembled for this market.',
  },
  {
    title: 'NDA-first',
    detail: 'Repo access is granted read-only and only after your NDA is signed. Credentials are encrypted at rest, and your code is never used to train any model — see our full Security & Trust page for the details.',
    href: '/security',
  },
];

// Targets the long-tail questions people actually search once they already
// know what TDD is (checklist, cost, timeline) rather than competing head-on
// with Bain/Snyk/consulting-firm content for the bare "technical due
// diligence" term itself — see the FAQPage schema below, which is what lets
// an answer engine lift these directly instead of needing us to rank #1.
const FAQ_ITEMS = [
  {
    q: 'What does a technical due diligence checklist cover?',
    a: 'A thorough technical due diligence checklist covers security exposure (vulnerabilities, exposed secrets), dependency and license compliance, test coverage and code quality, architecture consistency, and talent concentration risk. audit/bench’s report covers all five, plus a remediation cost estimate your IC can act on.',
  },
  {
    q: 'How much does technical due diligence cost?',
    a: 'Traditional consultant-led technical due diligence typically runs $50,000+ for a 2–3 week engagement, which is why it usually only happens on the largest deals. audit/bench prices it per engagement instead: $5,000 for a fast screening read, $12,000–$20,000 for a full report.',
  },
  {
    q: 'How long does technical due diligence take?',
    a: 'A traditional consultant engagement takes roughly 1–2 months once it moves past the LOI, including 2–3 weeks just to staff and start. audit/bench delivers a screening-tier read in 3–5 business days and a full report in 1–2 weeks, since the review runs automatically instead of waiting on contractor availability.',
  },
  {
    q: 'Do I need technical due diligence on a mid-market or small acquisition?',
    a: 'Yes — hidden security debt, single-developer dependency risk, and unmaintainable architecture don’t show up in a financial model regardless of deal size; they show up in the first 90 days of ownership. Mid-market deals skip technical diligence today mainly because a $50,000+ consultant audit doesn’t pencil out, not because the risk is smaller.',
  },
  {
    q: 'What is the difference between AI-powered and traditional technical due diligence?',
    a: 'Traditional technical due diligence is a manual engineering review staffed by consultants over 2–3 weeks. AI-powered technical due diligence — like audit/bench — runs an LLM-plus-static-analysis engine directly against the target’s repository, producing a comparable report in days at a fraction of the cost, using the same underlying signals: code, dependencies, commit history, and test coverage.',
  },
  {
    q: 'What red flags does a technical due diligence report typically uncover?',
    a: 'Common findings include unpatched critical vulnerabilities, copyleft (GPL/AGPL) dependencies in an otherwise proprietary codebase, a single developer responsible for most commits in a core module (bus-factor risk), thin test coverage on revenue-critical code paths, and inconsistent architecture suggesting ad-hoc development.',
  },
];

const DUE_DILIGENCE_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const DUE_DILIGENCE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Technical due diligence',
  provider: { '@type': 'Organization', name: 'Audit Bench Ai', url: SITE_URL },
  areaServed: 'Worldwide',
  description:
    'Technical due diligence for M&A and investment: security exposure, technical debt, talent concentration risk, architecture scalability, and remediation cost estimates.',
  offers: [
    { '@type': 'Offer', name: 'Investment Screening', price: '5000', priceCurrency: 'USD' },
    { '@type': 'Offer', name: 'Full Technical Diligence', priceSpecification: { '@type': 'PriceSpecification', minPrice: '12000', maxPrice: '20000', priceCurrency: 'USD' } },
  ],
};

export default function DueDiligencePage() {
  return (
    <div>
      <StructuredData data={[DUE_DILIGENCE_SCHEMA, DUE_DILIGENCE_FAQ_SCHEMA]} />

      {/* Hero */}
      <section className="border-b border-ink-line bg-ink px-6 py-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            For Investors &amp; M&amp;A
          </div>
          <h1 className="mb-4 text-4xl leading-tight font-bold text-[#E8ECF4] sm:text-5xl">
            Technical Due Diligence in Days, Not Weeks.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-on-ink">
            audit/bench scans target codebases for security risk, technical debt, and talent
            concentration — turning a 3-week consultant engagement into a report you can act on
            before your next IC meeting.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/audit-bench-sample-tdd-report.pdf"
              className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
            >
              Request a Sample Report
            </a>
            <a
              href="mailto:noumanqureshi15@gmail.com?subject=Technical%20due%20diligence%20inquiry"
              className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
            >
              Talk to Us About a Deal
            </a>
          </div>
        </Reveal>
      </section>

      {/* Problem */}
      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-3xl">
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
            The problem
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[#1C2128]">Your deal team is flying blind on the codebase.</h2>
          <p className="mb-4 text-sm leading-relaxed text-[#1C2128]">
            Every acquisition or investment in a software company comes with the same unanswered
            question: is the tech actually worth what&apos;s being claimed? Traditional technical due
            diligence means flying in consultants for 2–3 weeks, at a cost that only makes sense
            for the largest deals — leaving mid-market transactions to skip technical review
            entirely, or rely on a founder&apos;s word.
          </p>
          <p className="text-sm leading-relaxed text-[#1C2128]">
            That gap is where deals go wrong. Hidden security vulnerabilities, single-developer
            dependency risk, and unmaintainable architecture don&apos;t show up in a financial model
            — but they show up in your first 90 days of ownership.
          </p>
        </Reveal>
      </section>

      {/* What we do */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
              What we do
            </div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">A risk report, not a bug list.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-on-ink">
              We scan the full target codebase using the same LLM + static analysis engine that
              reviews production pull requests for engineering teams — pointed instead at the
              entirety of a company you&apos;re about to acquire. Every finding is tied to a business
              impact, not just a technical description, so it&apos;s usable directly in your investment
              committee memo or deal terms negotiation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-ink-line bg-ink-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <h3 className="mb-2 text-sm font-bold text-[#E8ECF4]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{item.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
              How it works
            </div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">What actually happens inside one scan.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-on-ink">
              No black box — here&apos;s the real pipeline, in the order it runs.{' '}
              <Link href="/services" className="text-cobalt hover:underline">
                See the full engine methodology →
              </Link>
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.stage}
                className="rounded-lg border border-ink-line bg-ink-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <div className="mb-2 font-mono text-[11px] text-cobalt">{s.stage}</div>
                <h3 className="mb-2 text-sm font-bold text-[#E8ECF4]">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{s.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Tiers / pricing */}
      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
              Engagement &amp; pricing
            </div>
            <h2 className="text-2xl font-bold text-[#1C2128]">Engage at the stage that fits your process.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-on-paper">
              Priced per engagement, not as a monthly seat — pay once for the report you need on the
              deal in front of you.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-panel ${
                  tier.featured
                    ? 'border-cobalt bg-paper-card ring-1 ring-cobalt/30'
                    : 'border-paper-line bg-paper-card hover:border-cobalt/40'
                }`}
              >
                <div className="mb-1 font-mono text-xs font-bold tracking-wide text-muted-on-paper uppercase">
                  {tier.name}
                </div>
                <div className="mb-3 text-2xl font-bold text-[#1C2128]">{tier.price}</div>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-on-paper">{tier.detail}</p>
                <div className="border-t border-paper-line pt-3 text-xs font-semibold text-cobalt">
                  {tier.turnaround}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-on-paper">
            Per-engagement, invoiced once — this is a diligence report, not a subscription product.
          </p>
        </Reveal>
      </section>

      {/* Why audit/bench */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
              Why audit/bench
            </div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">Built for speed. Priced for the deal size that usually gets skipped.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-ink-line bg-ink-soft p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <h3 className="mb-2 text-sm font-bold text-[#E8ECF4]">
                  {item.href ? (
                    <Link href={item.href} className="hover:text-cobalt">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{item.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Sample report CTA */}
      <section className="bg-paper px-6 py-16 text-center">
        <Reveal className="mx-auto max-w-2xl">
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
            Sample report
          </div>
          <h2 className="mb-4 text-2xl font-bold text-[#1C2128]">See it before you need it.</h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-on-paper">
            Download a redacted sample report to see exactly what your investment committee would
            receive — findings, risk ratings, and remediation estimates, laid out the way your
            team already reviews deals.
          </p>
          <a
            href="/audit-bench-sample-tdd-report.pdf"
            className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
          >
            Download Sample Report (PDF)
          </a>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="border-t border-ink-line bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">FAQ</div>
            <h2 className="text-2xl font-bold text-[#E8ECF4]">Questions deal teams ask before they engage</h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-lg border border-ink-line bg-ink-soft p-5">
                <h3 className="mb-1.5 text-sm font-bold text-[#E8ECF4]">{item.q}</h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{item.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-ink-line bg-ink px-6 py-16 text-center">
        <Reveal>
          <h2 className="mb-3 text-2xl font-bold text-[#E8ECF4]">Have a deal in diligence right now?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
            Send us repo access under NDA and get a screening-tier report back within 5 business days.
          </p>
          <a
            href="mailto:noumanqureshi15@gmail.com?subject=Technical%20screening%20request"
            className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
          >
            Start a Technical Screening
          </a>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
