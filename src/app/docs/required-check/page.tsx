import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Step, Steps, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('required-check');

export default function RequiredCheckGuide() {
  return (
    <DocPage slug="required-check" updated="November 1, 2026">
      <p>
        Turn the review’s verdict into a merge gate: pull requests with a blocking issue can’t be merged until it’s
        fixed. It takes about two minutes.
      </p>

      <H2>Before you start</H2>
      <ul>
        <li>
          The Audit Bench Ai GitHub App is installed on the repository. See <Link href="/docs/github">GitHub</Link>.
        </li>
        <li>
          It has reviewed at least one pull request there. GitHub only lists checks it has seen recently, so open any
          small pull request first and wait for the <strong>Audit Bench Ai</strong> check to appear on it.
        </li>
        <li>You’re an admin of the repository or the organization.</li>
      </ul>

      <H2>Option A: a ruleset (recommended)</H2>
      <Steps>
        <Step title="Create a branch ruleset">
          <p>
            In the repository, open <strong>Settings → Rules → Rulesets</strong> and choose{' '}
            <strong>New ruleset → New branch ruleset</strong>.
          </p>
        </Step>
        <Step title="Name and enable it">
          <p>
            Name it, for example “Require Audit Bench Ai”, and set <strong>Enforcement status</strong> to{' '}
            <strong>Active</strong>.
          </p>
        </Step>
        <Step title="Choose the branches">
          <p>
            Under <strong>Target branches</strong>, choose <strong>Add target → Include default branch</strong>, or add
            the branches you protect.
          </p>
        </Step>
        <Step title="Require the check">
          <p>
            Tick <strong>Require status checks to pass</strong>, then <strong>Add checks</strong>, type{' '}
            <code>Audit Bench Ai</code> and select it. Click <strong>Create</strong>.
          </p>
        </Step>
      </Steps>
      <p>
        Organization admins can do the same once for every repository under the organization’s{' '}
        <strong>Settings → Repository → Rulesets</strong>.
      </p>

      <H2>Option B: classic branch protection</H2>
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

      <H2>What the check means</H2>
      <Table
        head={['Result', 'Meaning', 'Merge']}
        rows={[
          [
            <strong key="f">Failure</strong>,
            'A critical finding, a high-severity security finding, merge conflicts, failing CI or a likely secret',
            'Blocked',
          ],
          [<strong key="n">Neutral</strong>, 'Issues worth a look, nothing blocking', 'Allowed'],
          [<strong key="s">Success</strong>, 'No issues in the changed lines', 'Allowed'],
        ]}
      />
      <Callout type="note">
        A review that couldn’t finish, because of a temporary error or a plan limit, closes as neutral, so it never
        locks a pull request.
      </Callout>

      <H2>When the check fails</H2>
      <ul>
        <li>Fix the issue and push. Every new commit is reviewed again and the check updates by itself.</li>
        <li>
          If the finding is wrong, reply to its comment explaining why. Audit Bench Ai rechecks and answers, and learns
          to stop raising that kind of comment. Then click <strong>Re-run</strong> on the check to review the latest
          commit again.
        </li>
        <li>
          In an emergency, repository admins can bypass the rule if your ruleset allows it (add them under{' '}
          <strong>Bypass list</strong>).
        </li>
      </ul>
    </DocPage>
  );
}
