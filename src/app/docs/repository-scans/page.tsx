import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('repository-scans');

export default function RepositoryScans() {
  return (
    <DocPage slug="repository-scans" updated="November 1, 2026">
      <p>
        A repository scan reviews a whole branch rather than one change: useful when you adopt a codebase, before a
        release, or to see where the risk is in a project you already own.
      </p>

      <H2>Start a scan</H2>
      <p>
        In <Link href="/app/repository">Repository scan</Link>, pick a repository from GitHub, GitLab or Bitbucket and a
        branch, or upload a <code>.zip</code>. The report opens when the scan finishes, and stays in your account until
        you delete it.
      </p>

      <H2>What a scan checks</H2>
      <Table
        head={['Check', 'Finds']}
        rows={[
          ['Secrets', 'API keys, tokens, passwords and private keys committed to the code, including in generated files'],
          ['Dependencies', 'Packages with known vulnerabilities'],
          ['Licenses', 'Dependency licenses that may conflict with how you ship'],
          ['Dead and duplicate code', 'Unused exports and files, copy-pasted blocks'],
          ['Structure', 'The frameworks in use, the import graph and circular imports'],
          ['Test coverage', 'An estimate of how much of the code has tests'],
          ['Architecture', 'How consistent the layering is across core files'],
          ['AI review', 'The riskiest files, reviewed in depth like a pull request'],
        ]}
      />

      <H3>Limits</H3>
      <ul>
        <li>The AI reviews up to 40 of the riskiest files per scan; the local checks cover everything.</li>
        <li>Files over 200 KB are skipped.</li>
        <li>Uploaded archives can hold up to 3,000 files and 500 MB uncompressed.</li>
        <li>
          Generated and vendored code is excluded, and your <Link href="/docs/configuration">ignore rules</Link> apply.
        </li>
      </ul>
      <p>
        Scans that use the AI count toward your plan’s monthly repository scans. See{' '}
        <Link href="/docs/plans">Plans and limits</Link>.
      </p>

      <H2>The free public scan</H2>
      <p>
        <Link href="/scan">auditbenchai.com/scan</Link> checks any <strong>public</strong> GitHub repository or pull request
        without an account.
      </p>
      <ul>
        <li>
          It runs the <strong>local checks only</strong>. No code is sent to an AI provider.
        </li>
        <li>
          Repositories up to 250 MB. Pull requests up to 40 changed files of 200 KB each; a pull request scan also
          reports merge readiness (conflicts, draft state, CI).
        </li>
        <li>Each visitor can run three scans an hour. Results for the same repository and branch are reused for 24 hours.</li>
        <li>Every scan gets a shareable link.</li>
      </ul>
      <Callout type="tip" title="Post the result to the pull request">
        If you’re signed in and you’re the pull request’s author or a maintainer, you can post a public scan’s review to
        the pull request from its results page.
      </Callout>

      <H2>Sharing reports</H2>
      <p>
        Any report you own can be shared with a link, and unshared again, from the report page. Shared reports show
        findings, file paths and line numbers.
      </p>
    </DocPage>
  );
}
