import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-write-better-code-review-comments')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToWriteBetterCodeReviewCommentsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Good review comments are specific, actionable, and framed around the code, not the person who wrote it.
        The best comments move the PR forward. The worst ones create confusion, defensiveness, or noise.
      </p>

      <h2>What a good comment looks like</h2>
      <ul>
        <li>It identifies the exact issue.</li>
        <li>It explains why the issue matters.</li>
        <li>It suggests a next step, not just criticism.</li>
      </ul>

      <h2>What to avoid</h2>
      <ul>
        <li>Vague comments like “this looks wrong” without context</li>
        <li>Style debates disguised as blockers</li>
        <li>Long threads on minor issues while the real risk goes unaddressed</li>
        <li>Comments that sound personal instead of technical</li>
      </ul>

      <h2>A simple structure</h2>
      <ol>
        <li>State the problem.</li>
        <li>Explain the impact.</li>
        <li>Suggest a fix or ask a focused question.</li>
      </ol>

      <p>
        That format keeps comments short and useful. It also makes it easier for the author to respond without
        guessing what the reviewer wanted.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          See the PR checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
