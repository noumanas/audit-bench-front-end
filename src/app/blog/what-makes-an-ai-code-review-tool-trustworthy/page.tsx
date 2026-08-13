import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'what-makes-an-ai-code-review-tool-trustworthy')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhatMakesAnAiCodeReviewToolTrustworthyPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Trust is the real product feature in AI code review. A tool can be fast, polished, and technically
        impressive, but if engineers do not trust the findings, they will ignore them. A trustworthy tool is the
        one that consistently earns attention for the right reasons.
      </p>

      <h2>Trust starts with precision</h2>
      <p>
        Reviewers need comments that are specific enough to act on. Generic warnings create noise. Accurate,
        contextual findings create confidence. If the tool cannot explain why a line matters, the reviewer will
        not rely on it.
      </p>

      <h2>Trust also depends on workflow fit</h2>
      <ul>
        <li>Does it work in the pull request or merge request itself?</li>
        <li>Does it respect the team’s branch rules and review process?</li>
        <li>Does it add signal without forcing people to switch tools?</li>
        <li>Does it handle large codebases without collapsing into noise?</li>
      </ul>

      <h2>Security matters too</h2>
      <p>
        A trustworthy AI review tool must be clear about what code it sees, how it handles data, and whether it
        preserves the team’s security boundaries. If code review itself is security-sensitive, the review tool
        must be held to the same standard.
      </p>

      <h2>Ask these questions before adoption</h2>
      <ol>
        <li>What does it consistently miss?</li>
        <li>What does it flag too often?</li>
        <li>How easy is it to tune for our codebase?</li>
        <li>Can reviewers override it without friction?</li>
      </ol>

      <h2>The best sign of trust</h2>
      <p>
        The strongest indicator of trust is not that a tool is never wrong. It is that reviewers understand when
        it is right, when it is wrong, and why. That makes the tool useful instead of mysterious.
      </p>

      <p>
        <Link href="/blog/how-to-keep-ai-code-review-from-creating-noise" className="font-semibold">
          Read about reducing AI review noise →
        </Link>
      </p>

      <p>
        <Link href="/blog/how-to-evaluate-ai-code-review-tools" className="font-semibold">
          See how to evaluate tools in practice →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
