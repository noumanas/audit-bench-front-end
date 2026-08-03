import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'secure-code-review-workflow')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecureCodeReviewWorkflowPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Security review works best when it is part of the normal pull request workflow, not an extra process people
        resent. The trick is to make the security pass lightweight at first, then deeper only where risk justifies
        it.
      </p>

      <h2>A simple workflow</h2>
      <ol>
        <li>Run tests and static checks first.</li>
        <li>Ask whether the change affects auth, data access, secrets, or deployment.</li>
        <li>Review those paths manually with a security lens.</li>
        <li>Use AI or automation to catch obvious misses and summarize the diff.</li>
        <li>Confirm the rollout and rollback plan before merging.</li>
      </ol>

      <h2>What to inspect closely</h2>
      <ul>
        <li>Authorization logic</li>
        <li>Input validation and output encoding</li>
        <li>Secrets handling</li>
        <li>Dependency and build changes</li>
        <li>Error handling and logging</li>
      </ul>

      <h2>Why teams adopt it</h2>
      <p>
        A workflow like this keeps security review practical. It avoids making every PR feel like an audit, while
        still giving the risky changes the attention they deserve.
      </p>

      <p>
        <Link href="/blog/secure-coding-checklist" className="font-semibold">
          Use the checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
