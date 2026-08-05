import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'tests-that-catch-real-bugs')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function TestsThatCatchRealBugsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        The best tests are not the ones that make coverage numbers look good. They are the ones that protect the
        behavior your users and your business actually depend on.
      </p>

      <h2>Test the boundaries</h2>
      <p>
        The highest-value tests usually sit at the boundary of your system: request validation, authorization,
        external API failure, database writes, and dangerous edge cases. That is where regressions hurt most.
      </p>

      <h2>Prefer regression tests for real bugs</h2>
      <p>
        When a bug reaches production, the fix should usually come with a test that would have caught it. That turns
        incident response into long-term protection rather than a one-off patch.
      </p>

      <h2>Integration tests matter</h2>
      <ul>
        <li>They catch wiring mistakes unit tests miss.</li>
        <li>They verify assumptions across modules and services.</li>
        <li>They are often the right place for security-sensitive behavior.</li>
      </ul>

      <h2>Avoid the trap</h2>
      <p>
        If tests are brittle, too slow, or too abstract, teams stop trusting them. The useful test suite is the one
        people keep running because it catches meaningful problems without becoming painful to maintain.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          Connect tests to review →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
