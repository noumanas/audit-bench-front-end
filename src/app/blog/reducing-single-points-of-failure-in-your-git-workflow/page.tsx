import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'reducing-single-points-of-failure-in-your-git-workflow')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function ReducingSinglePointsOfFailureInYourGitWorkflowPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Most teams centralize everything in one hosted git provider — source control, code review, CI, package
        hosting, and often authentication — because it is convenient, and for years at a time, that convenience
        carries no visible cost. The cost shows up all at once, during the one outage or account-level incident
        that touches every one of those things simultaneously, because they were never actually independent
        systems. They were one system wearing several hats.
      </p>

      <h2>Git itself is already distributed — most teams don&apos;t use that</h2>
      <p>
        It is easy to forget that git was designed to be distributed. Every developer&apos;s local clone already
        contains the full commit history of every branch they have fetched. That means a huge amount of
        resilience already exists on every laptop in the company, unused, because the team&apos;s process assumes
        the hosted remote is always the only place history lives. Recognizing this changes how much an outage
        actually threatens: history is not at risk, only the shared coordination point is.
      </p>

      <h2>Mirrors are cheap insurance</h2>
      <p>
        Pushing a mirror of critical repositories to a second git host, or to a self-hosted git server, costs
        very little to set up and almost nothing to maintain once it is automated. It does not need to be part of
        daily workflow — nobody has to open pull requests there, review code there, or run CI there. It only needs
        to exist, current enough to be useful, for the day the primary host is unavailable and someone needs read
        access to the latest code right now.
      </p>

      <h2>Don&apos;t centralize identity on the same provider you centralize code on</h2>
      <p>
        A common but easy-to-miss risk is wiring single sign-on for many internal tools through the same account
        that hosts your code. When that happens, an incident with your git host&apos;s authentication system does
        not just block git operations — it can lock people out of chat, documentation, deployment dashboards, and
        anything else tied to the same identity provider. Keeping the blast radius of a single vendor&apos;s
        incident contained to that vendor is a deliberate architectural choice, not something that happens by
        default.
      </p>

      <h2>CI runners and secrets shouldn&apos;t be trapped behind one dashboard</h2>
      <ul>
        <li>Store deploy credentials and API keys in a secret manager that your team can access independently of
        your git host&apos;s own secret storage.</li>
        <li>Keep a record — even a simple, occasionally-updated document — of which credentials exist, where they
        live, and who can retrieve them without going through the primary provider&apos;s UI.</li>
        <li>If your CI system is tightly coupled to your git host, know in advance what a manual build-and-deploy
        path looks like, even if you rarely use it.</li>
      </ul>

      <h2>Checklist for reducing single points of failure</h2>
      <ol>
        <li>Critical repositories are mirrored somewhere other than your primary git host.</li>
        <li>Identity and authentication for other internal tools do not fully collapse if your git host&apos;s
        auth is degraded.</li>
        <li>Secrets and deploy credentials are retrievable without depending on the git host&apos;s own secret
        storage.</li>
        <li>At least one person on the team has actually tested pulling code and deploying from the fallback
        path, not just documented it.</li>
      </ol>

      <h2>Resilience is a property you build, not one you inherit</h2>
      <p>
        None of this requires distrusting your git provider or duplicating your entire workflow elsewhere. It
        requires treating a hosted, third-party dependency the way you would treat any other single point of
        failure in your architecture: acceptable to depend on, as long as you have thought through what happens
        the day it is unavailable, rather than discovering the answer live.
      </p>

      <p>
        <Link href="/blog/security-by-design-for-web-apps" className="font-semibold">
          Read about security by design for web apps →
        </Link>
      </p>

      <p>
        <Link href="/blog/building-ci-cd-resilient-to-github-outages" className="font-semibold">
          See how to build a CI/CD pipeline that survives a GitHub outage →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
