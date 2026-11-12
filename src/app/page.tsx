import type { Metadata } from "next";
import Link from "next/link";
import { siBitbucket, siGithub, siGitlab } from "simple-icons";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/gsap/ScrollReveal";
import { TextReveal } from "@/components/gsap/TextReveal";
import { LogoMark } from "@/components/Logo";
import { StructuredData } from "@/components/StructuredData";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} — AI code review. Build fast, check what ships.`,
  },
  description:
    "AI code review for people building with AI. Find security gaps, logic bugs and code that needs another look — in a single file, a pull request or a whole repository.",
  keywords: [
    "AI code review",
    "auditbench",
    "audit bench",
    "secure code review checklist",
    "secure coding checklist",
    "audit ai code",
    "ai code audit",
    "ai code security checklist",
    "ai audit for code quality",
    "pull request approval",
    "ai code review tools for large codebases",
    "ai code quality checker",
    "ai audit pricing",
    "building and evaluating alignment auditing agents",
    "align auditor",
    "owasp top 10",
  ],
  alternates: { canonical: "/" },
};

const PLATFORMS = [
  { label: "GitHub", icon: siGithub, href: "/docs" },
  { label: "GitLab", icon: siGitlab, href: "/docs" },
  { label: "Bitbucket", icon: siBitbucket, href: "/docs" },
];

// Each lens lists what the engine actually looks for — kept in step with the
// backend: secrets-scanner.ts, stage1 risk-scorer / pattern-check / eslint,
// dependency-audit, license-audit, dependency-graph, test-coverage, and the
// Stage 2 review rules in focused-prompt.ts.
const LENSES = [
  {
    title: "Security",
    body: "Find exposed secrets, missing access checks and patterns that put data at risk.",
    checks: [
      "Exposed secrets: AWS, Stripe, GitHub, Slack, Shopify and Azure keys, private keys, database passwords",
      "Endpoints anyone can call, with no login or permission check",
      "SQL and shell commands built from user input",
      "Raw HTML, eval() and other ways untrusted input can run as code",
      "Unsafe deserialization, disabled certificate checks, MD5 and SHA-1 hashing",
      "Dependencies with known vulnerabilities, via npm audit and OSV.dev",
    ],
    example: "A valid invoice ID is not an ownership check.",
    method: "Secret scanner · Pattern rules · Dependency audit · AI review",
  },
  {
    title: "Logic",
    body: "Look for edge cases and broken assumptions, beyond whether the code compiles.",
    checks: [
      "Empty, zero, negative and very large inputs",
      "Money, account and password flows: who can call them, and what stops abuse",
      "Errors caught and silently ignored",
      "Unreachable code, always-true conditions and missing breaks",
      "Model output shown to users as if it were verified fact",
    ],
    example: "What happens when the last page has no results?",
    method: "Pattern rules · Lint checks · AI review",
  },
  {
    title: "Performance",
    body: "Spot expensive operations and patterns that can slow down as your app grows.",
    checks: [
      "The most complex functions, reviewed first",
      "Expensive work repeated inside loops and request handlers",
      "Connections, files and memory that are never released",
      "Concurrent calls that can overwrite each other’s work",
    ],
    example: "One request should not become a hundred queries.",
    method: "Complexity scoring · AI review",
  },
  {
    title: "Architecture",
    body: "Review dependencies, structure and framework use before small shortcuts spread.",
    checks: [
      "How consistent the codebase’s conventions are, scored 0 to 100",
      "Circular imports between modules",
      "Duplicated blocks and files nothing imports",
      "Framework misuse across 11+ frameworks, from Next.js to Spring Boot",
      "Copyleft licences (GPL, AGPL) inside a closed-source product",
    ],
    example: "Keep a change in one module from breaking another.",
    method:
      "Dependency graph · Duplication and dead-code scan · License audit · AI review",
  },
  {
    title: "Testing",
    body: "See where important behaviour needs coverage, including the cases that are easy to miss.",
    checks: [
      "Which source files have no tests at all",
      "Payment and login branches with no visible test",
      "Assertions that can pass for the wrong reason",
      "Mocks that return the very value being checked",
      "Changed behaviour with no error or negative case",
    ],
    example: "Test the failed payment, too.",
    method: "Coverage map · AI review",
  },
];

const STEPS = [
  {
    label: "01 / Review",
    title: "Bring the code.",
    body: "A file, a pull request or a whole repository. Start with the code you want to check.",
  },
  {
    label: "02 / Understand",
    title: "See what needs work.",
    body: "Get findings in context, with the issue and a suggested next step.",
  },
  {
    label: "03 / Recheck",
    title: "Fix. Review again.",
    body: "Make the change, then re-audit before you commit. You decide what ships.",
  },
];

const HOMEPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "AI code review for people building with AI: security gaps, logic bugs, performance, architecture and testing — in a file, a pull request or a whole repository.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "29", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "Custom",
      priceCurrency: "USD",
    },
  ],
};

const SHELL = "mx-auto w-full max-w-[1600px] px-[18px] sm:px-7 lg:px-12";
const DISPLAY = "font-light leading-[1.03] tracking-[-0.035em]";

export default function HomePage() {
  return (
    <div className="bg-ink text-white">
      <StructuredData data={HOMEPAGE_SCHEMA} />

      {/* Hero — mesh art panel beside the headline (copy first on mobile). */}
      <div className={`${SHELL} pt-2`}>
        <section className="grid overflow-hidden rounded-2xl bg-black md:min-h-[600px] md:grid-cols-2 md:rounded-[20px]">
          <div className="hero-art-enter relative order-2 m-2 min-h-[370px] overflow-hidden rounded-[14px] md:order-1 md:m-2.5 md:min-h-[560px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative brand texture, already compressed WebP */}
            <img
              src="/brand/mesh-dusk.webp"
              alt="A flowing purple mesh with a bright orange and warm yellow edge"
              width={1536}
              height={1024}
              className="mesh-drift absolute inset-0 h-full w-full object-cover object-[55%_50%]"
            />
            <LogoMark className="absolute top-7 left-6 w-[50px] text-white md:top-10 md:left-9 md:w-[66px]" />
            <span className="absolute top-[30px] right-6 text-[11px] tracking-[0.08em] md:top-[43px] md:right-8"></span>
            <p className="absolute bottom-7 left-6 flex flex-col text-2xl leading-[1.18] tracking-[-0.03em] md:bottom-10 md:left-9 md:text-[clamp(21px,2.1vw,33px)]">
              <span>Made at your pace.</span>
              <span>Reviewed before release.</span>
            </p>
          </div>

          <div className="hero-rise order-1 flex flex-col justify-center px-6 pt-11 pb-10 md:order-2 md:py-16 md:pr-10 md:pl-12">
            <h1
              className={`mb-6 text-[clamp(36px,8.8vw,58px)] md:mb-7 md:text-[clamp(42px,4.5vw,72px)] ${DISPLAY}`}
            >
              Build fast.
              <br />
              Check what ships.
            </h1>
            <p className="mb-7 max-w-[40ch] text-lg leading-normal text-[#c4c4c4] md:mb-9 md:text-xl">
              Find security gaps, logic bugs and code that needs another look.
              Keep building with AI.
            </p>
            <div className="flex flex-wrap items-center gap-5 md:gap-6">
              <Link
                href="/scan"
                className="btn-brand min-h-[49px] gap-6 px-5 text-sm md:min-h-[54px] md:gap-8 md:px-6 md:text-base"
              >
                Scan a public repo <span aria-hidden="true">↗</span>
              </Link>
              <a
                href="#review"
                className="flex gap-4 text-sm hover:underline hover:underline-offset-[5px] md:text-[15px]"
              >
                See the review <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* Where it works */}
        <section>
          <ScrollReveal
            stagger
            y={16}
            className="flex flex-col items-start gap-6 border-b border-ink-line py-8 md:flex-row md:items-center md:justify-between md:py-10"
          >
            <p className="text-base leading-snug text-muted-on-ink md:text-[17px]">
              Human-written. AI-generated.
              <br />
              All code deserves a second look.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 md:gap-8">
              {PLATFORMS.map((p) => (
                <Link
                  key={p.label}
                  href={p.href}
                  className="inline-flex min-h-11 items-center gap-2.5 text-[15px] text-[#dddddd] hover:text-white hover:underline hover:underline-offset-[5px] md:text-base"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-5 w-5 md:h-[22px] md:w-[22px]"
                  >
                    <path d={p.icon.path} />
                  </svg>
                  {p.label}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Review lenses */}
        <section
          id="review"
          className="grid scroll-mt-6 gap-5 py-[60px] md:grid-cols-[0.9fr_1.1fr] md:gap-[50px] md:pt-[84px] md:pb-[100px] lg:gap-[100px]"
        >
          <div>
            <h2
              className={`mb-[22px] text-[clamp(36px,8.5vw,48px)] md:text-[clamp(38px,4.1vw,60px)] ${DISPLAY}`}
            >
              <TextReveal>Beyond</TextReveal>
              <br />
              <TextReveal delay={120}>the syntax.</TextReveal>
            </h2>
            <ScrollReveal delay={250} y={16}>
              <p className="mb-7 text-[19px] leading-[1.45] text-[#aaaaaa] md:mt-[30px] md:text-xl">
                Five review lenses.
                <br />
                One clearer view of your code.
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal stagger y={18}>
            {LENSES.map((lens, i) => (
              // A shared name makes the browser keep one lens open at a time.
              <details
                key={lens.title}
                name="review-lenses"
                open={i === 0}
                className="group border-b border-ink-line first:border-t"
              >
                <summary className="lens-summary flex cursor-pointer list-none items-center gap-[18px] px-2.5 py-6 text-[25px] tracking-[-0.02em] md:gap-[25px] md:px-4 md:py-[27px] md:text-[26px] [&::-webkit-details-marker]:hidden">
                  <span className="lens-number min-w-7 text-xs tracking-normal text-[#aaaaaa]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {lens.title}
                  <span
                    aria-hidden="true"
                    className="ml-auto text-[26px] font-light transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="max-w-[640px] pt-[22px] pr-2.5 pb-[30px] pl-[53px] md:pr-9 md:pl-[69px]">
                  <p className="text-lg leading-normal text-[#aaaaaa]">
                    {lens.body}
                  </p>
                  <div className="mt-6 text-[11px] font-medium tracking-[0.09em] text-[#888888] uppercase">
                    What Audit Bench Ai looks for
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {lens.checks.map((check) => (
                      <li
                        key={check}
                        className="flex gap-3 text-[15px] leading-snug text-[#dddddd]"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          className="mt-[3px] h-3.5 w-3.5 shrink-0 fill-none stroke-white stroke-[1.6]"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2.5 8.5l3 3 8-8" />
                        </svg>
                        {check}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-l border-[#777777] pl-[17px] text-base">
                    {lens.example}
                  </p>
                  <p className="mt-5 text-xs text-[#888888]">{lens.method}</p>
                </div>
              </details>
            ))}
          </ScrollReveal>
        </section>

        {/* How it works — a quiet monochrome panel */}
        <section
          id="workflow"
          className="mb-[60px] scroll-mt-6 rounded-[14px] bg-white px-[25px] py-[30px] text-black md:mb-[100px] md:p-12"
        >
          <h2
            className={`max-w-[700px] text-[clamp(36px,8.5vw,48px)] md:text-[clamp(38px,4.1vw,60px)] ${DISPLAY}`}
          >
            <TextReveal>A second look.</TextReveal>
            <br />
            <TextReveal delay={120}>Then back to it.</TextReveal>
          </h2>
          <ScrollReveal
            stagger
            y={20}
            className="mt-8 grid md:mt-11 md:grid-cols-3 md:gap-10"
          >
            {STEPS.map((s) => (
              <article
                key={s.label}
                className="py-[26px] md:border-t md:border-[#d0d0d0] md:pt-7 md:pb-0"
              >
                <span className="text-xs font-medium tracking-[0.06em] text-[#555555] uppercase">
                  {s.label}
                </span>
                <h3 className="mt-4 mb-3 text-[26px] tracking-[-0.025em] md:mt-[23px]">
                  {s.title}
                </h3>
                <p className="max-w-[310px] text-lg leading-normal text-[#444444] md:text-[17px]">
                  {s.body}
                </p>
              </article>
            ))}
          </ScrollReveal>
        </section>

        {/* Closing */}
        <section className="relative min-h-[420px] overflow-hidden rounded-[14px] border border-ink-line bg-black px-[25px] py-9 md:min-h-[440px] md:p-[60px]">
          <div
            aria-hidden="true"
            className="field-drift pointer-events-none absolute top-5 -right-[420px] h-[650px] w-[650px] -rotate-[10deg] bg-[url('/brand/review-field.svg')] bg-cover bg-center opacity-45 [mask-image:linear-gradient(90deg,transparent,#000_70%)] md:-top-[60px] md:-right-[300px] md:h-[800px] md:w-[800px] md:opacity-75 xl:-right-[145px]"
          />
          <h2
            className={`relative mb-[30px] text-[clamp(36px,8.5vw,48px)] md:mb-8 md:text-[clamp(38px,4.1vw,60px)] ${DISPLAY}`}
          >
            <TextReveal>Give the code</TextReveal>
            <br />
            <TextReveal delay={120}>a second look.</TextReveal>
          </h2>
          <ScrollReveal delay={300} y={16} className="relative">
            <Link
              href="/scan"
              className="btn-brand min-h-[49px] gap-6 px-5 text-sm md:min-h-[54px] md:gap-8 md:px-6 md:text-base"
            >
              Scan a public repo <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-4 text-[13px] text-[#aaaaaa]">
              Public GitHub repos. No sign-up.
            </p>
          </ScrollReveal>
        </section>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
