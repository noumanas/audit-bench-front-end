import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { H2, H3 } from '@/components/docs/blocks';

export const metadata = docMetadata('troubleshooting');

export default function Troubleshooting() {
  return (
    <DocPage slug="troubleshooting" updated="November 1, 2026">
      <H2>No review on a pull request</H2>
      <ul>
        <li>
          <strong>It’s a draft.</strong> Drafts aren’t reviewed. Mark it ready for review (the GitHub App reviews it
          then), or push a commit after.
        </li>
        <li>
          <strong>The App can’t see the repository.</strong> On GitHub, open{' '}
          <strong>Settings → GitHub Apps → Audit Bench Ai → Configure</strong> for the account or organization and check
          the repository is selected.
        </li>
        <li>
          <strong>Automatic review is off.</strong> In <Link href="/app/repository">Repository scan</Link>, check the switch on
          the installation (GitHub App) or the webhook (GitLab, Bitbucket, GitHub webhook).
        </li>
        <li>
          <strong>The installation isn’t linked to your account.</strong> If you installed the App from GitHub directly,
          open Repository scan and claim it.
        </li>
        <li>
          <strong>A bot opened the pull request.</strong> Pull requests from bots such as Dependabot are skipped.
        </li>
        <li>
          <strong>That commit was already reviewed.</strong> Each commit is reviewed once. Click Re-run, or push a new
          commit.
        </li>
      </ul>

      <H2>“Review didn’t finish”</H2>
      <p>The check closed as neutral with a reason:</p>
      <H3>“Couldn’t review this commit because of a temporary problem”</H3>
      <p>
        Usually a dropped connection to GitHub or the AI provider. Click <strong>Re-run</strong> on the check, or push a
        new commit. If it keeps happening on the same pull request, <Link href="/contact">tell us</Link> the repository and pull
        request number.
      </p>
      <H3>“Skipped the automatic review of this commit”</H3>
      <p>
        You’ve reached a plan limit, or the account doesn’t have access to the repository. The message gives the reason.
        See <Link href="/docs/plans">Plans and limits</Link>.
      </p>

      <H2>GitLab or Bitbucket webhook not firing</H2>
      <ul>
        <li>
          Check the webhook’s recent deliveries in GitLab or Bitbucket. A <strong>403</strong> means the secret doesn’t
          match: delete the webhook in Audit Bench Ai, create a new one and paste the new secret.
        </li>
        <li>
          On GitLab, the repository identifier must be the numeric project ID, and <strong>Merge request events</strong>{' '}
          must be ticked.
        </li>
        <li>
          On Bitbucket, the identifier is <code>workspace/repo-slug</code>, with the{' '}
          <strong>Pull Request: Created</strong> and <strong>Updated</strong> triggers.
        </li>
        <li>Check your access token hasn’t expired. The app asks for a new one if it has.</li>
      </ul>

      <H2>Too many comments</H2>
      <ul>
        <li>React 👎 to findings you don’t want; after a couple, that kind of finding stops in that repository.</li>
        <li>
          Raise the minimum confidence and turn off optional suggestions in{' '}
          <Link href="/docs/configuration#strictness">strictness</Link>.
        </li>
        <li>
          Add an <strong>Ignore files</strong> rule for generated code, or a <strong>Don’t flag</strong> rule for a
          convention your team has decided on.
        </li>
      </ul>

      <H2>A finding is wrong</H2>
      <p>
        Reply to it with the reason. Audit Bench Ai rechecks the code and withdraws the finding if you’re right. See{' '}
        <Link href="/docs/conversations">Replies and reactions</Link>.
      </p>

      <H2>The check isn’t offered in branch protection</H2>
      <p>
        GitHub only lists checks it has seen in the last week. Open a small pull request, wait for the{' '}
        <strong>Audit Bench Ai</strong> check, then add it. See <Link href="/docs/required-check">Make it a required check</Link>.
      </p>

      <H2>Still stuck?</H2>
      <p>
        <Link href="/contact">Contact us</Link> with the repository, the pull request link and what you expected. We read every
        message.
      </p>
    </DocPage>
  );
}
