import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Step, Steps } from '@/components/docs/blocks';

export const metadata = docMetadata('gitlab');

export default function GitlabDocs() {
  return (
    <DocPage slug="gitlab" updated="November 1, 2026">
      <p>
        On GitLab, Audit Bench Ai reviews merge requests through a project webhook and posts the review with your access
        token.
      </p>

      <H2>Connect</H2>
      <Steps>
        <Step title="Create an access token">
          <p>
            In GitLab, create a personal access token with the <code>read_repository</code> scope to read code, and{' '}
            <code>api</code> so Audit Bench Ai can post review comments. You can also sign in with GitLab instead.
          </p>
        </Step>
        <Step title="Add it in the app">
          <p>
            In <Link href="/app/repository">Repository scan</Link>, choose GitLab and paste the token. It’s stored encrypted.
          </p>
        </Step>
        <Step title="Create the webhook in Audit Bench Ai">
          <p>
            Under <strong>Webhooks</strong>, add one for GitLab. The repository identifier is the project’s numeric{' '}
            <strong>Project ID</strong>, shown on the project’s overview page. Tick{' '}
            <strong>Automatically review new PRs/MRs</strong>. Copy the payload URL and the secret; the secret is
            shown only once.
          </p>
        </Step>
        <Step title="Add the webhook in GitLab">
          <p>
            In the project, open <strong>Settings → Webhooks → Add new webhook</strong>. Paste the URL, paste the secret
            as the <strong>Secret token</strong>, and tick <strong>Merge request events</strong> and{' '}
            <strong>Comments</strong>. Save.
          </p>
        </Step>
      </Steps>

      <H2>When a review runs</H2>
      <p>
        When a merge request is opened, reopened or updated with new commits. Draft merge requests are skipped, and a
        commit that’s already been reviewed isn’t reviewed again.
      </p>

      <H2>Asking questions</H2>
      <p>
        Mention <code>@auditbench</code> in a merge request comment and it answers in the discussion.
      </p>

      <Callout type="note" title="What’s different from GitHub">
        GitLab has no equivalent of the Audit Bench Ai check, so there’s no merge gate or Re-run button; push a commit
        to review again. Recheck replies inside a finding’s thread are GitHub-only for now. Repeated findings are still
        held back across pushes.
      </Callout>

      <H2>Self-managed GitLab</H2>
      <p>
        The hosted service connects to gitlab.com. If you run your own GitLab instance, <Link href="/contact">contact us</Link>{' '}
        about a dedicated or self-hosted setup.
      </p>
    </DocPage>
  );
}
