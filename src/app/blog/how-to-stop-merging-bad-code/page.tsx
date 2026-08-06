import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-stop-merging-bad-code')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToStopMergingBadCodePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Bad code usually does not survive because of one dramatic mistake. It survives because several small
        process failures line up: the diff is too large, the review is too shallow, and the checks are too easy
        to ignore.
      </p>

      <h2>Shrink the problem</h2>
      <ul>
        <li>Keep pull requests small enough that a reviewer can hold the whole change in mind.</li>
        <li>Split unrelated cleanup from behavior changes.</li>
        <li>Land risky migrations separately from feature work.</li>
      </ul>

      <h2>Make risk visible</h2>
      <p>
        A merge process should surface the important parts of a change: permissions, data flow, error handling,
        and rollback impact. If those details are hidden in a giant diff, people miss them.
      </p>

      <h2>Use automation as a filter</h2>
      <ul>
        <li>Run linting and tests before review starts.</li>
        <li>Flag changed files that touch security or payment paths.</li>
        <li>Escalate only the parts that need human attention.</li>
      </ul>

      <h2>What actually stops bad merges</h2>
      <p>
        The fix is not a single blocker. It is a system where the easiest path is also the safe path: smaller
        changes, better checks, stronger ownership, and clear review expectations.
      </p>

      <p>
        <Link href="/blog/how-to-measure-code-review-quality" className="font-semibold">
          Measure whether the system is working →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
