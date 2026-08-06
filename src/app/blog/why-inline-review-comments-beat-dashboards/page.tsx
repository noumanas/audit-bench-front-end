import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'why-inline-review-comments-beat-dashboards')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhyInlineReviewCommentsBeatDashboardsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Dashboards are good at collecting data. Inline comments are good at changing behavior. Most teams need
        the second one more than the first.
      </p>

      <h2>Why inline feedback works</h2>
      <ul>
        <li>It lands where the decision is being made.</li>
        <li>It keeps context attached to the exact line or hunk.</li>
        <li>It makes the next action obvious: fix, explain, or defend.</li>
      </ul>

      <h2>Where dashboards still help</h2>
      <p>
        Dashboards are still useful for trends, ownership patterns, and workload. They are not very good at
        replacing a reviewer standing in the path of a merge.
      </p>

      <h2>The failure mode</h2>
      <p>
        When teams rely on dashboards too much, they start discussing the report instead of the code. Feedback
        becomes abstract and slower to act on.
      </p>

      <h2>Use both, but in the right order</h2>
      <ul>
        <li>Use inline comments to catch the issue.</li>
        <li>Use dashboards to see whether the same issue keeps happening.</li>
        <li>Use metrics to improve the review system, not to replace it.</li>
      </ul>

      <p>
        <Link href="/blog/how-to-measure-code-review-quality" className="font-semibold">
          Read the measurement guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
