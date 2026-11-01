import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('plans');

export default function PlansDocs() {
  return (
    <DocPage slug="plans" updated="November 1, 2026">
      <p>
        Every account starts on the Free plan. Paid plans raise your daily and monthly limits and add features. Current
        prices and limits are on the <Link href="/pricing">Pricing page</Link>.
      </p>

      <H2>The plans</H2>
      <Table
        head={['Plan', 'Best for', 'Adds']}
        rows={[
          ['Free', 'Trying it on a personal project', 'Pull request reviews and one repository'],
          ['Pro', 'Individual developers and small projects', 'Higher limits, unlimited repositories, more repository scans'],
          ['Team', 'Teams sharing one plan', 'Pooled limits for every member, shared rules and strictness, Alignment Lab'],
          ['Enterprise', 'Larger organizations', 'Unlimited reviews and scans, due diligence reports, custom terms'],
        ]}
      />

      <H2>What counts toward your limits</H2>
      <ul>
        <li>
          <strong>Counts:</strong> each AI review: a pull request review, a recheck reply, a file reviewed in VS Code or
          the CLI, and repository scans that use the AI.
        </li>
        <li>
          <strong>Free:</strong> the local checks, results served from cache (re-reviewing unchanged code), and the
          public scan.
        </li>
      </ul>
      <p>
        Limits are daily and monthly. On a Team plan, every member draws from the team’s shared allowance. You can see
        your usage in the app, with <code>auditbench status</code> in the CLI, or under Account &amp; Usage in VS Code.
      </p>

      <H2>When you reach a limit</H2>
      <ul>
        <li>The pull request gets a short comment saying the review was skipped and why.</li>
        <li>The Audit Bench Ai check closes as neutral, so it doesn’t block merging.</li>
        <li>The CLI and VS Code show the limit and when it resets.</li>
      </ul>
      <p>Reviews start again automatically when the limit resets, or straight away after an upgrade.</p>

      <H2>Upgrading</H2>
      <p>
        Request a plan from the <strong>Plan</strong> panel in the app. You’ll be shown how to pay; once the payment is
        confirmed, the plan is switched on for your account. When a paid plan ends, the account returns to Free; your
        reports and rules are kept.
      </p>
      <Callout type="note" title="Open source and larger teams">
        Maintainers of public open-source projects and teams with specific needs can{' '}
        <Link href="/contact">contact us</Link> about a plan.
      </Callout>
    </DocPage>
  );
}
