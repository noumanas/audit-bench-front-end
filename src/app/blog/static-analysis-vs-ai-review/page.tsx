import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'static-analysis-vs-ai-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function StaticAnalysisVsAiReviewPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Static analysis and AI review solve different problems. Static analysis is deterministic: it checks code
        against defined rules, patterns, or type constraints. AI review is probabilistic: it helps interpret
        context, summarize risk, and surface things a rule-based tool may not see.
      </p>

      <h2>What static analysis is good at</h2>
      <ul>
        <li>Repeatable checks with low ambiguity</li>
        <li>Linting, typing, formatting, and rule-based security patterns</li>
        <li>Fast feedback that does not depend on model quality</li>
      </ul>

      <h2>What AI review adds</h2>
      <ul>
        <li>Cross-file reasoning</li>
        <li>Natural-language explanations of risk</li>
        <li>Help understanding intent in larger diffs</li>
        <li>Support for review tasks that are too contextual for a simple rule</li>
      </ul>

      <h2>Where teams go wrong</h2>
      <p>
        The failure mode is treating AI as a replacement for static checks. That weakens the pipeline. The better
        pattern is to keep deterministic checks as the baseline and use AI to add context, prioritization, and
        reviewer assistance on top.
      </p>

      <h2>The practical answer</h2>
      <p>
        If the problem can be expressed as a rule, static analysis should catch it first. If the problem depends on
        intent, architecture, or change impact across files, AI review can help a human reviewer see it faster.
      </p>

      <p>
        The strongest review process uses both layers together.
      </p>

      <p>
        <Link href="/blog/ai-code-review-guide" className="font-semibold">
          Back to the AI review guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
