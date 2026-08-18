import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'github-status-monitoring-for-engineering-teams')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function GithubStatusMonitoringForEngineeringTeamsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Teams tend to land on one of two extremes with GitHub status monitoring. Either nobody watches it at all,
        and the first sign of trouble is an engineer complaining that pushes are hanging, or someone wires up an
        alert for every status update and the on-call rotation starts getting paged for degraded performance
        notices that never actually affect anyone. Neither extreme is useful. The goal is a signal sized to
        actual impact, not to how alarming the status page happens to look.
      </p>

      <h2>What is worth paging on versus just logging</h2>
      <p>
        A full outage of git push and pull operations, or of the API your CI pipeline depends on, is worth an
        active alert if it is currently blocking your team&apos;s critical path — a release window, an incident
        fix, a customer-facing deadline. A &quot;degraded performance&quot; notice with no visible symptoms on
        your side is worth a log entry and nothing more. The distinction is not the severity label GitHub applies
        to the incident; it is whether your team can currently tell it is happening from the inside.
      </p>

      <h2>Subscribe to the right signal</h2>
      <p>
        Watching a status page manually does not scale, and relying on social media sentiment to notice an
        outage is unreliable and slow. GitHub publishes an RSS/Atom feed and an API for{' '}
        <a href="https://www.githubstatus.com" target="_blank" rel="noopener noreferrer">
          githubstatus.com
        </a>{' '}
        that can be polled or subscribed to directly, which is a far steadier source of truth than waiting for
        someone to notice and post about it.
      </p>

      <h2>Correlate status with your own symptoms before declaring an incident</h2>
      <ul>
        <li>CI jobs queuing up with no jobs starting is a stronger signal than a status page banner alone.</li>
        <li>Webhook deliveries arriving late or not at all, checked against your own webhook logs, confirms
        impact rather than assuming it.</li>
        <li>Pull request checks stuck in a pending state across multiple, unrelated repositories points at the
        platform, not at your own configuration.</li>
        <li>A single failed request is noise; a pattern across many requests, correlated with a status page
        update, is signal.</li>
      </ul>

      <h2>Route the alert to the right audience</h2>
      <p>
        A GitHub degradation rarely needs to wake up the entire on-call rotation the way a production outage of
        your own service does. A dedicated, low-noise channel visible to whoever owns release timing and CI
        health is usually the right destination — enough visibility that the team notices and adjusts
        expectations, without training everyone to associate GitHub notifications with urgent pages that turn out
        to be nothing.
      </p>

      <h2>Checklist for a lightweight monitor setup</h2>
      <ol>
        <li>A subscription to GitHub&apos;s official status feed exists somewhere other than a person&apos;s
        memory to check the page occasionally.</li>
        <li>Alerts are tiered — full outages affecting your critical path get an active notification; minor
        degradations get logged quietly.</li>
        <li>Internal symptoms (stuck CI, delayed webhooks) are checked against the status feed before anyone
        declares an incident.</li>
        <li>The alert routes to a channel matched to who actually needs to act on it, not the broadest possible
        audience by default.</li>
      </ol>

      <p>
        <Link href="/blog/code-security-review-signals-that-matter" className="font-semibold">
          Read about the code security review signals that matter →
        </Link>
      </p>

      <p>
        <Link href="/blog/github-outage-incident-response-runbook" className="font-semibold">
          See how to write a GitHub outage incident response runbook →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
