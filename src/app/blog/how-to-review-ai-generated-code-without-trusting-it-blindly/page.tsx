import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-review-ai-generated-code-without-trusting-it-blindly')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToReviewAiGeneratedCodeWithoutTrustingItBlindlyPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        AI-generated code can look polished while still hiding weak assumptions. The reviewer’s job is to check the
        behavior, not the syntax level of confidence the code seems to project.
      </p>

      <h2>Start with the contract</h2>
      <p>Before reading the implementation, ask what the code promises to do and what it must never do.</p>
      <ul>
        <li>What inputs are trusted, and which are hostile?</li>
        <li>What failure mode is acceptable?</li>
        <li>What state does the code assume already exists?</li>
      </ul>

      <h2>Look for the typical AI mistakes</h2>
      <ul>
        <li>Missing null checks around values the model assumed would always exist.</li>
        <li>Overconfident helpers that silently swallow errors.</li>
        <li>Duplicated logic that was copied instead of factored.</li>
        <li>Security paths that look complete but never enforce authorization.</li>
      </ul>

      <h2>Review the edges, not the happy path</h2>
      <p>
        AI tends to get the obvious case right and the messy case wrong. Focus on bad inputs, concurrent updates,
        partial failures, and backwards compatibility. Those are the places where a confident-looking snippet can
        still create a production bug.
      </p>

      <h2>A better habit</h2>
      <p>
        Treat AI code as a draft from a fast junior teammate: useful, often directional, but never exempt from the
        same checks you would apply to any other change.
      </p>

      <p>
        <Link href="/blog/secure-code-review-workflow" className="font-semibold">
          See the secure review workflow →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
