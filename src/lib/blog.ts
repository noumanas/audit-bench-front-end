// Shared post registry — the single source of truth for what posts exist,
// used by both the /blog index and sitemap.ts. Each post's actual content
// lives in its own src/app/blog/<slug>/page.tsx (same one-folder-per-route
// convention as every other marketing page in this app), not here — this
// registry only carries what's needed to list/link to a post without
// importing its full page component.
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  readingTime: string;
  image?: string; // path under /public, e.g. /blog/<slug>.svg
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "what-to-do-when-github-is-down",
    title: "What to Do When GitHub Is Down",
    description:
      "A practical playbook for engineering teams when GitHub is down: what still works, what to communicate, and what to avoid doing.",
    publishedAt: "2026-08-18",
    readingTime: "8 min read",
    image: "/blog/what-to-do-when-github-is-down.svg",
  },
  {
    slug: "building-ci-cd-resilient-to-github-outages",
    title: "Building a CI/CD Pipeline That Survives a GitHub Outage",
    description:
      "A practical guide to decoupling build, test, and deploy from a single GitHub Actions dependency so a platform incident doesn't freeze every release.",
    publishedAt: "2026-08-18",
    readingTime: "8 min read",
    image: "/blog/building-ci-cd-resilient-to-github-outages.svg",
  },
  {
    slug: "github-outage-incident-response-runbook",
    title: "Writing a GitHub Outage Incident Response Runbook",
    description:
      "A guide to treating GitHub like any other critical dependency: severity tiers, escalation paths, and predefined fallback actions for when it goes down.",
    publishedAt: "2026-08-18",
    readingTime: "8 min read",
    image: "/blog/github-outage-incident-response-runbook.svg",
  },
  {
    slug: "reducing-single-points-of-failure-in-your-git-workflow",
    title: "Reducing Single Points of Failure in Your Git Workflow",
    description:
      "A practical look at mirroring repositories, decoupling identity, and keeping secrets independent so one vendor incident doesn't take down everything at once.",
    publishedAt: "2026-08-18",
    readingTime: "7 min read",
    image: "/blog/reducing-single-points-of-failure-in-your-git-workflow.svg",
  },
  {
    slug: "github-status-monitoring-for-engineering-teams",
    title: "Monitoring GitHub Status Without Getting Paged for Nothing",
    description:
      "How to size GitHub status alerts to actual impact, correlate outages with real symptoms, and route notifications to the right audience.",
    publishedAt: "2026-08-18",
    readingTime: "7 min read",
    image: "/blog/github-status-monitoring-for-engineering-teams.svg",
  },
  {
    slug: "reviewing-broken-access-control",
    title: "Reviewing Broken Access Control Before It Ships",
    description:
      "A practical guide to catching broken access control in code review: missing checks, IDOR, privilege escalation, and multi-tenant data leaks.",
    publishedAt: "2026-08-16",
    readingTime: "9 min read",
    image: "/blog/reviewing-broken-access-control.svg",
  },
  {
    slug: "sql-injection-code-review-guide",
    title: "How to Review Code for SQL Injection Risk",
    description:
      "A practical guide to spotting SQL injection risk in code review, from string-concatenated queries to ORM misuse and second-order injection.",
    publishedAt: "2026-08-16",
    readingTime: "8 min read",
    image: "/blog/sql-injection-code-review-guide.svg",
  },
  {
    slug: "secrets-and-api-keys-in-source-code",
    title: "How to Keep Secrets and API Keys Out of Source Code",
    description:
      "A practical guide to catching hardcoded secrets, leaked API keys, and unsafe credential handling during code review.",
    publishedAt: "2026-08-16",
    readingTime: "8 min read",
    image: "/blog/secrets-and-api-keys-in-source-code.svg",
  },
  {
    slug: "insecure-deserialization-code-review",
    title: "How to Detect Insecure Deserialization in Code Review",
    description:
      "A practical guide to spotting insecure deserialization risk in code review, including native deserializers, unsafe object mapping, and trust boundaries.",
    publishedAt: "2026-08-16",
    readingTime: "8 min read",
    image: "/blog/insecure-deserialization-code-review.svg",
  },
  {
    slug: "reviewing-rate-limiting-and-abuse-prevention",
    title: "Reviewing Rate Limiting and Abuse Prevention in Code",
    description:
      "A practical guide to reviewing rate limiting, brute-force protection, and abuse prevention logic so new endpoints don't become easy targets.",
    publishedAt: "2026-08-16",
    readingTime: "8 min read",
    image: "/blog/reviewing-rate-limiting-and-abuse-prevention.svg",
  },
  {
    slug: "how-to-review-database-migrations-safely",
    title: "How to Review Database Migrations Safely",
    description:
      "A practical guide to reviewing database migrations for locking risk, data integrity, rollback safety, and rolling-deploy compatibility before they run in production.",
    publishedAt: "2026-08-13",
    readingTime: "10 min read",
    image: "/blog/how-to-review-database-migrations-safely.svg",
  },
  {
    slug: "how-to-build-a-security-first-review-culture",
    title: "How to Build a Security-First Code Review Culture",
    description:
      "A long-form guide on creating review habits, team norms, and merge rules that make security part of everyday engineering.",
    publishedAt: "2026-08-13",
    readingTime: "12 min read",
  },
  {
    slug: "what-makes-an-ai-code-review-tool-trustworthy",
    title: "What Makes an AI Code Review Tool Trustworthy",
    description:
      "A deep look at the product, workflow, and security signals that matter when deciding whether to trust an AI review tool.",
    publishedAt: "2026-08-13",
    readingTime: "11 min read",
  },
  {
    slug: "how-to-review-generated-code-for-production-risk",
    title: "How to Review Generated Code for Production Risk",
    description:
      "A practical article on reviewing AI-generated code for hidden logic bugs, security issues, and production failure modes.",
    publishedAt: "2026-08-13",
    readingTime: "13 min read",
  },
  {
    slug: "security-review-patterns-for-large-codebases",
    title: "Security Review Patterns for Large Codebases",
    description:
      "A guide to scaling code security review across large repositories without losing context, speed, or quality.",
    publishedAt: "2026-08-13",
    readingTime: "12 min read",
  },
  {
    slug: "how-to-spot-risk-in-pull-request-diffs",
    title: "How to Spot Risk in Pull Request Diffs",
    description:
      "A detailed guide to reading diffs for hidden security, correctness, and maintenance risk before merging.",
    publishedAt: "2026-08-13",
    readingTime: "10 min read",
  },
  {
    slug: "how-to-review-security-critical-code-faster",
    title: "How to Review Security-Critical Code Faster",
    description:
      "A practical guide to speeding up security-focused code review without missing the issues that matter most.",
    publishedAt: "2026-08-11",
    readingTime: "8 min read",
  },
  {
    slug: "code-security-review-signals-that-matter",
    title: "Code Security Review Signals That Matter",
    description:
      "A focused look at the review signals that reliably point to real security risk in modern codebases.",
    publishedAt: "2026-08-11",
    readingTime: "7 min read",
  },
  {
    slug: "how-to-keep-ai-code-review-from-creating-noise",
    title: "How to Keep AI Code Review From Creating Noise",
    description:
      "A practical article on making AI review useful by reducing false positives, vague comments, and review fatigue.",
    publishedAt: "2026-08-11",
    readingTime: "8 min read",
  },
  {
    slug: "secure-code-review-for-api-changes",
    title: "Secure Code Review for API Changes",
    description:
      "A guide to reviewing API changes for authentication, authorization, validation, and data exposure risks.",
    publishedAt: "2026-08-11",
    readingTime: "9 min read",
  },
  {
    slug: "why-small-diffs-improve-security-review",
    title: "Why Small Diffs Improve Security Review",
    description:
      "Why smaller pull requests are easier to review securely and how teams can use that to reduce production risk.",
    publishedAt: "2026-08-11",
    readingTime: "7 min read",
  },
  {
    slug: "why-file-linters-miss-security-bugs",
    title: "Why File Linters Miss Security Bugs",
    description:
      "A practical explanation of the security problems linters miss and why human or AI review still matters for file-level changes.",
    publishedAt: "2026-08-08",
    readingTime: "7 min read",
  },
  {
    slug: "what-to-check-after-linting-passes",
    title: "What to Check After Linting Passes",
    description:
      "A checklist for reviewing code after the linter has removed the obvious issues but before the file is safe to merge.",
    publishedAt: "2026-08-08",
    readingTime: "8 min read",
  },
  {
    slug: "building-a-lint-plus-ai-review-workflow",
    title: "Building a Lint Plus AI Review Workflow",
    description:
      "How to combine file linters, AI review, and human judgment into one fast and practical code review process.",
    publishedAt: "2026-08-08",
    readingTime: "9 min read",
  },
  {
    slug: "lint-clean-does-not-mean-shippable",
    title: "Lint-Clean Does Not Mean Shippable",
    description:
      "Why code that passes linting can still be unsafe, incorrect, or hard to maintain, and what reviewers should verify next.",
    publishedAt: "2026-08-08",
    readingTime: "6 min read",
  },
  {
    slug: "ai-code-review-file-linter-gaps",
    title: "How AI Code Review Catches Linter Gaps Before Merge",
    description:
      "A practical guide to using AI review alongside file linters to catch issues rule-based tools miss before a pull request is merged.",
    publishedAt: "2026-08-08",
    readingTime: "8 min read",
  },
  {
    slug: "github-merge-pull-request-tool",
    title: "GitHub Merge Pull Request Tool: How to Use It Safely",
    description:
      "A practical guide to merging pull requests in GitHub without skipping review, bypassing checks, or turning a clean workflow into a risky shortcut.",
    publishedAt: "2026-08-06",
    readingTime: "8 min read",
  },
  {
    slug: "how-to-review-ai-generated-code-without-trusting-it-blindly",
    title: "How to Review AI-Generated Code Without Trusting It Blindly",
    description:
      "A practical checklist for reviewing AI-generated code with enough skepticism to catch hidden bugs, security mistakes, and brittle shortcuts.",
    publishedAt: "2026-08-06",
    readingTime: "9 min read",
  },
  {
    slug: "pull-request-approval-rules-that-actually-work",
    title: "Pull Request Approval Rules That Actually Work",
    description:
      "A grounded look at approval rules that improve merge quality instead of slowing teams down with ceremony.",
    publishedAt: "2026-08-06",
    readingTime: "7 min read",
  },
  {
    slug: "how-to-stop-merging-bad-code",
    title: "How to Stop Merging Bad Code",
    description:
      "A practical systems-level guide to reducing risky merges with smaller diffs, better checks, clearer ownership, and faster feedback.",
    publishedAt: "2026-08-06",
    readingTime: "8 min read",
  },
  {
    slug: "why-inline-review-comments-beat-dashboards",
    title: "Why Inline Review Comments Beat Dashboards",
    description:
      "Why feedback that lands directly on the code is usually more actionable than another dashboard teams forget to open.",
    publishedAt: "2026-08-06",
    readingTime: "6 min read",
  },
  {
    slug: "how-to-choose-the-right-pr-review-workflow",
    title: "How to Choose the Right PR Review Workflow",
    description:
      "A practical framework for choosing a PR review workflow that fits team size, risk level, and release pressure.",
    publishedAt: "2026-08-06",
    readingTime: "8 min read",
  },
  {
    slug: "automate-pr-reviews-with-ai",
    title: "Automate PR Reviews with AI",
    description:
      "A practical guide to automating PR reviews with AI without losing human judgment, team trust, or security coverage.",
    publishedAt: "2026-08-05",
    readingTime: "9 min read",
  },
  {
    slug: "code-review-vs-code-audit",
    title: "Code Review vs. Code Audit",
    description:
      "A practical comparison of code review and code audit: when each one is useful, how they differ, and why strong teams often need both.",
    publishedAt: "2026-08-05",
    readingTime: "9 min read",
  },
  {
    slug: "ai-generated-audit-report",
    title: "AI Generated Audit Report",
    description:
      "A deep look at what an AI generated audit report should include, how to read one, and how to separate useful findings from noise.",
    publishedAt: "2026-08-05",
    readingTime: "9 min read",
  },
  {
    slug: "how-to-write-good-code",
    title: "How to Write Good Code",
    description:
      "A practical guide on how to write good code by keeping it readable, testable, maintainable, and safe under change.",
    publishedAt: "2026-08-05",
    readingTime: "7 min read",
  },
  {
    slug: "fastapi-api-security-patterns",
    title: "FastAPI API Security Patterns",
    description:
      "A deeper guide to authentication, authorization, request validation, and safe defaults for FastAPI APIs that need to survive real production traffic.",
    publishedAt: "2026-08-05",
    readingTime: "12 min read",
  },
  {
    slug: "how-to-measure-code-review-quality",
    title: "How to Measure Code Review Quality",
    description:
      "A practical discussion of the metrics that actually matter in code review: signal, latency, coverage, actionability, and false-positive rate.",
    publishedAt: "2026-08-05",
    readingTime: "10 min read",
  },
  {
    slug: "auditing-monorepos-without-losing-signal",
    title: "Auditing Monorepos Without Losing Signal",
    description:
      "A deep look at how to keep audits useful in large monorepos by scoping context, controlling noise, and prioritizing the highest-risk changes.",
    publishedAt: "2026-08-05",
    readingTime: "11 min read",
  },
  {
    slug: "tests-that-catch-real-bugs",
    title: "Tests That Catch Real Bugs",
    description:
      "A detailed guide to writing tests that actually protect production: boundary tests, regression tests, integration tests, and failure-mode coverage.",
    publishedAt: "2026-08-05",
    readingTime: "9 min read",
  },
  {
    slug: "how-to-upgrade-dependencies-safely",
    title: "How to Upgrade Dependencies Safely",
    description:
      "A practical strategy for upgrading packages without creating chaos: risk assessment, staging, verification, and rollback planning.",
    publishedAt: "2026-08-05",
    readingTime: "10 min read",
  },
  {
    slug: "fastapi-production-readiness-guide",
    title: "FastAPI Production Readiness Guide",
    description:
      "A deep guide to shipping FastAPI in production: validation, settings, auth, background tasks, observability, and the pitfalls that show up later.",
    publishedAt: "2026-08-04",
    readingTime: "12 min read",
  },
  {
    slug: "how-to-evaluate-ai-code-review-tools",
    title: "How to Evaluate AI Code Review Tools",
    description:
      "A practical framework for evaluating AI review tools on signal quality, context depth, workflow fit, security usefulness, and long-term trust.",
    publishedAt: "2026-08-04",
    readingTime: "11 min read",
  },
  {
    slug: "why-code-reviews-fail",
    title: "Why Code Reviews Fail",
    description:
      "A deeper look at the organizational and technical reasons code review breaks down, and how to build a review system that actually works.",
    publishedAt: "2026-08-04",
    readingTime: "10 min read",
  },
  {
    slug: "python-dependency-hygiene",
    title: "Python Dependency Hygiene",
    description:
      "A practical discussion of Python dependency risk: version pinning, lockfiles, supply chain trust, review habits, and when to upgrade safely.",
    publishedAt: "2026-08-04",
    readingTime: "9 min read",
  },
  {
    slug: "security-by-design-for-web-apps",
    title: "Security by Design for Web Apps",
    description:
      "A deeper explanation of how security by design changes architecture, workflows, and review habits before vulnerabilities exist.",
    publishedAt: "2026-08-04",
    readingTime: "11 min read",
  },
  {
    slug: "8-python-libraries-cleaner-smarter-maintainable-code",
    title:
      "8 Python Libraries That Help You Write Cleaner, Smarter, and More Maintainable Code",
    description:
      "A practical guide to eight Python libraries that improve validation, APIs, testing, data access, HTTP calls, CLI design, terminal output, and formatting.",
    publishedAt: "2026-08-03",
    readingTime: "10 min read",
  },
  {
    slug: "how-to-write-better-code-review-comments",
    title: "How to Write Better Code Review Comments",
    description:
      "A practical guide to writing review comments that are specific, respectful, and actually useful to the author.",
    publishedAt: "2026-08-03",
    readingTime: "6 min read",
  },
  {
    slug: "what-makes-an-ai-review-tool-useful",
    title: "What Makes an AI Review Tool Useful",
    description:
      "A product-focused look at the features that actually matter in AI review tools: context, signal quality, workflow fit, and trust.",
    publishedAt: "2026-08-03",
    readingTime: "8 min read",
  },
  {
    slug: "secure-code-review-workflow",
    title: "A Secure Code Review Workflow That Teams Will Actually Use",
    description:
      "A step-by-step security review workflow that fits into normal pull request habits instead of fighting them.",
    publishedAt: "2026-08-03",
    readingTime: "7 min read",
  },
  {
    slug: "pr-review-checklist-for-engineers",
    title: "PR Review Checklist for Engineers",
    description:
      "A practical pull request checklist that helps reviewers catch security, correctness, and maintainability issues without slowing the team down.",
    publishedAt: "2026-08-03",
    readingTime: "7 min read",
  },
  {
    slug: "static-analysis-vs-ai-review",
    title: "Static Analysis vs AI Review",
    description:
      "When static analysis is enough, where AI review adds value, and why the best teams use both instead of treating them as competitors.",
    publishedAt: "2026-08-03",
    readingTime: "8 min read",
  },
  {
    slug: "secrets-in-ci-cd",
    title: "Secrets in CI/CD: What Usually Goes Wrong",
    description:
      "A clear guide to the most common secret-handling mistakes in GitHub Actions and other CI/CD pipelines, plus practical ways to reduce the risk.",
    publishedAt: "2026-08-03",
    readingTime: "9 min read",
  },
  {
    slug: "ai-code-review-guide",
    title: "AI Code Review Guide",
    description:
      "A practical guide to using AI code review well: what it can catch, where it fails, and how to combine it with human review without adding noise.",
    publishedAt: "2026-08-01",
    readingTime: "9 min read",
  },
  {
    slug: "best-ai-code-review-tools",
    title: "Best AI Code Review Tools",
    description:
      "A current, practical comparison of AI code review tools and where each one fits best for GitHub-first teams, security-focused teams, and larger engineering orgs.",
    publishedAt: "2026-08-01",
    readingTime: "10 min read",
  },
  {
    slug: "secure-coding-checklist",
    title: "Secure Coding Checklist",
    description:
      "A concise secure coding checklist covering access control, injection, secrets, dependencies, error handling, and review habits that prevent common bugs.",
    publishedAt: "2026-08-01",
    readingTime: "7 min read",
  },
  {
    slug: "github-ai-code-review",
    title: "GitHub AI Code Review",
    description:
      "How GitHub Copilot Code Review works, where it fits in a PR workflow, and how to use it effectively without letting automation replace judgment.",
    publishedAt: "2026-08-01",
    readingTime: "8 min read",
  },
  {
    slug: "owasp-top-10-explained",
    title: "OWASP Top 10:2025, Explained",
    description:
      "A practical guide to the OWASP Top 10:2025, including the full ranking, what changed from 2021, and how each category shows up in real code review and security work.",
    publishedAt: "2026-08-01",
    readingTime: "8 min read",
  },
];
