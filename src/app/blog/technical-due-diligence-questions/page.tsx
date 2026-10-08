import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { StructuredData } from '@/components/StructuredData';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'technical-due-diligence-questions')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
  openGraph: { title: POST.title, description: POST.description, type: 'article' },
};

/** Each question with the reason it's worth asking — what a weak answer reveals. */
const SECTIONS: Array<{ title: string; intro: string; questions: Array<[string, string]> }> = [
  {
    title: 'Product and architecture',
    intro: 'Start here: you need a map of the system before any other answer makes sense.',
    questions: [
      [
        'Can you walk us through the architecture on one diagram?',
        'If nobody can draw it, nobody fully understands it.',
      ],
      [
        'Which parts of the system would you rebuild if you started today, and why?',
        'Honest teams know where the debt is; evasive answers are a signal.',
      ],
      [
        'What are the main services, and how do they talk to each other?',
        'Reveals hidden coupling and single points of failure.',
      ],
      [
        'Which third-party services is the product built on, and what happens if one goes away?',
        'Vendor lock-in and concentration risk the buyer inherits.',
      ],
      [
        'How is the database designed, and how are schema changes rolled out?',
        'Unversioned, irreversible migrations are a common source of outages.',
      ],
      [
        'What is the largest customer or data volume the system has handled?',
        'Tells you how far the deal thesis stretches current proof.',
      ],
      ['What would have to change to handle 10× today’s load?', 'Separates “add servers” from “rewrite the core”.'],
      [
        'Where is the code that handles money, permissions and customer data?',
        'The places where a bug costs the most deserve the deepest review.',
      ],
      [
        'How many repositories are there, and do we have access to all of them?',
        'Missing repos are where surprises hide.',
      ],
      [
        'What is planned on the technical roadmap for the next 12 months?',
        'Checks the roadmap against the team and budget that actually exist.',
      ],
    ],
  },
  {
    title: 'Code quality and technical debt',
    intro: 'These questions pair with the code checks in the checklist; ask them, then verify in the code.',
    questions: [
      [
        'What share of the code is covered by automated tests, and which areas have none?',
        'Untested payment or auth code is a post-close incident waiting to happen.',
      ],
      [
        'Does CI run the tests on every pull request and block merges on failure?',
        'A pipeline that exists but is ignored protects nothing.',
      ],
      [
        'How do code reviews work, and can anyone merge without one?',
        'Self-merged changes to production are a governance gap.',
      ],
      [
        'Which parts of the codebase do engineers avoid changing?',
        'Those are the expensive parts to maintain after the deal.',
      ],
      [
        'How much of the code was generated with AI tools, and how is it reviewed?',
        'Unreviewed generated code tends to duplicate logic and skip edge cases.',
      ],
      [
        'How do you track technical debt, and how much time goes to paying it down?',
        'Zero time on debt means it compounds into the buyer’s problem.',
      ],
      [
        'When did you last upgrade the language runtime and major frameworks?',
        'End-of-life runtimes stop getting security patches.',
      ],
      [
        'Is there dead code, duplicated logic or abandoned features still deployed?',
        'Inflates the codebase the buyer is paying for.',
      ],
      [
        'How long does it take a new engineer to ship their first change?',
        'Onboarding time is a direct measure of maintainability.',
      ],
      [
        'What would you fix first with an extra engineer for three months?',
        'Usually names the single biggest technical risk.',
      ],
    ],
  },
  {
    title: 'Security and compliance',
    intro: 'Security findings are the ones most likely to become conditions of close.',
    questions: [
      [
        'When was the last penetration test or security audit, and what did it find?',
        'Ask for the report and what was actually fixed.',
      ],
      [
        'Have you had a security incident or data breach? How was it handled?',
        'Undisclosed incidents are a legal risk, not just a technical one.',
      ],
      [
        'How are secrets and API keys stored and rotated?',
        'Keys in the repo or shared in chat are an immediate finding.',
      ],
      [
        'Who has production access today, and how is it removed when someone leaves?',
        'Former staff with live access is a common, serious gap.',
      ],
      ['How is customer data isolated between tenants?', 'One missing check can expose every customer’s data.'],
      [
        'Which compliance standards do you meet (SOC 2, ISO 27001, GDPR, HIPAA)?',
        'Promised certifications that don’t exist affect enterprise revenue.',
      ],
      [
        'How do you find and patch vulnerable dependencies?',
        'No process means a growing backlog of known vulnerabilities.',
      ],
      [
        'Is data encrypted in transit and at rest, including backups?',
        'Unencrypted backups are a quiet but serious exposure.',
      ],
      [
        'How is authentication implemented, and is it a known library or custom-built?',
        'Home-grown auth deserves a much closer look.',
      ],
      [
        'What logging exists, and could you tell who accessed a customer record last month?',
        'Without audit logs, a breach can’t be scoped.',
      ],
    ],
  },
  {
    title: 'Infrastructure and operations',
    intro: 'How the product runs day to day, and what it costs.',
    questions: [
      [
        'Where is the product hosted, and is the infrastructure defined as code?',
        'Hand-built infrastructure is hard to reproduce or hand over.',
      ],
      [
        'What is the monthly cloud bill, and how does it scale with customers?',
        'Costs that grow faster than revenue break the deal model.',
      ],
      ['How are backups taken, and when did you last test a restore?', 'An untested backup is not a backup.'],
      [
        'What uptime have you had over the last year, and what caused the biggest outages?',
        'Patterns in outages point to structural weaknesses.',
      ],
      [
        'How are deployments done, and how often? Can you roll back?',
        'Manual, rare deployments slow every future change.',
      ],
      ['Who is on call, and how are incidents detected?', 'If customers report outages first, monitoring is missing.'],
      [
        'Is there a disaster-recovery plan, and has it been rehearsed?',
        'A single region or database is a single point of failure.',
      ],
      [
        'Which environments exist (dev, staging, production), and how close is staging to production?',
        'Without real staging, every release is tested in production.',
      ],
    ],
  },
  {
    title: 'Team and process',
    intro: 'Key-person risk is the finding money can’t fix quickly.',
    questions: [
      [
        'Who wrote most of the code, and are they staying after the deal?',
        'One author with no retention plan is a bus factor of one.',
      ],
      ['Which systems does only one person understand?', 'Those need documentation and a handover before close.'],
      [
        'How many engineers are employees versus contractors or agencies?',
        'Contractor-built code may have IP and continuity gaps.',
      ],
      [
        'Who has left the engineering team in the last 12 months, and why?',
        'Recent senior departures often mean knowledge already left.',
      ],
      ['How is work planned and prioritised?', 'Shows whether delivery is predictable or reactive.'],
      [
        'What documentation exists for architecture, setup and runbooks?',
        'Missing docs make every post-close change slower.',
      ],
      ['How long would it take to replace your most senior engineer?', 'A direct estimate of key-person risk.'],
      ['What is the engineering hiring plan, and is it funded?', 'Roadmaps that depend on unfunded hires won’t ship.'],
      ['How are engineers paid and incentivised, including equity?', 'Vesting that ends at close is a retention risk.'],
      [
        'What do engineers say is the most frustrating part of working here?',
        'Often the most honest answer you get all day.',
      ],
    ],
  },
  {
    title: 'Intellectual property and open source',
    intro: 'Questions for the technical lead and counsel together.',
    questions: [
      [
        'Does the company own all of its code, including work by contractors?',
        'Missing IP assignments can cloud ownership.',
      ],
      [
        'Do you use any GPL or AGPL code, and how is it distributed?',
        'Strong copyleft can oblige publishing your own source.',
      ],
      ['Is there a list of open-source dependencies and their licenses?', 'No list usually means nobody has checked.'],
      ['Has any code been copied from previous employers or other projects?', 'Inherited code can carry legal claims.'],
      [
        'Are any core features built on another company’s API or model with restrictive terms?',
        'Terms can change, or forbid the buyer’s use case.',
      ],
      [
        'Are there patents, trademarks or pending disputes related to the product?',
        'Litigation risk belongs in the deal terms.',
      ],
    ],
  },
  {
    title: 'Data and privacy',
    intro: 'Where customer data lives and who can touch it.',
    questions: [
      ['What personal data do you store, and where?', 'Defines the privacy obligations the buyer takes on.'],
      [
        'Which regions is data stored in, and do any customers require residency?',
        'Contract terms can restrict migration plans.',
      ],
      ['How do you handle data deletion and export requests?', 'GDPR and CCPA obligations need a working process.'],
      ['Which third parties receive customer data?', 'Every sub-processor is a risk and a contract.'],
      [
        'Is production data ever copied to development or test environments?',
        'Real data in test systems is a common leak.',
      ],
      [
        'How long is data retained, and is retention enforced automatically?',
        'Keeping data forever increases breach impact.',
      ],
    ],
  },
];

const TOTAL = SECTIONS.reduce((n, s) => n + s.questions.length, 0);
/** Number of the first question in each section, so numbering runs 1–60 across sections. */
const STARTS = SECTIONS.map((_, i) => SECTIONS.slice(0, i).reduce((n, s) => n + s.questions.length, 0) + 1);

const FAQ = [
  {
    q: 'What questions should you ask in technical due diligence?',
    a: 'Ask about architecture and scalability, code quality and tests, security and compliance, infrastructure and costs, team and key-person risk, intellectual property and open-source licenses, and data and privacy. Then verify the answers against the code itself rather than relying on the responses alone.',
  },
  {
    q: 'Who should answer technical due diligence questions?',
    a: 'The CTO or head of engineering for architecture and roadmap, the engineers who own each system for the detail, and legal counsel together with the tech lead for intellectual property and licensing questions.',
  },
  {
    q: 'How do you verify the answers?',
    a: 'Read-only access to the repositories lets you check claims about tests, dependencies, secrets, licenses and who wrote the code. Automated scanning answers most code questions in hours; interviews cover what the code can’t show, like plans and hiring.',
  },
  {
    q: 'How many questions should a technical due diligence questionnaire have?',
    a: `Enough to cover each risk area without burying the team: this list has ${TOTAL}. For an early screening, pick the 15 to 20 most relevant to the deal thesis and verify the rest from the code.`,
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function TechnicalDueDiligenceQuestionsPage() {
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
        These are the <strong>{TOTAL} technical due diligence questions</strong> to ask a target company before an
        acquisition or investment, grouped into seven areas: product and architecture, code quality, security,
        infrastructure, team, intellectual property, and data and privacy. Each question comes with what a weak answer
        tells you. Ask them in interviews, then check the answers against the code with our{' '}
        <Link href="/blog/technical-due-diligence-checklist">technical due diligence checklist</Link>.
      </p>

      <h2>Questions by area</h2>
      <ul>
        {SECTIONS.map((s) => (
          <li key={s.title}>
            <a href={`#${slugify(s.title)}`}>{s.title}</a> ({s.questions.length} questions)
          </li>
        ))}
      </ul>

      {SECTIONS.map((s, si) => (
        <section key={s.title}>
          <h2 id={slugify(s.title)}>{s.title} questions</h2>
          <p>{s.intro}</p>
          <ol className="not-prose my-4 space-y-2.5">
            {s.questions.map(([q, why], qi) => {
              const n = STARTS[si] + qi;
              return (
                <li key={q} className="flex gap-3 rounded-lg border border-paper-line bg-paper-card p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C2128] font-mono text-[11px] font-bold text-white">
                    {n}
                  </span>
                  <div>
                    <div className="font-semibold text-[#1C2128]">{q}</div>
                    <div className="mt-0.5 text-sm text-muted-on-paper">{why}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <h2>How to run the interviews</h2>
      <ol>
        <li>
          <strong>Send the questions a few days ahead.</strong> You want considered answers, not improvisation.
        </li>
        <li>
          <strong>Get repository access before the interviews.</strong> Then you can ask about what you already found in
          the code instead of taking answers on trust.
        </li>
        <li>
          <strong>Talk to more than the CTO.</strong> The engineers who own each system give the most accurate detail.
        </li>
        <li>
          <strong>Write down every answer you can’t verify.</strong> Those become open items, warranties or conditions
          in the deal.
        </li>
      </ol>
      <p>
        Most code-level questions (tests, dependencies, secrets, licenses, who wrote the code) can be answered from the
        repository directly. See the{' '}
        <Link href="/blog/technical-due-diligence-red-flags">red flags that kill deals</Link> and{' '}
        <Link href="/blog/technical-due-diligence-timeline-explained">why due diligence now takes days, not weeks</Link>
        .
      </p>

      <h2>Technical due diligence questions FAQ</h2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <p>
        <Link href="/due-diligence" className="font-semibold">
          Get the code-level answers in days: see Audit Bench Ai technical due diligence →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
