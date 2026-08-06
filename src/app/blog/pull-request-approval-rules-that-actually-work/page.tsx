import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'pull-request-approval-rules-that-actually-work')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function PullRequestApprovalRulesThatActuallyWorkPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Approval rules are only useful if they improve judgment. If they merely add friction, people route around
        them. If they are too loose, they become theater.
      </p>

      <h2>The minimum useful rules</h2>
      <ul>
        <li>No self-approval on changes that affect permissions, payments, or infrastructure.</li>
        <li>At least one reviewer who understands the relevant subsystem.</li>
        <li>All required checks green at the same commit that is about to merge.</li>
        <li>No stale approvals after major follow-up edits.</li>
      </ul>

      <h2>When stricter rules help</h2>
      <p>
        Stronger rules make sense when the cost of a bad merge is high. Security-sensitive services, release
        branches, and anything that touches customer data deserve more than a casual thumbs-up.
      </p>

      <h2>When stricter rules hurt</h2>
      <ul>
        <li>Small fixes get stuck waiting on unnecessary sign-off.</li>
        <li>Reviewers approve without reading because the process is too repetitive.</li>
        <li>Teams learn to optimize for passing the gate, not improving the code.</li>
      </ul>

      <h2>The balance</h2>
      <p>
        Good approval rules act like guardrails. They keep the obvious mistakes out while still letting real work
        move. If people complain about the rules, that is useful signal. It usually means the policy is either
        too broad or too vague.
      </p>

      <p>
        <Link href="/blog/how-to-choose-the-right-pr-review-workflow" className="font-semibold">
          Choose a better review workflow →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
