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
  ],
  alternates: { canonical: '/due-diligence' },
};

const WHAT_YOU_GET = [
  {
    title: 'Security exposure',
    detail: 'Vulnerabilities, exposed secrets, and compliance gaps in the target codebase.',
  },
  {
    title: 'Technical debt',
    detail: 'What it will actually cost to bring the codebase to a healthy engineering standard.',
  },
  {
    title: 'Talent concentration risk',
    detail: 'How dependent the codebase is on one or two developers, and where the bus factor is thin.',
  },
  {
    title: 'Architecture scalability',
    detail: 'Whether the current design holds up under the growth your model assumes.',
  },
  {
    title: 'Remediation estimate',
    detail: 'Engineer-months and rough cost to fix critical findings, in dollars your model can use.',
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
      <StructuredData data={[DUE_DILIGENCE_SCHEMA]} />

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
