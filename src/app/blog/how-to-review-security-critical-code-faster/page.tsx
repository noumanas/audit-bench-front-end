import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-review-security-critical-code-faster')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToReviewSecurityCriticalCodeFasterPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Security-critical code review does not need to be slow to be effective. The trick is to spend less time
        on low-value details and more time on the parts of the change that can actually hurt users, data, or
        systems if they are wrong.
      </p>

      <h2>Start with risk</h2>
      <p>
        Before reading line by line, identify whether the change touches authentication, authorization, secrets,
        payment flows, deployment, or user data. If it does, the review should go deeper. If it does not, the
        review can stay lighter.
      </p>

      <h2>Use a predictable order</h2>
      <ol>
        <li>Check the file for the main behavior change.</li>
        <li>Look for security-sensitive paths.</li>
        <li>Review failure handling and edge cases.</li>
        <li>Confirm tests cover the risky branch.</li>
      </ol>

      <h2>Cut review time without cutting quality</h2>
      <ul>
        <li>Keep diffs small.</li>
        <li>Use automation for style and syntax.</li>
        <li>Reserve human attention for intent and risk.</li>
        <li>Escalate anything that crosses a trust boundary.</li>
      </ul>

      <h2>The practical rule</h2>
      <p>
        Fast security review is not about skipping checks. It is about removing unnecessary work so reviewers
        can focus on the few decisions that actually matter.
      </p>
    </BlogArticleLayout>
  );
}
