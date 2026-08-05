import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'automate-pr-reviews-with-ai')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AutomatePrReviewsWithAiPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Automate PR reviews with AI when you want to make review faster, more consistent, and less dependent on who
        happens to be available that day. The goal is not to remove people from the loop. The goal is to let AI do
        the repetitive first pass so humans can focus on the decisions that actually need judgment.
      </p>

      <p>
        The best way to automate PR reviews with AI is to use it as a triage layer. It should summarize the change,
        flag obvious mistakes, point out risky patterns, and highlight areas that deserve a deeper human look. It
        should not be treated like a final authority.
      </p>

      <h2>What to automate</h2>
      <ul>
        <li>Summaries of what changed</li>
        <li>Detection of obvious bugs and missing tests</li>
        <li>Spotting risky code patterns across files</li>
        <li>Surface-level security and maintainability checks</li>
        <li>Repetitive comments that reviewers would otherwise repeat manually</li>
      </ul>

      <h2>What should stay human</h2>
      <ul>
        <li>Architecture tradeoffs</li>
        <li>Product and UX intent</li>
        <li>Security decisions on high-risk paths</li>
        <li>Approval of large refactors or release-critical changes</li>
      </ul>

      <h2>How to keep the automation useful</h2>
      <p>
        Set clear expectations for what the AI should check. Keep pull requests small enough to review in context.
        Feed the tool the right repository and workflow context. Then measure whether the automation is reducing
        review time and improving signal instead of just increasing comment volume.
      </p>

      <h2>The practical rule</h2>
      <p>
        If the AI can catch it deterministically or summarize it clearly, automate it. If the issue needs context,
        tradeoff analysis, or accountability, keep a human in charge.
      </p>

      <p>
        That is how teams automate PR reviews with AI without turning review into noise.
      </p>

      <p>
        <Link href="/blog/how-to-evaluate-ai-code-review-tools" className="font-semibold">
          See how to evaluate the tool →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
