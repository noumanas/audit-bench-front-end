import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'building-a-lint-plus-ai-review-workflow')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function BuildingALintPlusAiReviewWorkflowPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        The best review workflow for file changes is layered. First, the linter removes obvious mistakes. Then
        AI review looks for context-heavy issues. Finally, a human reviewer makes the merge decision with the
        full picture in mind.
      </p>

      <h2>Layer 1: linting</h2>
      <p>
        Use linting to enforce the rules that should not be debated in review. That keeps the PR smaller and
        prevents human reviewers from wasting time on style issues that a machine can handle better.
      </p>

      <h2>Layer 2: AI review</h2>
      <p>
        Once the file is lint-clean, AI review can focus on whether the change is logically sound. It is most
        helpful when it highlights risk, summarizes behavior, and points reviewers toward the parts of the file
        that deserve attention.
      </p>

      <h2>Layer 3: human judgment</h2>
      <ul>
        <li>Confirm the code matches the intended behavior.</li>
        <li>Check that security-sensitive paths are protected.</li>
        <li>Verify that edge cases are handled reasonably.</li>
        <li>Decide whether the merge is acceptable now or needs more work.</li>
      </ul>

      <h2>Why this workflow works</h2>
      <p>
        Each layer does one job well. The linter handles rules, AI handles context, and humans handle
        responsibility. That division keeps review fast without making it shallow.
      </p>

      <p>
        <Link href="/blog/ai-code-review-file-linter-gaps" className="font-semibold">
          Read the linter gaps article →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
