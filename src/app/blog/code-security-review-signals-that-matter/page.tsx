import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'code-security-review-signals-that-matter')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function CodeSecurityReviewSignalsThatMatterPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Good security review depends on knowing which signals matter. Most false confidence comes from watching
        the wrong things: style, naming, or superficial cleanup instead of access control, data flow, and
        failure behavior.
      </p>

      <h2>Signals worth attention</h2>
      <ul>
        <li>Auth logic changes</li>
        <li>New database queries or permissions</li>
        <li>Secret handling and logging</li>
        <li>External calls and webhook processing</li>
        <li>Fallbacks that fail open</li>
      </ul>

      <h2>Signals that are often noise</h2>
      <ul>
        <li>Formatting-only changes</li>
        <li>Pure renames</li>
        <li>Trivial refactors with no behavior change</li>
        <li>Style disagreements that do not affect runtime behavior</li>
      </ul>

      <h2>What the reviewer should ask</h2>
      <ol>
        <li>What new trust boundary appears here?</li>
        <li>Who can influence this input?</li>
        <li>What happens when this path fails?</li>
        <li>Could this leak data or weaken access control?</li>
      </ol>

      <h2>Why this helps</h2>
      <p>
        Review gets much better when the team agrees on the signals that matter. That keeps the conversation
        focused on real risk and reduces the chance that important issues get buried under irrelevant feedback.
      </p>
    </BlogArticleLayout>
  );
}
