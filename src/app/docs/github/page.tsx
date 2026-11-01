import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Step, Steps, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('github');

export default function GithubDocs() {
  return (
    <DocPage slug="github" updated="November 1, 2026">
      <p>
        The Audit Bench Ai GitHub App is the recommended way to use Audit Bench Ai on GitHub. Reviews post as the{' '}
        <strong>Audit Bench Ai</strong> bot, with a check you can make required and a Re-run button.
      </p>

      <H2>Install the App</H2>
      <Steps>
        <Step title="Connect GitHub in the app">
          <p>
            Open <Link href="/app/repository">Repository scan</Link> and connect your GitHub account. This is how Audit Bench
            Ai knows which installations belong to you.
          </p>
        </Step>
        <Step title="Click Install on GitHub">
          <p>
            On the <strong>Audit Bench Ai GitHub App</strong> card, click <strong>Install on GitHub</strong>, choose
            the account or organization and the repositories, and confirm.
          </p>
        </Step>
        <Step title="Check the installation">
          <p>
            GitHub sends you back to the app, where the installation is listed with an{' '}
            <strong>automatic review</strong> switch. Leave it on to review every new pull request.
          </p>
        </Step>
      </Steps>

      <Callout type="note" title="Installed straight from GitHub?">
        If you installed the App from its GitHub page instead of from the app, Audit Bench Ai asks you to claim the
        installation when you next open Repository scan. Only the account it was installed on, or an admin of that
        organization, can claim it.
      </Callout>

      <H2>When a review runs</H2>
      <ul>
        <li>A pull request is opened or reopened.</li>
        <li>New commits are pushed to it.</li>
        <li>A draft is marked <strong>Ready for review</strong>.</li>
        <li>Someone clicks <strong>Re-run</strong> on the Audit Bench Ai check.</li>
      </ul>
      <p>Nothing runs for:</p>
      <ul>
        <li>Draft pull requests.</li>
        <li>A commit that has already been reviewed (GitHub sometimes delivers the same event twice).</li>
        <li>Pull requests opened by bots.</li>
        <li>Installations with automatic review switched off, or that GitHub has suspended.</li>
      </ul>

      <H2>Permissions</H2>
      <p>The App asks for the least it needs to read code and leave a review:</p>
      <Table
        head={['Permission', 'Access', 'Used for']}
        rows={[
          ['Contents', 'Read', 'Reading the changed files and the code that calls them'],
          ['Pull requests', 'Read and write', 'Posting the review, inline comments and replies'],
          ['Checks', 'Read and write', 'The Audit Bench Ai check and its annotations'],
          ['Metadata', 'Read', 'Required by GitHub for every App'],
        ]}
      />
      <p>
        It listens for pull request, review comment, issue comment and check run events. It can’t push code, change
        settings, or see repositories you didn’t select.
      </p>

      <H2>The Audit Bench Ai check</H2>
      <p>
        Each reviewed commit gets a check named <strong>Audit Bench Ai</strong>. It shows “Reviewing…” while it runs,
        then one of:
      </p>
      <Table
        head={['Result', 'When']}
        rows={[
          [
            <strong key="f">Failure</strong>,
            'A critical finding, a high-severity security finding, merge conflicts, failing CI, or a likely secret added',
          ],
          [<strong key="n">Neutral</strong>, 'High or medium findings worth a look, but nothing blocking. Counts as passing'],
          [<strong key="s">Success</strong>, 'No issues in the changed lines'],
        ]}
      />
      <p>
        If a review can’t finish, because of a temporary error or a plan limit, the check closes as neutral with the
        reason, so it never blocks a merge or spins forever. Up to 50 findings also appear as annotations in the{' '}
        <strong>Files changed</strong> tab.
      </p>

      <H3>Re-run</H3>
      <p>
        Click <strong>Re-run</strong> on the check, in the pull request’s <strong>Checks</strong> tab, to review the
        latest commit again. This is useful after changing your rules, or if a review didn’t finish.
      </p>

      <H2>Asking about the whole pull request</H2>
      <p>
        Mention <code>@auditbench</code> in a pull request comment to ask a question, for example{' '}
        <em>“@auditbench is this migration safe to run on a live table?”</em>. It answers in the conversation, and if
        the answer is about a specific spot in the code it also opens a thread there. See{' '}
        <Link href="/docs/conversations">Replies and reactions</Link>.
      </p>

      <H2>Without the App: a repository webhook</H2>
      <p>
        If you can’t install Apps on an organization, you can connect a single repository with a webhook and a personal
        access token instead. Reviews then post as your own GitHub account, marked as automated.
      </p>
      <ol>
        <li>
          In <Link href="/app/repository">Repository scan</Link>, connect a GitHub token with the <code>repo</code> scope (or a
          fine-grained token with Contents: read).
        </li>
        <li>
          Under <strong>Webhooks</strong>, add a webhook for the repository (<code>owner/repo</code>). Copy the payload
          URL and the secret; the secret is shown only once.
        </li>
        <li>
          On GitHub, open the repository’s <strong>Settings → Webhooks → Add webhook</strong>. Paste the URL, set the
          content type to <code>application/json</code>, paste the secret, and choose{' '}
          <strong>Pull requests</strong>, <strong>Issue comments</strong> and <strong>Pull request review comments</strong>.
        </li>
      </ol>
      <Callout type="warning">
        The webhook route doesn’t review a draft when it’s marked ready, and has no Re-run button. Push a commit to
        review again.
      </Callout>
    </DocPage>
  );
}
