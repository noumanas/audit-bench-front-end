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
}

export const BLOG_POSTS: BlogPostMeta[] = [
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
