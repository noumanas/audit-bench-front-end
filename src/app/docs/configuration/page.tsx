import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('configuration');

const AUDITBENCH_MD = `# Review notes for Audit Bench Ai

- Money is always integer cents (see src/money.ts). Flag any float arithmetic on amounts.
- All database access goes through src/db/ repositories; flag raw SQL elsewhere.
- Feature flags are read with flags.isOn(); hard-coded env checks are a bug.
- src/legacy/ is frozen: only flag security issues there.
- We target Node 20; don't suggest polyfills.`;

export default function Configuration() {
  return (
    <DocPage slug="configuration" updated="November 1, 2026">
      <p>
        You can shape reviews in three ways: a notes file in the repository, rules in the web app, and strictness
        thresholds. Changing any of them starts fresh reviews instead of reusing cached results.
      </p>

      <H2>The auditbench.md file</H2>
      <p>
        Put your conventions in plain language in a file at the root of the repository. Audit Bench Ai reads the first
        of these it finds:
      </p>
      <ul>
        <li>
          <code>auditbench.md</code>
        </li>
        <li>
          <code>.auditbench.md</code>
        </li>
        <li>
          <code>.github/auditbench.md</code>
        </li>
      </ul>
      <CodeBlock label="auditbench.md" code={AUDITBENCH_MD} />
      <p>
        The file is added to the reviewer’s instructions for that repository. Keep it short and specific: the first
        4,000 characters are used. Write what a new senior engineer would need to know to review your code, not general
        advice.
      </p>
      <Callout type="note">
        There’s no YAML or JSON configuration file. Notes go in <code>auditbench.md</code>; rules and thresholds are set
        in the app.
      </Callout>

      <H2>Rules</H2>
      <p>
        The <Link href="/app/rules">Rules page</Link> holds rules that apply across your repositories, or to one repository.
        There are three kinds:
      </p>
      <Table
        head={['Kind', 'What it does', 'Example']}
        rows={[
          ['Instruction', 'Tells the reviewer something to check or keep in mind', '“Every API handler must check the caller owns the resource.”'],
          ['Ignore files', 'Skips files matching a glob pattern', <code key="i">src/generated/**</code>],
          ['Don’t flag', 'Stops a kind of finding from being raised', '“Don’t flag missing JSDoc on internal functions.”'],
        ]}
      />
      <ul>
        <li>Each rule is up to 500 characters and can be limited to one repository (<code>owner/repo</code>).</li>
        <li>Rules can be personal, or shared with your whole team.</li>
        <li>Switch a rule off without deleting it.</li>
        <li>
          <strong>Learned rules</strong> appear here too: kinds of finding your team kept dismissing. See{' '}
          <Link href="/docs/conversations#how-it-learns">how it learns</Link>.
        </li>
      </ul>
      <p>
        Only team owners and admins can create or change shared rules. Anyone can manage their own personal rules.
      </p>

      <H2>Strictness</H2>
      <p>
        Under <strong>Review strictness</strong> on the Rules page, you decide how sure the reviewer must be before it
        posts, and when code is complex enough to mention.
      </p>
      <Table
        head={['Setting', 'Default', 'Range', 'Effect']}
        rows={[
          ['Minimum confidence', '0.4', '0.2 – 0.8', 'Findings less certain than this aren’t posted'],
          [
            'Confidence for critical and high',
            '0.6',
            '0.4 – 0.95',
            'Critical and high findings less certain than this are posted as medium',
          ],
          ['Deep nesting', '4 levels', '2 – 8', 'Nesting depth that earns a complexity finding'],
          ['Very high complexity', '25 paths', '12 – 60', 'Paths through a function that earn a finding even when it’s flat'],
          ['Optional suggestions', 'On', 'On / off', 'List 💡 suggestions in the pull request summary'],
        ]}
      />
      <H3>Choosing values</H3>
      <ul>
        <li>
          <strong>Too noisy?</strong> Raise the minimum confidence to 0.5–0.6, and turn optional suggestions off.
        </li>
        <li>
          <strong>Missing things?</strong> Lower the minimum confidence to 0.3. Expect more findings that need a second
          look.
        </li>
        <li>
          <strong>Blocking too often on uncertain issues?</strong> Raise the critical and high confidence to 0.75 or more.
        </li>
        <li>
          <strong>Legacy code full of deep nesting?</strong> Raise the nesting and complexity limits rather than ignoring
          the files.
        </li>
      </ul>
      <p>
        Team thresholds are set by owners and admins. If you’re not in a team, you set your own. Watch the{' '}
        <Link href="/docs/review-quality">review quality metrics</Link> after a change to see whether it helped.
      </p>
    </DocPage>
  );
}
