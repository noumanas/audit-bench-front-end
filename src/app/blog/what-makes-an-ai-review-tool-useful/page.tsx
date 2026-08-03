import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'what-makes-an-ai-review-tool-useful')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhatMakesAnAiReviewToolUsefulPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        An AI review tool is only useful if it helps the reviewer make better decisions faster. That sounds obvious,
        but many tools optimize for the wrong thing: lots of comments, flashy demos, or generic advice that is easy
        to generate and hard to trust.
      </p>

      <h2>The features that matter</h2>
      <ul>
        <li>Repository context, not just diff context</li>
        <li>Low-noise findings that point to real risk</li>
        <li>Integration with the team&apos;s existing workflow</li>
        <li>Clear explanations for why something matters</li>
        <li>Consistency across many PRs, not just a few examples</li>
      </ul>

      <h2>Signs of a weak tool</h2>
      <ul>
        <li>It comments on everything</li>
        <li>It gives vague, non-actionable feedback</li>
        <li>It cannot explain its reasoning clearly</li>
        <li>It is hard to fit into your normal review process</li>
      </ul>

      <h2>How teams should evaluate one</h2>
      <p>
        Test it against your real code. Look for whether it helps reviewers notice important issues faster and
        whether it reduces the time spent on repetitive comments. A useful AI reviewer feels like leverage, not
        overhead.
      </p>

      <p>
        <Link href="/blog/ai-code-review-guide" className="font-semibold">
          Read the AI code review guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
