import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'secure-code-review-for-api-changes')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecureCodeReviewForApiChangesPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        API changes deserve careful review because they reshape the way other systems talk to your application.
        A small change can create a large security impact if it weakens auth, widens access, or leaks data in a
        response payload.
      </p>

      <h2>Review the contract</h2>
      <p>
        Every API change should make its contract obvious: what inputs it accepts, what it returns, who can call
        it, and what errors it might expose. If that contract is unclear in the code, the review should slow
        down.
      </p>

      <h2>Check the security surfaces</h2>
      <ul>
        <li>Authentication and authorization</li>
        <li>Input validation</li>
        <li>Output filtering and redaction</li>
        <li>Rate limiting and abuse handling</li>
        <li>Error messages and logging</li>
      </ul>

      <h2>Common API mistakes</h2>
      <ul>
        <li>Endpoints that trust client-provided IDs too much</li>
        <li>Response fields that reveal internal state</li>
        <li>Missing checks on update and delete operations</li>
        <li>Version changes that break old clients in unsafe ways</li>
      </ul>

      <h2>What a good reviewer confirms</h2>
      <p>
        A secure API review confirms that the new endpoint or modification behaves as intended, protects data
        boundaries, and fails safely when something goes wrong.
      </p>
    </BlogArticleLayout>
  );
}
