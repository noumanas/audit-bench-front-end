import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Make Audit Bench Ai a required check',
  description:
    'A 2-minute guide to turning Audit Bench Ai’s pull request verdict into a merge gate with GitHub branch protection or rulesets.',
  alternates: { canonical: '/docs/required-check' },
};

export default function RequiredCheckGuide() {
  return (
    <LegalPage
      kicker="Guide · 2 minutes"
      title="Make Audit Bench Ai a required check"
      intro="Turn the review’s verdict into a merge gate: pull requests with a blocking issue can’t be merged until it’s fixed."
      updated="October 22, 2026"
    >
      <h2>Before you start</h2>
      <ul>
        <li>
          The Audit Bench Ai GitHub App is installed on the repository (in the app: Repository scan → GitHub → Install
          on GitHub).
        </li>
        <li>
          It has reviewed at least one pull request there. GitHub only lists checks it has seen recently, so open any
          small PR first and wait for the <strong>Audit Bench Ai</strong> check to appear on it.
        </li>
        <li>You’re an admin of the repository (or the organization).</li>
      </ul>

      <h2>Option A: a ruleset (recommended)</h2>
      <ol>
        <li>
          In the repository, open <strong>Settings → Rules → Rulesets</strong> and choose{' '}
          <strong>New ruleset → New branch ruleset</strong>.
        </li>
        <li>
          Name it, for example “Require Audit Bench Ai”, and set <strong>Enforcement status</strong> to{' '}
          <strong>Active</strong>.
        </li>
        <li>
          Under <strong>Target branches</strong>, choose <strong>Add target → Include default branch</strong> (or add
          the branches you protect).
        </li>
        <li>
          Tick <strong>Require status checks to pass</strong>, then <strong>Add checks</strong>, type{' '}
          <code>Audit Bench Ai</code> and select it.
        </li>
        <li>
          Click <strong>Create</strong>.
        </li>
      </ol>
      <p>
        Organization admins can do the same once for every repository under the organization’s{' '}
        <strong>Settings → Repository → Rulesets</strong>.
      </p>

      <h2>Option B: classic branch protection</h2>
      <ol>
        <li>
          In the repository, open <strong>Settings → Branches</strong> and choose{' '}
          <strong>Add classic branch protection rule</strong>.
        </li>
        <li>
          Enter the branch name pattern, for example <code>main</code>.
        </li>
        <li>
          Tick <strong>Require status checks to pass before merging</strong>, search for <code>Audit Bench Ai</code> and
          select it.
        </li>
        <li>
          Click <strong>Create</strong>.
        </li>
      </ol>

      <h2>What the check means</h2>
      <ul>
        <li>
          <strong>Failure:</strong> a critical issue in the changed lines. The pull request can’t merge until it’s
          fixed.
        </li>
        <li>
          <strong>Neutral:</strong> issues worth a look, but nothing blocking. GitHub treats this as passing, so the
          merge isn’t held up.
        </li>
        <li>
          <strong>Success:</strong> no issues in the changed lines.
        </li>
      </ul>

      <h2>When the check fails</h2>
      <ul>
        <li>Fix the issue and push. Every new commit is reviewed again and the check updates by itself.</li>
        <li>
          If the finding is wrong, reply to its comment explaining why. Audit Bench Ai rechecks and answers, and it
          learns to stop raising that kind of comment. Then click <strong>Re-run</strong> on the check in the pull
          request’s <strong>Checks</strong> tab to review the latest commit again.
        </li>
        <li>
          In an emergency, repository admins can bypass the rule if your ruleset allows it (add them under{' '}
          <strong>Bypass list</strong>).
        </li>
      </ul>

      <h2>Questions</h2>
      <p>
        See how Audit Bench Ai handles your code on the <Link href="/security">Security &amp; Trust</Link> page, or{' '}
        <Link href="/contact">contact us</Link>.
      </p>
    </LegalPage>
  );
}
