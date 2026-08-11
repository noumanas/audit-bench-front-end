import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-keep-ai-code-review-from-creating-noise')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToKeepAiCodeReviewFromCreatingNoisePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        AI code review is most useful when it improves attention, not when it adds more comments than the team
        can reasonably process. If the model floods a pull request with vague warnings, people stop trusting it.
      </p>

      <h2>What noise looks like</h2>
      <ul>
        <li>Comments that restate the code</li>
        <li>Warnings with no real impact</li>
        <li>Generic “could be improved” feedback</li>
        <li>Repeated advice the human reviewer already covered</li>
      </ul>

      <h2>How to reduce it</h2>
      <ol>
        <li>Constrain the review scope to the changed files.</li>
        <li>Ask for risk-focused feedback instead of broad commentary.</li>
        <li>Filter out formatting and style already handled by linters.</li>
        <li>Prefer fewer, higher-quality findings over many weak ones.</li>
      </ol>

      <h2>What AI should do well</h2>
      <p>
        A useful AI reviewer should identify the sensitive parts of a change, summarize the real risk, and help
        the human reviewer decide what deserves attention. It should not try to replace the reviewer or narrate
        every line of code.
      </p>

      <h2>The result</h2>
      <p>
        When AI review stays focused, it becomes leverage instead of overhead. That makes teams more likely to
        keep using it on the changes that matter most.
      </p>

      <p>
        <Link href="/blog/ai-code-review-file-linter-gaps" className="font-semibold">
          See how AI complements linters →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
