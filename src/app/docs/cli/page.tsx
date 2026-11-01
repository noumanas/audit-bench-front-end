import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('cli');

const INSTALL = `git clone https://github.com/noumanas/-audit-bench-cli.git
cd -audit-bench-cli
npm install
npm run build
npm link          # puts the auditbench command on your PATH`;

const USAGE = `auditbench login                     # sign in with your email and password
auditbench status                    # your plan and remaining usage
auditbench audit src/checkout.ts     # review one file
auditbench scan .                    # review a folder (or a .zip)
auditbench scan . --fail-on needs_work`;

const GITHUB_ACTIONS = `name: Audit Bench Ai
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: git clone https://github.com/noumanas/-audit-bench-cli.git /tmp/cli && cd /tmp/cli && npm ci && npm run build && npm link
      - run: auditbench scan . --fail-on do_not_ship
        env:
          AUDITBENCH_API_KEY: \${{ secrets.AUDITBENCH_API_KEY }}`;

const GITLAB_CI = `audit-bench:
  image: node:20
  script:
    - git clone https://github.com/noumanas/-audit-bench-cli.git /tmp/cli
    - (cd /tmp/cli && npm ci && npm run build && npm link)
    - auditbench scan . --fail-on do_not_ship
  variables:
    AUDITBENCH_API_KEY: $AUDITBENCH_API_KEY`;

export default function CliDocs() {
  return (
    <DocPage slug="cli" updated="November 1, 2026">
      <p>
        The <code>auditbench</code> command runs the same review from your terminal or a CI pipeline, and exits with a
        non-zero code when the verdict is bad enough to stop a build.
      </p>

      <H2>Install</H2>
      <p>The CLI needs Node.js 18 or later. Build it from source:</p>
      <CodeBlock label="Terminal" code={INSTALL} />
      <p>
        A Docker image can be built from the same repository with <code>docker build -t auditbench-cli .</code>.
      </p>

      <H2>Sign in</H2>
      <ul>
        <li>
          <strong>On your machine:</strong> run <code>auditbench login</code> and enter your Audit Bench Ai email and
          password. The session is saved in <code>~/.auditbench/config.json</code>, readable only by you.
        </li>
        <li>
          <strong>In CI:</strong> set <code>AUDITBENCH_API_KEY</code> to your API key, and no login is needed. Find the
          key in the app under <Link href="/app/repository">Repository scan</Link> → <strong>CLI / CI-CD API key</strong>.
          Store it as a secret, never in the repository.
        </li>
      </ul>

      <H2>Commands</H2>
      <CodeBlock label="Terminal" code={USAGE} />
      <Table
        head={['Command', 'What it does']}
        rows={[
          [<code key="l">login</code>, 'Sign in. Accepts -e/--email and -p/--password for scripts'],
          [<code key="o">logout</code>, 'Remove the saved session'],
          [<code key="s">status</code>, 'Show your plan and how much of it you’ve used'],
          [<code key="a">audit &lt;file&gt;</code>, 'Review a single file'],
          [<code key="c">scan &lt;dir|file.zip&gt;</code>, 'Review a folder or zip archive'],
        ]}
      />

      <H3>Options</H3>
      <Table
        head={['Option', 'Applies to', 'Meaning']}
        rows={[
          [<code key="f">--fail-on</code>, 'audit, scan', 'do_not_ship (default), needs_work or never: the verdict that makes the command exit 1'],
          [<code key="p">--provider</code>, 'audit, scan', 'Use a specific AI provider instead of your account’s default'],
        ]}
      />

      <H3>Exit codes</H3>
      <ul>
        <li>
          <code>0</code>: the verdict is below your <code>--fail-on</code> level.
        </li>
        <li>
          <code>1</code>: the verdict reached your <code>--fail-on</code> level, or something went wrong (not signed in,
          a limit reached, a network error).
        </li>
      </ul>

      <H2>Use it in CI</H2>
      <H3>GitHub Actions</H3>
      <CodeBlock label=".github/workflows/audit-bench.yml" code={GITHUB_ACTIONS} />
      <H3>GitLab CI</H3>
      <CodeBlock label=".gitlab-ci.yml" code={GITLAB_CI} />
      <Callout type="tip">
        On GitHub, the <Link href="/docs/github">GitHub App</Link> already reviews every pull request with inline comments and
        a check. Use the CLI in CI when you can’t install the App, or to gate other pipelines.
      </Callout>

      <H2>Environment variables</H2>
      <Table
        head={['Variable', 'Purpose']}
        rows={[
          [<code key="k">AUDITBENCH_API_KEY</code>, 'Authenticate without logging in (CI)'],
          [<code key="u">AUDITBENCH_API_URL</code>, 'Point the CLI at a different Audit Bench Ai server (self-hosted setups)'],
        ]}
      />
      <p>
        Every <code>audit</code> and <code>scan</code> counts toward your plan like a review in the app. Unchanged code
        is served from cache for free.
      </p>
    </DocPage>
  );
}
