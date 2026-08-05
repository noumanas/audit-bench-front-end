import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-evaluate-ai-code-review-tools')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToEvaluateAiCodeReviewToolsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Evaluating an AI code review tool is a product decision, not a feature checklist. The real question is
        whether the tool improves your team&apos;s review quality and speed without making the process less
        trustworthy.
      </p>

      <h2>What to evaluate</h2>
      <ul>
        <li>Context depth: does it understand the whole repo or only the diff?</li>
        <li>Signal quality: does it catch meaningful issues or mostly generate noise?</li>
        <li>Workflow fit: does it work where your team already reviews code?</li>
        <li>Trust: can reviewers explain why they accepted or rejected the tool&apos;s comments?</li>
        <li>Security usefulness: does it surface risky patterns with enough precision to matter?</li>
      </ul>

      <h2>Questions that reveal the truth</h2>
      <p>Ask the vendor or test the tool against your own codebase:</p>
      <ul>
        <li>What kinds of issues does it consistently miss?</li>
        <li>How does it handle multi-file changes and architectural context?</li>
        <li>What happens when the tool is wrong?</li>
        <li>Can it be tuned to your codebase, or does it stay generic forever?</li>
      </ul>

      <h2>How to run a serious evaluation</h2>
      <p>
        Use a real set of pull requests, not a demo repository. Include routine changes, messy refactors, and
        security-sensitive diffs. Then compare whether the tool improves reviewer confidence and reduces time spent
        on repetitive comments.
      </p>

      <p>
        The strongest tools are not the most chatty ones. They are the ones that help your team make better
        decisions with less friction.
      </p>

      <p>
        <Link href="/blog/what-makes-an-ai-review-tool-useful" className="font-semibold">
          Read the product criteria →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
