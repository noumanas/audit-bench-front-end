import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'code-review-vs-code-audit')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function CodeReviewVsCodeAuditPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Code review and code audit are related, but they are not the same thing. A code review is usually part of a
        normal development workflow, while a code audit is a deeper, more deliberate inspection focused on finding
        risk, validating assumptions, and checking whether the system is safe to ship.
      </p>

      <p>
        In practice, code review is collaborative and frequent. It helps teams share knowledge, catch obvious
        mistakes, and keep changes understandable. A code audit is less about collaboration and more about
        confidence: it asks whether the code has hidden security, logic, or architectural problems that deserve a
        closer look.
      </p>

      <h2>What code review is best for</h2>
      <ul>
        <li>Keeping daily development moving</li>
        <li>Spotting obvious bugs before merge</li>
        <li>Sharing context across the team</li>
        <li>Enforcing coding standards and consistency</li>
      </ul>

      <h2>What code audit is best for</h2>
      <ul>
        <li>Security-sensitive code paths</li>
        <li>High-risk releases</li>
        <li>Large refactors and architecture changes</li>
        <li>Investigating code that may already be in trouble</li>
      </ul>

      <h2>Why the difference matters</h2>
      <p>
        If you treat every change like an audit, the process becomes too slow. If you treat every risky change like
        an ordinary review, important problems can slip through. Strong teams use review for the everyday path and
        audit for the moments when the stakes are higher.
      </p>

      <h2>How they work together</h2>
      <p>
        The best workflow is layered: automated checks first, normal review next, and audit-style analysis when code
        touches authentication, authorization, secrets, dependencies, or other critical paths. That way the team
        gets speed without losing confidence.
      </p>

      <p>
        If you want a simple rule, use code review to move work forward and code audit to decide whether the work is
        safe enough to trust.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          See the review checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
