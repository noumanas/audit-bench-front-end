import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('security');

export default function SecurityDocs() {
  return (
    <DocPage slug="security" updated="November 1, 2026">
      <p>
        A short technical summary for engineers and security reviewers. The full policy is on{' '}
        <Link href="/security">Security &amp; Trust</Link> and in the <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <H2>What code is read</H2>
      <Table
        head={['Where', 'What is read']}
        rows={[
          ['Pull request review', 'The changed files at the latest commit, plus a snapshot of the repository to find callers and tests'],
          ['Repository scan', 'The branch you choose, or the archive you upload'],
          ['VS Code', 'The whole file you review'],
          ['CLI', 'The file, folder or archive you point it at'],
          ['Public scan', 'The public repository or pull request you paste'],
        ]}
      />
      <p>Code is read, never run. Snapshots and archives are processed in memory for the review and then discarded.</p>

      <H2>What goes to the AI provider</H2>
      <ul>
        <li>
          <strong>Pull requests:</strong> the changed lines with nearby code, short excerpts of callers and related tests,
          and the pull request’s title and description.
        </li>
        <li>
          <strong>Repository scans:</strong> the functions the local checks flagged as risky, and short excerpts of core
          files. Never the whole repository.
        </li>
        <li>
          <strong>Public scans:</strong> nothing. They use local checks only.
        </li>
      </ul>
      <p>
        The hosted service sends this to Google’s Gemini API. Under the API’s paid-tier terms, the data isn’t used to
        train models. Our servers run on Google Cloud in Europe.
      </p>

      <H2>What is kept</H2>
      <ul>
        <li>
          <strong>Reports</strong> keep findings, file paths, line numbers and short code excerpts, not copies of your
          repository. They stay until you delete them.
        </li>
        <li>
          <strong>Access tokens</strong> for GitHub, GitLab and Bitbucket are encrypted with AES-256-GCM.
        </li>
        <li>
          <strong>Activity logs</strong> (sign-ins and account events) are deleted after 180 days.
        </li>
        <li>
          <strong>Public scan</strong> visitors’ IP addresses are stored only as one-way hashes, for rate limiting.
        </li>
      </ul>

      <H2>GitHub access</H2>
      <p>
        The GitHub App can read code, write pull request reviews and comments, and post a check, on the repositories you
        select and nothing else. It can’t push code or change settings. See{' '}
        <Link href="/docs/github#permissions">permissions</Link>.
      </p>

      <H2>Deleting your data</H2>
      <ul>
        <li>Delete any report from its page.</li>
        <li>Remove a GitHub App installation from GitHub, and unlink it in the app.</li>
        <li>
          Delete your whole account from the <Link href="/app/dashboard">dashboard</Link>. Reports, reviews, rules and stored tokens are deleted
          with it. Payment records are kept for accounting, without your account attached.
        </li>
      </ul>
      <Callout type="note">
        A team owner can’t delete their account while other members are still in the team. Transfer ownership or remove
        the members first.
      </Callout>

      <H2>Reporting a vulnerability</H2>
      <p>
        Please email <a href="mailto:hello@auditbenchai.com">hello@auditbenchai.com</a> with details. We’ll reply as
        soon as we can and keep you updated until it’s fixed.
      </p>
    </DocPage>
  );
}
