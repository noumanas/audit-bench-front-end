import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ai-code-review-file-linter-gaps')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AiCodeReviewFileLinterGapsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        File linters are good at enforcing rules the team already knows. AI code review is useful because it can
        notice what the rules do not express well: intent, context, and risk. The strongest review workflow does
        not choose between them. It uses linting to remove the obvious problems, then AI review to catch the
        issues that need judgment.
      </p>

      <h2>What linters are good at</h2>
      <p>
        Linters are fast, deterministic, and repeatable. They are excellent for formatting, naming, simple
        syntactic mistakes, and small pattern violations. If the problem is easy to define as a rule, a linter
        should usually handle it before a human ever sees the file.
      </p>
      <ul>
        <li>Style consistency</li>
        <li>Obvious syntax mistakes</li>
        <li>Basic code smells</li>
        <li>Known anti-patterns</li>
        <li>Framework-specific rule violations</li>
      </ul>

      <h2>Where linters stop</h2>
      <p>
        A clean lint report does not mean the file is safe, correct, or maintainable. Linters do not understand
        whether a change breaks a business rule, weakens an authorization check, or creates a hidden production
        failure. That is where AI review earns its keep.
      </p>
      <ul>
        <li>Cross-file behavior changes</li>
        <li>Implicit trust assumptions</li>
        <li>Security issues hidden in control flow</li>
        <li>Edge cases not covered by a rule</li>
        <li>Misleading code that is syntactically valid but logically wrong</li>
      </ul>

      <h2>How AI review helps after linting</h2>
      <p>
        Once the obvious issues are gone, AI review can focus on meaning. It can ask whether the code actually
        does what the author intended, whether a new branch creates a new risk, and whether a file-level change
        introduced an assumption that should be checked more carefully.
      </p>
      <ol>
        <li>Read the file in context, not as isolated lines.</li>
        <li>Look for paths that handle sensitive data or permissions.</li>
        <li>Check whether the change creates a new failure mode.</li>
        <li>Ask whether the file still behaves correctly with bad input or partial state.</li>
        <li>Escalate anything that affects auth, secrets, payments, or deployment.</li>
      </ol>

      <h2>What to review after the linter passes</h2>
      <p>
        A practical review process should still inspect the things automated style tools miss. This is especially
        true for file-level changes, where a single modified file can hide a larger behavioral shift.
      </p>
      <ul>
        <li>Input validation and output handling</li>
        <li>Authentication and authorization paths</li>
        <li>Secret exposure in code, tests, or config</li>
        <li>Error handling and log output</li>
        <li>Dependencies, imports, and configuration defaults</li>
      </ul>

      <h2>A better workflow for file changes</h2>
      <p>
        The best file-level workflow is simple: let the linter remove the mechanical noise, then use AI review to
        flag the risky parts, then have a human reviewer confirm the decision. That sequence keeps review fast
        without turning it into a box-checking exercise.
      </p>
      <ul>
        <li>Run the linter first.</li>
        <li>Use AI review on the remaining diff.</li>
        <li>Focus human attention on the high-risk file paths.</li>
        <li>Block the merge if the file touches sensitive behavior and the reviewer is not confident.</li>
      </ul>

      <h2>Why this matters</h2>
      <p>
        Teams often assume that if a file is lint-clean, it is “done.” That assumption is dangerous. Linting
        reduces obvious mistakes, but it does not evaluate whether the code is safe to ship. AI review is most
        useful when it fills that gap and helps reviewers make a better decision on the file in front of them.
      </p>

      <p>
        If you want the next step, the most useful pairing is a file linter plus a security-oriented review
        checklist. That gives you consistency for the mechanical issues and judgment for the parts that actually
        matter.
      </p>

      <p>
        <Link href="/blog/how-to-review-ai-generated-code-without-trusting-it-blindly" className="font-semibold">
          Read the AI review checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
