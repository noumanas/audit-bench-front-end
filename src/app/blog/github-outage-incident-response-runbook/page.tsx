import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'github-outage-incident-response-runbook')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function GithubOutageIncidentResponseRunbookPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Most engineering teams have a runbook for a database failover, a bad deploy that needs rolling back, or a
        spike in error rates. Far fewer have one for &quot;GitHub is down,&quot; even though GitHub is often a
        harder dependency to route around than the database — it is where the code lives, where review happens,
        where CI runs, and for many teams, where authentication is anchored through SSO. A dependency that
        central deserves its own runbook entry, not an assumption that someone will figure it out live.
      </p>

      <h2>Why GitHub deserves a dedicated runbook entry</h2>
      <p>
        A runbook exists to remove decisions from the moment of highest stress. During an actual outage, nobody
        wants to be debating for the first time whether it is safe to bypass a required check, who has the
        authority to approve a manual deploy, or where the team should even be posting updates. A GitHub-specific
        runbook answers those questions in advance, when everyone is calm and thinking clearly, so the actual
        incident is just execution.
      </p>

      <h2>What the runbook should specify</h2>
      <ul>
        <li>Who is authorized to declare a GitHub-outage incident, and where the team posts and follows status
        updates (a specific channel, not wherever people happen to be talking).</li>
        <li>Which sources to check to confirm scope — the official status page, and any internal signals like
        webhook delivery delays or stuck check runs — before assuming the worst.</li>
        <li>An escalation path for the specific case where the outage overlaps a planned release window or a
        customer-facing deadline.</li>
        <li>Who has the authority to approve a manual override — a manual deploy, a manually-approved merge — and
        what record needs to be kept of that decision.</li>
      </ul>

      <h2>Severity tiers make the response proportionate</h2>
      <p>
        Not every GitHub incident calls for the same response. A useful runbook defines a few tiers and a
        default action for each: degraded Actions performance with jobs still completing, just slower, usually
        warrants patience and a status note, nothing more. A full outage of git push and pull operations is more
        serious and may justify pausing merges until service is restored, since work would otherwise queue up
        awkwardly. An outage that affects authentication or SSO is the most disruptive, since it can lock people
        out of tools well beyond GitHub itself, and may need broader communication across the company, not just
        the engineering team.
      </p>

      <h2>Predefined fallback actions per tier</h2>
      <ol>
        <li>Log-only: note the degradation, no process change, resume normal work.</li>
        <li>Pause and wait: hold merges and deploys, keep working locally, check status on a fixed interval.</li>
        <li>Manual override: invoke the pre-built manual deploy or manual-review path documented for exactly this
        situation, with the sign-off it requires.</li>
        <li>Broad incident: treat it like any other company-wide incident, with the same communication and
        escalation the team already uses for internal outages.</li>
      </ol>

      <h2>Rehearse it like any other incident</h2>
      <p>
        A runbook nobody has read is barely better than no runbook at all. The same way teams run failover drills
        for a database or practice a deploy rollback, it is worth occasionally walking through the GitHub-outage
        runbook in a calm moment — confirming the manual deploy path still works, that the right people still have
        the access it assumes, and that the escalation contacts are current. An outage is a bad time to discover
        the runbook refers to a process that quietly changed six months ago.
      </p>

      <p>
        <Link href="/blog/secure-code-review-workflow" className="font-semibold">
          Read about a secure code review workflow teams will actually use →
        </Link>
      </p>

      <p>
        <Link href="/blog/what-to-do-when-github-is-down" className="font-semibold">
          See the practical playbook for what to do when GitHub is down →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
