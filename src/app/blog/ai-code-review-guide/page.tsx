import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ai-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AiCodeReviewGuidePage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        AI code review is useful when it reduces reviewer load without lowering the bar. The mistake most teams
        make is expecting a model to replace judgment. That does not work. What does work is using AI to do the
        first pass: summarize the change, flag obvious risks, point out missing tests, and surface places where a
        human should look more closely.
      </p>

      <p>
        The best AI review tools are not the ones that write the most comments. They are the ones that consistently
        catch real issues, stay grounded in repo context, and leave humans free to focus on architecture, tradeoffs,
        and product intent.
      </p>

      <h2>What AI code review is good at</h2>
      <ul>
        <li>Summarizing large pull requests quickly</li>
        <li>Flagging missing tests and obvious edge cases</li>
        <li>Spotting risky refactors across files</li>
        <li>Highlighting common security and correctness issues</li>
        <li>Reducing repetitive feedback so humans can review higher-level decisions</li>
      </ul>

      <h2>What it is not good at</h2>
      <ul>
        <li>Replacing a reviewer who understands product intent</li>
        <li>Resolving ambiguous design tradeoffs on its own</li>
        <li>Guaranteeing security by itself</li>
        <li>Understanding your team&apos;s conventions unless it is given enough context</li>
      </ul>

      <h2>How to use it well</h2>
      <p>
        Use AI for breadth, then use humans for depth. A good workflow looks like this:
      </p>
      <ol>
        <li>Run static checks, tests, and formatting first.</li>
        <li>Let the AI reviewer make a first pass on the diff.</li>
        <li>Have a human reviewer inspect the highest-risk areas.</li>
        <li>Use the AI comments as prompts, not verdicts.</li>
        <li>Track whether the tool is catching real issues or just making noise.</li>
      </ol>

      <h2>How to evaluate a tool</h2>
      <p>Before adopting any product, ask four questions:</p>
      <ul>
        <li>Does it understand your repository, or only the changed lines?</li>
        <li>Does it work inside the tools your team already uses?</li>
        <li>Does it produce actionable feedback, not vague advice?</li>
        <li>Can it reduce review time without hiding important bugs?</li>
      </ul>

      <p>
        The right answer is usually not “use AI everywhere.” It is “use AI where it makes reviewers faster and more
        consistent, then keep the final decision with the team.”
      </p>

      <p>
        <Link href="/blog/best-ai-code-review-tools" className="font-semibold">
          Compare tools next →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
