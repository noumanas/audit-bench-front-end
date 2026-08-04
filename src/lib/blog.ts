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
    slug: 'fastapi-production-readiness-guide',
    title: 'FastAPI Production Readiness Guide',
    description:
      'A deep guide to shipping FastAPI in production: validation, settings, auth, background tasks, observability, and the pitfalls that show up later.',
    publishedAt: '2026-08-04',
    readingTime: '12 min read',
  },
  {
    slug: 'how-to-evaluate-ai-code-review-tools',
    title: 'How to Evaluate AI Code Review Tools',
    description:
      'A practical framework for evaluating AI review tools on signal quality, context depth, workflow fit, security usefulness, and long-term trust.',
    publishedAt: '2026-08-04',
    readingTime: '11 min read',
  },
  {
    slug: 'why-code-reviews-fail',
    title: 'Why Code Reviews Fail',
    description:
      'A deeper look at the organizational and technical reasons code review breaks down, and how to build a review system that actually works.',
    publishedAt: '2026-08-04',
    readingTime: '10 min read',
  },
  {
    slug: 'python-dependency-hygiene',
    title: 'Python Dependency Hygiene',
    description:
      'A practical discussion of Python dependency risk: version pinning, lockfiles, supply chain trust, review habits, and when to upgrade safely.',
    publishedAt: '2026-08-04',
    readingTime: '9 min read',
  },
  {
    slug: 'security-by-design-for-web-apps',
    title: 'Security by Design for Web Apps',
    description:
      'A deeper explanation of how security by design changes architecture, workflows, and review habits before vulnerabilities exist.',
    publishedAt: '2026-08-04',
    readingTime: '11 min read',
  },
  {
    slug: '8-python-libraries-cleaner-smarter-maintainable-code',
    title: '8 Python Libraries That Help You Write Cleaner, Smarter, and More Maintainable Code',
    description:
      'A practical guide to eight Python libraries that improve validation, APIs, testing, data access, HTTP calls, CLI design, terminal output, and formatting.',
    publishedAt: '2026-08-03',
    readingTime: '10 min read',
  },
  {
    slug: 'how-to-write-better-code-review-comments',
    title: 'How to Write Better Code Review Comments',
    description:
      'A practical guide to writing review comments that are specific, respectful, and actually useful to the author.',
    publishedAt: '2026-08-03',
    readingTime: '6 min read',
  },
  {
    slug: 'what-makes-an-ai-review-tool-useful',
    title: 'What Makes an AI Review Tool Useful',
    description:
      'A product-focused look at the features that actually matter in AI review tools: context, signal quality, workflow fit, and trust.',
    publishedAt: '2026-08-03',
    readingTime: '8 min read',
  },
  {
    slug: 'secure-code-review-workflow',
    title: 'A Secure Code Review Workflow That Teams Will Actually Use',
    description:
      'A step-by-step security review workflow that fits into normal pull request habits instead of fighting them.',
    publishedAt: '2026-08-03',
    readingTime: '7 min read',
  },
  {
    slug: 'pr-review-checklist-for-engineers',
    title: 'PR Review Checklist for Engineers',
    description:
      'A practical pull request checklist that helps reviewers catch security, correctness, and maintainability issues without slowing the team down.',
    publishedAt: '2026-08-03',
    readingTime: '7 min read',
  },
  {
    slug: 'static-analysis-vs-ai-review',
    title: 'Static Analysis vs AI Review',
    description:
      'When static analysis is enough, where AI review adds value, and why the best teams use both instead of treating them as competitors.',
    publishedAt: '2026-08-03',
    readingTime: '8 min read',
  },
  {
    slug: 'secrets-in-ci-cd',
    title: 'Secrets in CI/CD: What Usually Goes Wrong',
    description:
      'A clear guide to the most common secret-handling mistakes in GitHub Actions and other CI/CD pipelines, plus practical ways to reduce the risk.',
    publishedAt: '2026-08-03',
    readingTime: '9 min read',
  },
  {
    slug: 'ai-code-review-guide',
    title: 'AI Code Review Guide',
    description:
      'A practical guide to using AI code review well: what it can catch, where it fails, and how to combine it with human review without adding noise.',
    publishedAt: '2026-08-01',
    readingTime: '9 min read',
  },
  {
    slug: 'best-ai-code-review-tools',
    title: 'Best AI Code Review Tools',
    description:
      'A current, practical comparison of AI code review tools and where each one fits best for GitHub-first teams, security-focused teams, and larger engineering orgs.',
    publishedAt: '2026-08-01',
    readingTime: '10 min read',
  },
  {
    slug: 'secure-coding-checklist',
    title: 'Secure Coding Checklist',
    description:
      'A concise secure coding checklist covering access control, injection, secrets, dependencies, error handling, and review habits that prevent common bugs.',
    publishedAt: '2026-08-01',
    readingTime: '7 min read',
  },
  {
    slug: 'github-ai-code-review',
    title: 'GitHub AI Code Review',
    description:
      'How GitHub Copilot Code Review works, where it fits in a PR workflow, and how to use it effectively without letting automation replace judgment.',
    publishedAt: '2026-08-01',
    readingTime: '8 min read',
  },
  {
    slug: 'owasp-top-10-explained',
    title: 'OWASP Top 10:2025, Explained',
    description:
      'A practical guide to the OWASP Top 10:2025, including the full ranking, what changed from 2021, and how each category shows up in real code review and security work.',
    publishedAt: '2026-08-01',
    readingTime: '8 min read',
  },
];
