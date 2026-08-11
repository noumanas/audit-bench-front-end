import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'why-small-diffs-improve-security-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhySmallDiffsImproveSecurityReviewPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Small diffs make security review easier because they reduce uncertainty. When a change is compact, it is
        much simpler to understand the intent, spot side effects, and confirm that no hidden trust boundary was
        crossed.
      </p>

      <h2>Why size matters</h2>
      <p>
        Large diffs force reviewers to hold too much context in working memory. That makes it easier to miss a
        security issue buried in a bigger refactor or to approve a change without fully understanding what it
        does.
      </p>

      <h2>What small diffs improve</h2>
      <ul>
        <li>Review speed</li>
        <li>Reviewer confidence</li>
        <li>Risk visibility</li>
        <li>Testability</li>
        <li>Rollback clarity</li>
      </ul>

      <h2>How to keep diffs small</h2>
      <ol>
        <li>Split refactors from behavior changes.</li>
        <li>Land migrations separately from feature work.</li>
        <li>Avoid unrelated cleanup in the same pull request.</li>
        <li>Prefer incremental steps over huge rewrites.</li>
      </ol>

      <h2>The security payoff</h2>
      <p>
        Smaller changes are easier to reason about and easier to verify. That makes them a better fit for code
        review when the goal is not just shipping, but shipping safely.
      </p>
    </BlogArticleLayout>
  );
}
