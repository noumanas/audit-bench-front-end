import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Step, Steps } from '@/components/docs/blocks';

export const metadata = docMetadata('bitbucket');

export default function BitbucketDocs() {
  return (
    <DocPage slug="bitbucket" updated="November 1, 2026">
      <p>
        On Bitbucket Cloud, Audit Bench Ai reviews pull requests through a repository webhook and posts the review with
        your API token.
      </p>

      <H2>Connect</H2>
      <Steps>
        <Step title="Create an API token">
          <p>
            In your Atlassian account settings, create an API token with these scopes:{' '}
            <code>read:user:bitbucket</code>, <code>read:repository:bitbucket</code> and{' '}
            <code>read:pullrequest:bitbucket</code>. Add <code>write:repository:bitbucket</code> to get a pass/fail
            build status on each pull request.
          </p>
        </Step>
        <Step title="Add it in the app">
          <p>
            In <Link href="/app/repository">Repository scan</Link>, choose Bitbucket and paste the token. It’s stored
            encrypted.
          </p>
        </Step>
        <Step title="Create the webhook in Audit Bench Ai">
          <p>
            Under <strong>Webhooks</strong>, add one for Bitbucket with the repository as{' '}
            <code>workspace/repo-slug</code>, and tick <strong>Automatically review new PRs/MRs</strong>. Copy the
            payload URL and the secret; the secret is shown only once.
          </p>
        </Step>
        <Step title="Add the webhook in Bitbucket">
          <p>
            In the repository, open <strong>Repository settings → Webhooks → Add webhook</strong>. Paste the URL and
            the secret, and under triggers choose <strong>Pull Request: Created</strong> and{' '}
            <strong>Pull Request: Updated</strong>. Save.
          </p>
        </Step>
      </Steps>

      <H2>When a review runs</H2>
      <p>
        When a pull request is created or updated with new commits. Drafts are skipped, and a commit that’s already been
        reviewed isn’t reviewed again.
      </p>

      <Callout type="note" title="What’s different from GitHub">
        Bitbucket gets the full review, the summary in plain Markdown and a build status, but <code>@auditbench</code>{' '}
        questions and recheck replies aren’t available on Bitbucket yet. Repeated findings are still held back across
        pushes.
      </Callout>
    </DocPage>
  );
}
