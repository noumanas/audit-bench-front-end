import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'pr-review-checklist-for-engineers')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function PrReviewChecklistForEngineersPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        A good pull request review process is not about finding every possible problem. It is about catching the
        important ones early, consistently, and with enough context that the team can act on them fast.
      </p>

      <p>
        The checklist below is designed for engineering teams that want practical signal, not ceremonial review.
        Use it on changes that affect logic, data flow, authentication, authorization, or operational behavior.
      </p>

      <h2>PR review checklist</h2>
      <ul>
        <li>Does the change do what the author says it does?</li>
        <li>Are there security-sensitive paths that need explicit authorization checks?</li>
        <li>Is the failure mode safe if an API, database, or service call goes wrong?</li>
        <li>Are tests present for the risky parts of the change?</li>
        <li>Does the code introduce duplication, hidden coupling, or unclear ownership?</li>
        <li>Could this change leak secrets, PII, or internal implementation details?</li>
        <li>Are migrations, feature flags, and rollout behavior clearly handled?</li>
      </ul>

      <h2>What reviewers should look for first</h2>
      <p>
        Start with the part most likely to hurt users if it is wrong. That is usually access control, data
        integrity, error handling, or a workflow that can be abused at scale.
      </p>

      <h2>What authors should include</h2>
      <ul>
        <li>A clear description of the problem being solved</li>
        <li>A brief explanation of tradeoffs and alternatives</li>
        <li>Tests that cover the edge cases</li>
        <li>Any operational steps needed to ship safely</li>
      </ul>

      <h2>Why this works</h2>
      <p>
        Review quality improves when the process is specific. A checklist does not replace judgment, but it gives
        the team a shared baseline so obvious issues do not slip through just because the PR is large or the day is
        busy.
      </p>

      <p>
        <Link href="/blog/secure-coding-checklist" className="font-semibold">
          See the secure coding checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
