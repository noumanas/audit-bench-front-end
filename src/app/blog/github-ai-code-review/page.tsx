import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { StructuredData } from '@/components/StructuredData';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'github-ai-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does GitHub AI code review catch security vulnerabilities?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "It flags some obvious issues, but Copilot Code Review is tuned for general code quality and PR-diff context, not a dedicated security audit. It is not a substitute for a tool built specifically to find framework-level vulnerabilities and secrets.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is GitHub’s built-in AI code review enough on its own?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For routine PRs on a GitHub-first team, often yes. For security-sensitive changes or cross-file architectural risk, most teams pair it with a deeper, dedicated review tool rather than relying on it alone.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use GitHub Copilot Code Review and Audit Bench Ai together?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. They solve different problems — Copilot reviews the diff inline as PRs open, while Audit Bench Ai runs a deeper structural and security audit across the repository. Most teams run both rather than choosing one.',
      },
    },
  ],
};

export default function GitHubAiCodeReviewPage() {
  return (
    <BlogArticleLayout
      slug={POST.slug}
      title={POST.title}
      publishedAt={POST.publishedAt}
      updatedAt={POST.updatedAt}
      readingTime={POST.readingTime}
    >
      <StructuredData data={FAQ_SCHEMA} />
      <p>
        GitHub&apos;s AI code review — shipped as Copilot Code Review — is the most obvious AI review option for
        teams already centered on GitHub. It fits where your pull requests already live, which is a big deal:
        review tools tend to fail when they ask people to change habits before they see value.
      </p>

      <h2>Why it matters</h2>
      <p>
        GitHub&apos;s official positioning is simple: Copilot can take the first pass on a PR, analyze the full
        changeset, and surface feedback that helps human reviewers spend their time on what matters most. That is
        exactly the right division of labor if your bottleneck is review throughput.
      </p>

      <h2>Where it fits well</h2>
      <ul>
        <li>GitHub-first teams that want the smallest possible workflow change</li>
        <li>Repositories with a lot of routine PRs that still need a first review</li>
        <li>Teams that want inline suggestions rather than external dashboards</li>
      </ul>

      <h2>Where it needs help</h2>
      <ul>
        <li>Large architectural decisions still need human judgment</li>
        <li>Security-sensitive changes still need explicit review standards</li>
        <li>Teams should verify the tool against their own codebase, not demo repos</li>
      </ul>

      <h2>GitHub AI code review vs. a dedicated tool like Audit Bench Ai</h2>
      <p>
        Copilot Code Review and a purpose-built auditor like Audit Bench Ai are not competing for the same job.
        Here is where each one actually earns its place in the workflow.
      </p>

      <h3>1. Scope: PR diffs vs. full-repository structural audits</h3>
      <p>
        <strong>GitHub Copilot Code Review:</strong> Reads the changeset in front of it — the diff on this one
        pull request — and comments inline. It is fast and contextual to what just changed, but it does not
        reason about the rest of the repository unless that context is in the diff.
      </p>
      <p>
        <strong>Audit Bench Ai:</strong> Maps a repository&apos;s structure to catch bugs and risks that cross
        multiple files — the kind of issue that looks fine in an isolated diff but breaks an invariant somewhere
        else in the codebase.
      </p>

      <h3>2. Security depth: general suggestions vs. framework-specific checks</h3>
      <p>
        <strong>GitHub Copilot Code Review:</strong> Surfaces general code-quality and correctness feedback. It is
        not positioned or tuned as a security scanner, so security-sensitive changes still need an explicit review
        standard applied by a human or a dedicated tool.
      </p>
      <p>
        <strong>Audit Bench Ai:</strong> Runs security, logic, performance, architecture, and testing as separate
        review lenses, and is built to catch framework-specific issues — a bypassed row-level security policy, a
        shared mutable variable leaking data across requests — that a general-purpose PR reviewer is not looking
        for.
      </p>

      <h3>3. Cost model: included with your Copilot seat vs. usage-based scanning</h3>
      <p>
        <strong>GitHub Copilot Code Review:</strong> Comes bundled with a Copilot seat, so there is no separate
        line item if your team already pays for Copilot.
      </p>
      <p>
        <strong>Audit Bench Ai:</strong> Runs free local checks first — linting, TypeScript diagnostics,
        complexity, secret scanning — and only sends code that looks risky to an LLM, drawing from a scan quota. A
        clean scan costs nothing even though every file was checked.
      </p>

      <h2>How to get better results from either one</h2>
      <ul>
        <li>Keep PRs small enough for context to remain clear.</li>
        <li>Write contribution standards so the tool has something to compare against.</li>
        <li>Treat AI comments as triage, not final authority.</li>
        <li>Measure whether it reduces reviewer load and catches real defects.</li>
      </ul>

      <h2>Frequently asked questions</h2>
      <h3>Does GitHub AI code review catch security vulnerabilities?</h3>
      <p>
        It flags some obvious issues, but Copilot Code Review is tuned for general code quality and PR-diff
        context, not a dedicated security audit. It is not a substitute for a tool built specifically to find
        framework-level vulnerabilities and secrets.
      </p>
      <h3>Is GitHub&apos;s built-in AI code review enough on its own?</h3>
      <p>
        For routine PRs on a GitHub-first team, often yes. For security-sensitive changes or cross-file
        architectural risk, most teams pair it with a deeper, dedicated review tool rather than relying on it
        alone.
      </p>
      <h3>Can I use GitHub Copilot Code Review and Audit Bench Ai together?</h3>
      <p>
        Yes. They solve different problems — Copilot reviews the diff inline as PRs open, while Audit Bench Ai
        runs a deeper structural and security audit across the repository. Most teams run both rather than
        choosing one.
      </p>

      <p>
        The best use of GitHub&apos;s AI code review is not replacing your team. It is compressing the time
        between &ldquo;PR opened&rdquo; and &ldquo;someone competent looked at it&rdquo; — and knowing when a diff-level
        pass is not enough is what decides whether you need something deeper alongside it.
      </p>

      <p>
        <Link href="/blog/ai-code-review-guide" className="font-semibold">
          Read the general guide →
        </Link>
      </p>
      <p>
        <Link href="/blog/best-ai-code-review-tools" className="font-semibold">
          See how it compares to other AI code review tools →
        </Link>
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-paper-line)' }} />
      <p style={{ fontSize: '0.8em', color: 'var(--color-muted-on-paper)' }}>
        Source:{" "}
        <a href="https://github.com/features/code-review" target="_blank" rel="nofollow noopener noreferrer">
          GitHub Copilot Code Review
        </a>
        .
      </p>
    </BlogArticleLayout>
  );
}
