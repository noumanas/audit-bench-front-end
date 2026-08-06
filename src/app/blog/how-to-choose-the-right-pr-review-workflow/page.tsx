import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-choose-the-right-pr-review-workflow')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToChooseTheRightPrReviewWorkflowPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        There is no universal PR workflow. A two-person startup, a regulated fintech team, and an open-source
        maintainer all need different controls. The mistake is pretending one template fits all.
      </p>

      <h2>Choose based on risk</h2>
      <ul>
        <li>Low-risk changes: fast review, simple checks, minimal branching overhead.</li>
        <li>Medium-risk changes: required reviewer plus automated quality gates.</li>
        <li>High-risk changes: stronger approvals, tighter branch rules, explicit rollback plan.</li>
      </ul>

      <h2>Choose based on team shape</h2>
      <p>
        If knowledge is concentrated in one or two people, workflow should make ownership obvious. If the team is
        large, the process should prevent bottlenecks without turning review into a lottery.
      </p>

      <h2>Choose based on failure cost</h2>
      <ul>
        <li>Customer-facing bugs need faster feedback.</li>
        <li>Security changes need stricter review.</li>
        <li>Operational changes need rollback clarity.</li>
      </ul>

      <h2>What to avoid</h2>
      <p>
        Avoid workflows that reward checkbox approval, allow stale context to linger, or make reviewers chase
        information across too many tools. The best workflow is the one your team can follow consistently on a
        busy week.
      </p>

      <p>
        <Link href="/blog/github-merge-pull-request-tool" className="font-semibold">
          Back to the merge tool article →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
