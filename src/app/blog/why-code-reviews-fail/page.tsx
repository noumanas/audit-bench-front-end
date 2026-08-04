import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'why-code-reviews-fail')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhyCodeReviewsFailPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Code reviews usually fail for predictable reasons. The issue is rarely that reviewers do not care. It is
        more often that the system around review makes it hard to do good work consistently.
      </p>

      <h2>The technical failures</h2>
      <ul>
        <li>PRs are too large to review carefully.</li>
        <li>Changes are merged before tests or checks have enough coverage.</li>
        <li>Security-sensitive code is reviewed like ordinary code.</li>
        <li>Automated feedback is noisy, so humans stop paying attention.</li>
      </ul>

      <h2>The organizational failures</h2>
      <ul>
        <li>Review ownership is unclear.</li>
        <li>Reviewers do not have enough context.</li>
        <li>Authors are rewarded for speed over clarity.</li>
        <li>Important feedback gets lost in etiquette or hierarchy.</li>
      </ul>

      <h2>What better review looks like</h2>
      <p>
        Good review systems keep PRs small, define what matters most, and use automation to handle repetitive checks
        while humans focus on correctness, architecture, and risk. The goal is not perfection. It is reliable
        judgment at the right point in the workflow.
      </p>

      <p>
        If reviews feel slow and inconsistent, the fix is usually structural, not social.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          See a practical checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
