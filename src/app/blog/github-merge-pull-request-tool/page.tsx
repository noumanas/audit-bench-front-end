import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'github-merge-pull-request-tool')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function GitHubMergePullRequestToolPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        A merge button looks harmless. In practice, it is the last gate between a reviewed change and a production
        branch. If your process treats merge as a shortcut instead of a control point, you end up with green checks
        that do not actually protect the main branch.
      </p>

      <h2>What the tool should do</h2>
      <ul>
        <li>Respect required reviews instead of letting anyone merge on convenience alone.</li>
        <li>Block merges when status checks are stale or still running.</li>
        <li>Keep the merge action visible so authors do not confuse approval with release.</li>
        <li>Preserve branch hygiene by using squash, rebase, or merge intentionally.</li>
      </ul>

      <h2>What usually goes wrong</h2>
      <p>
        Teams often optimize for speed in the wrong place. They approve a pull request carefully, then merge it
        casually. That is where stale branches, bypassed checks, and accidental self-approval sneak in.
      </p>

      <h2>Safer merge habits</h2>
      <ul>
        <li>Require the merge action to be performed by someone other than the author for risky branches.</li>
        <li>Re-check the last successful status before merging, not just the last approval timestamp.</li>
        <li>Use a merge queue if several high-value changes land on the same branch every day.</li>
        <li>Document when a merge is allowed to happen outside the normal review flow.</li>
      </ul>

      <h2>The practical rule</h2>
      <p>
        The safest merge tool is not the one with the fewest clicks. It is the one that makes the right action
        easy while keeping the wrong action expensive enough that people notice.
      </p>

      <p>
        <Link href="/blog/pull-request-approval-rules-that-actually-work" className="font-semibold">
          Read the approval rules article →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
