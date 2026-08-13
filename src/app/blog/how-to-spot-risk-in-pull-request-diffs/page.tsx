import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-spot-risk-in-pull-request-diffs')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToSpotRiskInPullRequestDiffsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Pull request diffs are where most review decisions begin. A good reviewer reads the diff as a story about
        change: what changed, why it changed, and what that change implies for safety, correctness, and
        maintainability. The lines themselves matter, but the meaning behind them matters more.
      </p>

      <h2>Look for scope changes</h2>
      <p>
        A small diff can hide a big effect if it changes a shared helper, a permission check, or a data
        conversion layer. The first thing to ask is whether the patch is actually local or whether it changes
        behavior across the system.
      </p>

      <h2>Look for trust boundary changes</h2>
      <ul>
        <li>New inputs from users, webhooks, or external APIs</li>
        <li>New writes to databases or caches</li>
        <li>New authorization logic</li>
        <li>New file, network, or process access</li>
      </ul>

      <h2>Look for failure behavior</h2>
      <p>
        Security risk often appears when code fails. Ask whether the diff fails open, fails closed, retries too
        aggressively, or hides the error in a way that makes detection difficult. If the code breaks, the
        reviewer should know what kind of break it causes.
      </p>

      <h2>Read the surrounding context</h2>
      <p>
        The safest way to review a diff is not to read only the changed lines. Open the surrounding functions,
        related files, and tests. That gives you the context needed to see whether the change is safe in the
        larger system.
      </p>

      <h2>What to flag quickly</h2>
      <ol>
        <li>Changes to auth or permission checks</li>
        <li>New secrets or credentials handling</li>
        <li>Broad try/catch blocks that hide failures</li>
        <li>Any code that makes more data visible than before</li>
      </ol>

      <h2>The goal of diff review</h2>
      <p>
        Diff review is not about catching every possible issue. It is about finding the risk that actually
        matters before the merge. If you can reliably spot the risky part of the patch, you can review faster
        without reviewing carelessly.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          Use the PR checklist alongside this guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
