import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { StructuredData } from '@/components/StructuredData';
import { CopySnippet } from '@/components/blog/CopySnippet';
import { BLOG_POSTS } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { BEYOND_CODE_CHECKLIST, TDD_CHECKLIST, type TddChecklistArea } from '@/lib/tddChecklist';

const POST = BLOG_POSTS.find((p) => p.slug === 'technical-due-diligence-checklist')!;
const POST_URL = `${SITE_URL}/blog/${POST.slug}`;
const TEMPLATE_URL = '/downloads/technical-due-diligence-checklist.csv';
const SAMPLE_REPORT_URL = '/audit-bench-sample-tdd-report.pdf';
const countChecks = (a: TddChecklistArea) => a.domains.reduce((n, d) => n + d.checks.length, 0);
// TOTAL is the code-level catalog Audit Bench automates; BEYOND covers infrastructure, compliance, IP and roadmap.
const TOTAL = TDD_CHECKLIST.reduce((n, a) => n + countChecks(a), 0);
const BEYOND = countChecks(BEYOND_CODE_CHECKLIST);
const ALL = TOTAL + BEYOND;
const ALL_AREAS = [...TDD_CHECKLIST, BEYOND_CODE_CHECKLIST];

// The root template appends "· Audit Bench Ai", which pushes this title well
// past the ~60 characters Google shows and truncates the "+ Template" hook —
// so the search title is set absolutely and kept keyword-first.
const SEARCH_TITLE = `Technical Due Diligence Checklist 2026: ${ALL} Checks + Template`;

export const metadata: Metadata = {
  title: { absolute: SEARCH_TITLE },
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
  openGraph: {
    title: SEARCH_TITLE,
    description: POST.description,
    type: 'article',
    url: POST_URL,
    publishedTime: POST.publishedAt,
    modifiedTime: POST.updatedAt,
  },
  twitter: { card: 'summary_large_image', title: SEARCH_TITLE, description: POST.description },
};

const FAQ = [
  {
    q: 'What is a technical due diligence checklist?',
    a: 'A list of the checks an investor or acquirer runs on a target company’s software before a deal: security exposure, dependency and license risk, technical debt, architecture and scalability, engineering practices, team risk, and the questions beyond the code such as infrastructure, compliance and IP ownership. Each failed check becomes a finding with a severity and a cost to fix.',
  },
  {
    q: 'How long does technical due diligence take?',
    a: 'A traditional manual review takes two to six weeks. With automated scanning of the codebase, a screening-level review takes three to five business days, and a full review with interviews one to two weeks. Most of the calendar time is getting access and scheduling interviews, not analysis.',
  },
  {
    q: 'Who should do technical due diligence?',
    a: 'Someone independent of the target who can read code and judge architecture: an external technical due diligence firm, an operating partner with an engineering background, or an automated review tool combined with a short expert interview. The target’s own team should not grade itself.',
  },
  {
    q: 'What documents should I request from the target company?',
    a: 'Read-only access to all source repositories, an architecture overview, the list of third-party services and their costs, the incident history for the last year, the org chart for engineering, and any previous penetration test or security audit reports.',
  },
  {
    q: 'What are the biggest red flags in technical due diligence?',
    a: 'Live secrets in the code, strong-copyleft (GPL/AGPL) code inside a proprietary product, almost no automated tests around payments or authentication, and one engineer who wrote most of the code and is not committed to stay after the deal.',
  },
  {
    q: 'Is technology due diligence the same as technical due diligence?',
    a: 'Yes. Technical, technology, tech and engineering due diligence all describe the same review of a target’s software, infrastructure, security and engineering team. Some firms use “technology due diligence” for a wider scope that includes IT systems and vendors, which the beyond-the-code checks in this list cover.',
  },
  {
    q: 'Is there a free technical due diligence template?',
    a: 'Yes. The spreadsheet linked on this page has every check in this checklist as one row, with what to look at, the red flag, the severity, and empty columns for status, evidence and engineer-days to fix. It opens in Excel, Google Sheets or Numbers.',
  },
  {
    q: 'Can technical due diligence be automated?',
    a: 'Most of the code-level checks can: secrets, vulnerable dependencies, licenses, complexity, duplication, test coverage and commit history. Questions about the roadmap, hiring and the deal thesis still need a conversation with the team.',
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

const SEVERITY_STYLE: Record<string, string> = {
  critical: 'bg-critical text-white',
  high: 'bg-high text-white',
  medium: 'bg-medium text-white',
  low: 'bg-low text-white',
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function DownloadBox() {
  return (
    <div className="not-prose my-8 rounded-xl border border-cobalt/40 bg-cobalt/5 p-5">
      <div className="text-base font-bold text-[#1C2128]">Free template: all {ALL} checks in a spreadsheet</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-on-paper">
        One row per check with what to look at, the red flag, severity, and empty columns for status, evidence and
        engineer-days to fix. Opens in Excel, Google Sheets or Numbers.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={TEMPLATE_URL}
          download
          className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white no-underline hover:bg-cobalt-dark"
        >
          Download the checklist (CSV)
        </a>
        <Link
          href="/signup"
          className="rounded-lg border border-paper-line bg-paper-card px-4 py-2 text-sm font-bold text-[#1C2128] no-underline hover:border-cobalt/40"
        >
          Run the {TOTAL} code checks automatically
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-on-paper">
        No account yet? <Link href="/scan">Scan a public GitHub repo free</Link> and see the checks in action first.
      </p>
    </div>
  );
}

function AutomateCallout() {
  return (
    <div className="not-prose my-8 rounded-xl border border-ink-line bg-ink p-6">
      <div className="font-mono text-[11px] font-bold tracking-[0.12em] text-cobalt uppercase">
        Skip the manual pass
      </div>
      <div className="mt-2 text-lg leading-snug font-bold text-[#E8ECF4]">
        {TOTAL} of these {ALL} checks run automatically on a repo — every finding priced in engineer-days.
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-on-ink">
        Connect GitHub or GitLab, or upload a .zip. Secrets, vulnerable dependencies, licenses, complexity, test coverage
        and commit-history risk come back as one report you can hand to the deal team.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark"
        >
          Start free — no credit card
        </Link>
        <a
          href={SAMPLE_REPORT_URL}
          className="rounded-lg border border-ink-line px-4 py-2 text-sm font-bold text-muted-on-ink hover:border-cobalt/40 hover:text-[#E8ECF4]"
        >
          See a sample report (PDF)
        </a>
      </div>
    </div>
  );
}

function AreaAutomationStrip({ area }: { area: TddChecklistArea }) {
  return (
    <div className="not-prose my-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cobalt/30 bg-cobalt/5 px-4 py-3">
      <span className="text-sm text-[#1C2128]">
        <span className="font-semibold">All {countChecks(area)} checks above run automatically</span> in {SITE_NAME}.
      </span>
      <Link href="/signup" className="text-sm font-bold whitespace-nowrap text-cobalt no-underline hover:underline">
        Run them on your repo free →
      </Link>
    </div>
  );
}

function AreaSection({ area, index, automated }: { area: TddChecklistArea; index: number; automated: boolean }) {
  return (
    <section>
      <h2 id={slugify(area.name)}>
        {index}. {area.name} checklist
      </h2>
      <p>{area.why}</p>
      {area.domains.map((d) => (
        <div key={d.name}>
          <h3>{d.name}</h3>
          <ul className="not-prose my-4 space-y-3">
            {d.checks.map((c) => (
              <li key={c.check} className="rounded-lg border border-paper-line bg-paper-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-4 w-4 shrink-0 rounded border-2 border-muted-on-paper"
                  />
                  <span className="font-semibold text-[#1C2128]">{c.check}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {automated && (
                      <span className="rounded border border-cobalt/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cobalt uppercase">
                        Automated
                      </span>
                    )}
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${SEVERITY_STYLE[c.severity]}`}
                    >
                      {c.severity}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#1C2128]">
                  <span className="font-semibold">What to look at: </span>
                  {c.lookFor}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#1C2128]">
                  <span className="font-semibold text-critical">Red flag: </span>
                  {c.redFlag}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {automated && <AreaAutomationStrip area={area} />}
    </section>
  );
}

const CITATION_HTML = `<a href="${POST_URL}">Technical Due Diligence Checklist</a> (${ALL} checks) by ${SITE_NAME}`;

export default function TechnicalDueDiligenceChecklistPage() {
  return (
    <BlogArticleLayout
      slug={POST.slug}
      title={POST.title}
      publishedAt={POST.publishedAt}
      updatedAt={POST.updatedAt}
      readingTime={POST.readingTime}
      image={POST.image}
    >
      <StructuredData data={FAQ_SCHEMA} />

      <p>
        <strong>A technical due diligence checklist</strong> is the list of checks an investor or acquirer runs on a
        target company’s software before signing. This one has <strong>{ALL} checks</strong> in{' '}
        <strong>7 risk areas</strong>: {TOTAL} code-level checks across security exposure, dependency and license risk,
        technical debt, architecture and scalability, engineering practices, and team and knowledge risk, plus {BEYOND}{' '}
        checks <a href="#beyond-the-code">beyond the code</a> covering infrastructure, compliance, IP ownership and the
        roadmap. Each check says what to look at and what a red flag looks like, so a failed check turns straight into a
        finding you can price.
      </p>

      <AutomateCallout />

      <h2>The {ALL} checks at a glance</h2>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-[#1C2128]">
              <th className="py-2 pr-4 font-bold text-[#1C2128]">Risk area</th>
              <th className="py-2 pr-4 font-bold text-[#1C2128]">Domains</th>
              <th className="py-2 text-right font-bold text-[#1C2128]">Checks</th>
            </tr>
          </thead>
          <tbody>
            {ALL_AREAS.map((a) => (
              <tr key={a.name} className="border-b border-paper-line">
                <td className="py-2 pr-4 align-top">
                  <a href={`#${slugify(a.name)}`} className="font-semibold text-cobalt">
                    {a.name}
                  </a>
                </td>
                <td className="py-2 pr-4 align-top text-muted-on-paper">{a.domains.map((d) => d.name).join(', ')}</td>
                <td className="py-2 text-right align-top font-mono text-[#1C2128]">{countChecks(a)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Free technical due diligence checklist template</h2>
      <p>
        Prefer a spreadsheet? The tech due diligence template below has every check as a row, ready to fill in during
        the review and share with the deal team.
      </p>
      <DownloadBox />

      <h2>How to use this tech due diligence checklist</h2>
      <ol>
        <li>
          <strong>Get read-only access first.</strong> The code-level checks are answered from the code, the git
          history or the build, not from a questionnaire the target fills in about itself.
        </li>
        <li>
          <strong>Mark each check Pass, Fail or N/A.</strong> A check you couldn’t assess is N/A, never a pass. Say so
          in the report, so nobody reads silence as a clean result.
        </li>
        <li>
          <strong>Record the evidence.</strong> For every failure, write down the file, package or person it comes from.
          Findings without evidence get argued away in negotiation.
        </li>
        <li>
          <strong>Price the failures.</strong> Estimate engineer-days to fix each one and multiply by a blended day
          rate. That number is what belongs in the valuation conversation.
        </li>
        <li>
          <strong>Split by timing.</strong> Decide what must be fixed before close (live secrets, exploitable
          vulnerabilities, license problems, missing IP assignments) and what goes into the 30- and 90-day plan.
        </li>
      </ol>

      {ALL_AREAS.map((area, ai) => (
        <AreaSection key={area.name} area={area} index={ai + 1} automated={area !== BEYOND_CODE_CHECKLIST} />
      ))}

      <h2>What to request from the target before you start</h2>
      <ul>
        <li>Read-only access to every source repository, including infrastructure and mobile apps.</li>
        <li>An architecture diagram, or a one-hour walkthrough with the tech lead if none exists.</li>
        <li>The list of third-party services, what each is used for, and the monthly cost.</li>
        <li>Incident and outage history for the last 12 months, with postmortems if they exist.</li>
        <li>The engineering org chart, tenure, and who owns which systems.</li>
        <li>Previous penetration tests, security audits or SOC 2 reports.</li>
      </ul>
      <p>
        For the interview side, use our list of{' '}
        <Link href="/blog/technical-due-diligence-questions">
          60 technical due diligence questions to ask the target
        </Link>
        .
      </p>

      <h2>How to score and price what you find</h2>
      <p>
        Give each failed check the severity shown above, then estimate the engineer-days to fix it. A single exposed
        secret is a few hours of rotation; missing tests across the product can be weeks. Multiply the total by a
        blended rate (for example $600 to $1,000 per engineer-day) to get a range you can put in front of the investment
        committee.
      </p>
      <ul>
        <li>
          <strong>Before close:</strong> live secrets, critical or high vulnerabilities, strong-copyleft licenses, missing IP
          assignments.
        </li>
        <li>
          <strong>First 30 days:</strong> vulnerable dependencies, debug settings, missing CI tests.
        </li>
        <li>
          <strong>First 90 days:</strong> test coverage, duplication, architecture clean-up.
        </li>
        <li>
          <strong>Deal terms, not engineering:</strong> key-person risk is handled with retention and handover periods,
          not engineer-days.
        </li>
      </ul>
      <p>
        See which findings actually change deals in{' '}
        <Link href="/blog/technical-due-diligence-red-flags">technical due diligence red flags that kill deals</Link>,
        and how sellers can get ready in{' '}
        <Link href="/blog/how-to-prepare-for-technical-due-diligence">how to prepare for technical due diligence</Link>.
      </p>

      <h2>Common mistakes</h2>
      <ul>
        <li>
          <strong>Trusting a questionnaire.</strong> The target’s own answers about its code are a starting point, not
          evidence.
        </li>
        <li>
          <strong>Counting “not checked” as “fine”.</strong> If a check couldn’t run (no git history, no lockfile), the
          report should say so.
        </li>
        <li>
          <strong>Reporting severity without cost.</strong> “High risk” doesn’t move a price; “18 engineer-days,
          $11K–$18K” does.
        </li>
        <li>
          <strong>Ignoring the team.</strong> A clean codebase that one person understands is still a risky acquisition.
        </li>
      </ul>

      <DownloadBox />

      <h2>Use or cite this checklist</h2>
      <p>
        The checklist and template are free to use in your own due diligence process, playbook or course material. If
        you reference it in an article, a fund’s operating guide or a deal memo template, please link back to this page
        so readers get the latest version.
      </p>
      <CopySnippet label="Link HTML" value={CITATION_HTML} />

      <h2>Technical due diligence checklist FAQ</h2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <div className="not-prose mt-10 rounded-xl border border-ink-line bg-ink p-6 text-center">
        <div className="text-xl font-bold text-[#E8ECF4]">Run the {TOTAL} code-level checks in minutes, not weeks</div>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-on-ink">
          {SITE_NAME} scans the target’s repositories, prices every finding in engineer-days, and gives you a report
          for the investment committee. Free to start, no credit card.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-cobalt px-5 py-2.5 text-sm font-bold text-white hover:bg-cobalt-dark"
          >
            Create a free account
          </Link>
          <Link
            href="/due-diligence"
            className="rounded-lg border border-ink-line px-5 py-2.5 text-sm font-bold text-muted-on-ink hover:border-cobalt/40 hover:text-[#E8ECF4]"
          >
            Need a full TDD report? →
          </Link>
        </div>
      </div>
    </BlogArticleLayout>
  );
}
