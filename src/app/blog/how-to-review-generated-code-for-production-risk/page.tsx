import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-review-generated-code-for-production-risk')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToReviewGeneratedCodeForProductionRiskPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Generated code can be productive, but it should never be trusted by default. The danger is not just
        whether the code compiles. The bigger question is whether the code behaves correctly under real traffic,
        real data, and real failure conditions.
      </p>

      <h2>Review the assumptions first</h2>
      <p>
        AI-generated code often looks confident while assuming a lot. It may assume the input is clean, the user
        is authorized, the API always responds, or the state never changes unexpectedly. Reviewers should look
        for those hidden assumptions before anything else.
      </p>

      <h2>Production risks to check</h2>
      <ul>
        <li>Authorization checks that are missing or too broad</li>
        <li>Error handling that fails open or hides failures</li>
        <li>Race conditions introduced by optimistic assumptions</li>
        <li>Logging that leaks sensitive data</li>
        <li>Tests that cover the happy path but not the edge cases</li>
      </ul>

      <h2>Do not review the surface only</h2>
      <p>
        The code may look tidy and consistent, but the important question is what happens after deployment. A
        generated helper function can still encode a bad security decision, a brittle state transition, or a
        confusing integration contract.
      </p>

      <h2>Good review questions</h2>
      <ol>
        <li>What happens if the input is malformed?</li>
        <li>What happens if the external service is down?</li>
        <li>Does the code expose more data than the caller should see?</li>
        <li>Could this change break rollback or incident recovery?</li>
      </ol>

      <h2>How to use generated code safely</h2>
      <p>
        Use generated code as a draft, not a decision. Let it accelerate implementation, but rely on review,
        tests, and security checks to decide whether the code belongs in production.
      </p>

      <p>
        <Link href="/blog/how-to-review-ai-generated-code-without-trusting-it-blindly" className="font-semibold">
          Read the AI-generated code checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
