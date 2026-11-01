import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, Card, Cards, H2, Step, Steps } from '@/components/docs/blocks';

export const metadata = docMetadata('quickstart');

export default function Quickstart() {
  return (
    <DocPage slug="quickstart" updated="November 1, 2026">
      <p>
        This guide gets Audit Bench Ai reviewing pull requests on a GitHub repository. On GitLab or Bitbucket, follow{' '}
        <Link href="/docs/gitlab">GitLab</Link> or <Link href="/docs/bitbucket">Bitbucket</Link> instead; the steps after
        connecting are the same.
      </p>

      <H2>Set up</H2>
      <Steps>
        <Step title="Create an account">
          <p>
            <Link href="/signup">Sign up</Link> with GitHub, Google or email. Every account starts on the Free plan; no card
            needed.
          </p>
        </Step>
        <Step title="Connect your GitHub account">
          <p>
            In the app, open <strong>Repository scan</strong> and connect GitHub. Audit Bench Ai uses this to know which
            GitHub account and organizations are yours.
          </p>
        </Step>
        <Step title="Install the GitHub App">
          <p>
            On the same page, the <strong>Audit Bench Ai GitHub App</strong> card has an{' '}
            <strong>Install on GitHub</strong> button. Choose your personal account or an organization, then{' '}
            <strong>All repositories</strong> or the ones you pick. GitHub sends you back to the app when it’s done.
          </p>
          <p>
            Installing on an organization needs an organization owner, or an admin who can approve the request on
            GitHub.
          </p>
        </Step>
        <Step title="Open a pull request">
          <p>
            Open any non-draft pull request on a repository the App can see, or push to an existing one. An{' '}
            <strong>Audit Bench Ai</strong> check appears straight away showing “Reviewing…”.
          </p>
        </Step>
        <Step title="Read the review">
          <p>
            In one to two minutes you’ll have a summary comment, inline comments on the lines that matter and a check
            result. <Link href="/docs/reviews">Reading a review</Link> explains each part.
          </p>
        </Step>
      </Steps>

      <Callout type="note" title="Draft pull requests">
        Drafts aren’t reviewed. With the GitHub App, marking a draft <strong>Ready for review</strong> starts a review
        automatically.
      </Callout>

      <H2>Make the most of it</H2>
      <ul>
        <li>
          <strong>Write down your conventions.</strong> Add an <code>auditbench.md</code> file to the repository, or
          rules on the Rules page. See <Link href="/docs/configuration">Rules and strictness</Link>.
        </li>
        <li>
          <strong>Talk back.</strong> Reply to a finding you disagree with; it rechecks the code. React 👍 or 👎 so it
          learns what your team cares about. See <Link href="/docs/conversations">Replies and reactions</Link>.
        </li>
        <li>
          <strong>Gate merges.</strong> Make the check required so blocking issues can’t be merged. See{' '}
          <Link href="/docs/required-check">Make it a required check</Link>.
        </li>
        <li>
          <strong>Catch problems earlier.</strong> Run the same review in your editor or terminal with the{' '}
          <Link href="/docs/vscode">VS Code extension</Link> or the <Link href="/docs/cli">CLI</Link>.
        </li>
      </ul>

      <H2>If no review appears</H2>
      <p>
        Check that the pull request isn’t a draft, that the App is installed on that repository, and that automatic
        review is switched on for the installation. <Link href="/docs/troubleshooting">Troubleshooting</Link> covers the rest.
      </p>

      <Cards>
        <Card href="/docs/github" title="GitHub in depth">
          Permissions, events, re-runs and the manual-webhook option.
        </Card>
        <Card href="/docs/how-it-works" title="How reviews work">
          What runs locally, what goes to the AI, and why findings are calibrated.
        </Card>
      </Cards>
    </DocPage>
  );
}
