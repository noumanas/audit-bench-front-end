import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'when-github-goes-down-what-actually-breaks')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhenGithubGoesDownWhatActuallyBreaksPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Every few months, a familiar message spreads across engineering Slack channels: &quot;Is GitHub down for
        anyone else?&quot; Within minutes, pull requests stop merging, CI jobs sit queued, and developers refresh
        the GitHub status page like it&apos;s a live sports score. For a few minutes or a few hours, one of the
        most depended-upon platforms in software development simply stops behaving normally — and entire
        companies discover, often in real time, how much of their daily workflow quietly runs through a single
        third-party service.
      </p>

      <p>
        GitHub outages are not rare anomalies. They are a predictable, recurring category of incident — and
        understanding <em>why</em> they happen is the first step toward not being caught flat-footed the next
        time one does.
      </p>

      <h2>GitHub is not one service — it&apos;s many, stitched together</h2>
      <p>
        The instinct when GitHub &quot;goes down&quot; is to imagine a single switch being flipped off. In
        reality, GitHub is a large, distributed system made up of many independently operating components: the
        web application, the Git protocol layer that handles pushes and pulls, the Actions CI/CD infrastructure,
        webhooks, the API, package registries, and authentication services tied into organizational SSO. Each of
        these can degrade or fail on its own, and a full platform-wide outage is often the least common scenario.
        Far more frequent are partial outages — Actions runners backed up processing jobs slowly, webhook
        deliveries delayed by minutes, or search and notifications lagging while core Git operations work fine.
      </p>
      <p>
        This matters because &quot;GitHub is down&quot; rarely means one clean thing. It usually means one
        specific subsystem is unhealthy, and the practical impact on your team depends entirely on which one.
      </p>

      <h2>The recurring root causes</h2>
      <p>
        Looking at the pattern of incidents GitHub has publicly documented over the years, a handful of root
        causes show up again and again.
      </p>
      <p>
        <strong>Database and data-layer issues.</strong> GitHub&apos;s core data — repositories, issues, pull
        requests, permissions — lives in large relational database clusters. A failover that doesn&apos;t
        complete cleanly, a replication lag that causes stale reads, or a migration that locks tables longer than
        expected can ripple outward into slow page loads, failed merges, or inconsistent permission checks across
        the platform.
      </p>
      <p>
        <strong>Network and infrastructure failures.</strong> Like any large service, GitHub depends on load
        balancers, DNS, and internal networking between data centers. A misconfigured routing change, a bad
        certificate rotation, or a hardware failure at a network layer can take down access to entire regions or
        specific services even when the underlying application code is functioning perfectly.
      </p>
      <p>
        <strong>Deployment and configuration errors.</strong> Ironically, one of the most common causes of
        outages at companies that ship software constantly is the software-shipping process itself. A
        configuration change rolled out gradually can behave correctly in early stages and then cause cascading
        failures once it reaches full production traffic. GitHub, despite mature deployment practices, is not
        immune to this — bad config pushes and incomplete rollbacks have caused some of its more memorable
        incidents.
      </p>
      <p>
        <strong>Dependency and third-party cascades.</strong> GitHub relies on external infrastructure providers
        for parts of its stack. When an upstream cloud provider has a regional issue, or a shared piece of
        infrastructure (like a CDN or DNS provider) degrades, the effects can surface on GitHub even though the
        root cause sits entirely outside GitHub&apos;s own codebase.
      </p>
      <p>
        <strong>Traffic spikes and abuse.</strong> Sudden surges in traffic — whether from a viral repository, an
        unusually large CI burst across many organizations at once, or malicious traffic like a DDoS attempt —
        can overwhelm capacity that was provisioned for normal load, degrading response times platform-wide until
        systems can absorb or shed the excess.
      </p>

      <h2>Why the impact feels bigger than &quot;just Git&quot;</h2>
      <p>
        The reason a GitHub outage feels more disruptive than, say, a project management tool going down is
        structural. For most engineering organizations, GitHub isn&apos;t just where code is stored — it&apos;s
        where code review happens, where CI/CD pipelines are triggered, where deployment gates live, and
        increasingly, where single sign-on is anchored for other internal tools. A degradation in one corner of
        that stack can lock developers out of merging, block releases scheduled for that exact window, or even
        prevent access to unrelated internal tools if authentication is tied through GitHub SSO.
      </p>
      <p>
        This is precisely why treating GitHub as &quot;just another external tool&quot; in your incident planning
        is a mistake. It deserves the same seriousness as a database or core infrastructure dependency, because
        for most modern engineering teams, it effectively is one — a point covered in more detail in{' '}
        <Link href="/blog/reducing-single-points-of-failure-in-your-git-workflow" className="font-semibold">
          reducing single points of failure in your git workflow
        </Link>
        .
      </p>

      <h2>What teams can actually do about it</h2>
      <p>
        The uncomfortable truth is that no engineering team can prevent a GitHub outage — it is entirely outside
        their control. What <em>is</em> within a team&apos;s control is how prepared they are when it happens.
        That preparation looks less like technical mitigation and more like organizational clarity, decided in
        advance rather than improvised mid-incident:
      </p>
      <ul>
        <li>Knowing, before anything breaks, who is authorized to declare an incident and where updates get
        posted.</li>
        <li>Having a fast way to check whether an issue is truly GitHub-wide (via the{' '}
        <a href="https://www.githubstatus.com" target="_blank" rel="noopener noreferrer">
          official status page
        </a>
        ) versus something local — a misbehaving webhook, a stuck check run, or a network issue on your own end.</li>
        <li>Defining severity tiers in advance, so a slow Actions queue doesn&apos;t get the same response as a
        full outage of push and pull operations, and so an authentication-related outage — the most disruptive
        kind — automatically triggers broader communication beyond just engineering.</li>
        <li>Pre-approving a manual override path: who can sign off on a manual deploy or a manually reviewed
        merge when the usual automated checks aren&apos;t available, and what gets logged when that happens.</li>
      </ul>
      <p>
        None of this prevents the outage itself. But it is the difference between an incident that resolves in
        twenty calm, well-understood minutes and one that spirals into confusion about who&apos;s allowed to do
        what, right when the team can least afford that confusion. For a step-by-step starting point, see{' '}
        <Link href="/blog/what-to-do-when-github-is-down" className="font-semibold">
          what to do when GitHub is down
        </Link>{' '}
        and{' '}
        <Link href="/blog/github-outage-incident-response-runbook" className="font-semibold">
          writing a GitHub outage incident response runbook
        </Link>
        .
      </p>
      <p>
        GitHub outages will keep happening — the platform is too large and too interconnected for that not to be
        true. The teams that come out the other side with the least disruption aren&apos;t the ones with the
        cleverest workaround; they&apos;re the ones who decided, ahead of time, exactly what they&apos;d do.
      </p>

      <p>
        <Link href="/blog/building-ci-cd-resilient-to-github-outages" className="font-semibold">
          Read about building a CI/CD pipeline that survives a GitHub outage →
        </Link>
      </p>

      <p>
        <Link href="/blog/github-status-monitoring-for-engineering-teams" className="font-semibold">
          See how to monitor GitHub status without getting paged for nothing →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
