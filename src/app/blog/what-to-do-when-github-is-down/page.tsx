import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'what-to-do-when-github-is-down')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhatToDoWhenGithubIsDownPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        GitHub outages are infrequent, but they are not rare enough to plan around ignoring. When git operations,
        the web UI, Actions, or the API go down, &quot;let&apos;s just wait it out&quot; is not actually a plan —
        it is what happens by default when nobody has one. Deadlines do not pause for a status page turning
        orange, and the difference between a team that stays calm and productive during an outage and one that
        scrambles is almost always preparation, not luck.
      </p>

      <h2>First, figure out what is actually down</h2>
      <p>
        GitHub is not one system — it is git operations over SSH and HTTPS, the web UI, the REST and GraphQL
        APIs, Actions, webhooks, Packages, and Pages, each of which can degrade independently. Before reacting,
        check{' '}
        <a href="https://www.githubstatus.com" target="_blank" rel="noopener noreferrer">
          githubstatus.com
        </a>{' '}
        to see which specific component is affected. A team that assumes &quot;GitHub is down&quot; when only
        Actions is degraded will stop doing things — like reviewing code locally — that were never actually
        blocked.
      </p>

      <h2>What still works when GitHub is unreachable</h2>
      <ul>
        <li>Every local clone already has the full commit history — you do not need GitHub.com to look at past
        commits, blame a line, or check out an old branch.</li>
        <li>You can commit, branch, and merge locally without pushing anything, and keep working exactly as if
        you were offline.</li>
        <li>Code review can still happen — diffing branches locally, sharing a patch file, or screen-sharing a
        review — even if the pull request UI is unavailable.</li>
        <li>Tests can run locally even if Actions cannot run them, as long as your test suite does not itself
        depend on a GitHub-hosted service.</li>
        <li>Deploys that do not depend on a GitHub Actions trigger can often still run manually from a local
        machine or a separate CI system, if one exists.</li>
      </ul>

      <h2>Communicate before people start improvising badly</h2>
      <p>
        The fastest way to turn a GitHub outage into a bigger mess is silence. Once a few engineers each start
        independently working around the same problem — one pushing to a personal mirror, another skipping
        review entirely, a third trying to trigger a deploy through an untested path — you end up reconciling
        divergent, uncoordinated changes on top of an outage that has already ended. One person should post a
        single, visible status update: what is down, what still works, and what the team should do in the
        meantime. Update it as the situation changes, and say clearly when it is safe to resume normal process.
      </p>

      <h2>What to avoid doing during an outage</h2>
      <ol>
        <li>Do not disable branch protection or required reviews just to get a merge through — the outage will
        end, but a bad merge that skipped review will not undo itself.</li>
        <li>Do not rush past security checks because the tooling that normally runs them is unavailable; a manual
        review by a human is a reasonable substitute, skipping review entirely is not.</li>
        <li>Do not force-push to try to fix a sync issue you do not fully understand yet — outages create
        confusing partial states, and a force-push can make an eventual reconciliation much harder.</li>
        <li>Do not assume a slow response means everything is down — retry once, check the status page, and avoid
        hammering the API with retries that make the underlying congestion worse.</li>
      </ol>

      <h2>After it comes back, reconcile carefully</h2>
      <p>
        Once GitHub is fully restored, resist the urge to immediately merge everything that queued up during the
        outage. Check for duplicate work, branches that diverged in incompatible ways, and any manual workaround
        that was applied during the outage window (a manual deploy, a locally-approved merge) that now needs to
        be reflected properly in the normal system of record. A short, calm reconciliation pass prevents an
        outage from quietly becoming a second incident a week later.
      </p>

      <p>
        <Link href="/blog/github-ai-code-review" className="font-semibold">
          Read about GitHub AI code review →
        </Link>
      </p>

      <p>
        <Link href="/blog/how-to-stop-merging-bad-code" className="font-semibold">
          See how to stop merging bad code →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
