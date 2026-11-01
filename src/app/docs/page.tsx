import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, Card, Cards, DocIcon, H2, ICONS, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('');

export default function DocsIntroduction() {
  return (
    <DocPage slug="" updated="November 1, 2026">
      <p>
        Audit Bench Ai reviews pull requests the way a careful senior engineer would: it reads the change, looks at the
        code that calls it, and comments only where something would actually break, leak or mislead. Each finding says
        what goes wrong, when it goes wrong, and how to fix it, with a one-click suggestion where it can.
      </p>
      <p>
        It works on GitHub, GitLab and Bitbucket, and the same engine runs in VS Code, in the terminal and in CI, so you
        can catch problems before a pull request exists.
      </p>

      <Cards>
        <Card href="/docs/quickstart" title="Quickstart" icon={<DocIcon d={ICONS.rocket} />}>
          Install the GitHub App and get your first review in about five minutes.
        </Card>
        <Card href="/docs/how-it-works" title="How reviews work" icon={<DocIcon d={ICONS.layers} />}>
          Free local checks first, then a focused AI pass with the context that matters.
        </Card>
        <Card href="/docs/reviews" title="Reading a review" icon={<DocIcon d={ICONS.check} />}>
          Severities, categories, the summary comment and the merge check.
        </Card>
        <Card href="/docs/configuration" title="Rules and strictness" icon={<DocIcon d={ICONS.sliders} />}>
          Teach it your conventions and decide how picky it should be.
        </Card>
      </Cards>

      <H2>What happens on a pull request</H2>
      <ol>
        <li>
          <strong>You open or update a pull request.</strong> An <em>Audit Bench Ai</em> check appears at once with
          “Reviewing…”. A review usually takes one to two minutes.
        </li>
        <li>
          <strong>Local checks run first, for free.</strong> Linters, type checks, secret scanning and complexity
          analysis find the mechanical problems without using any AI.
        </li>
        <li>
          <strong>Each changed file gets one focused AI review.</strong> The model sees the changed lines, the code
          elsewhere in the repository that calls them, and related tests, so it can tell whether a change breaks a
          caller.
        </li>
        <li>
          <strong>Findings are calibrated before they’re posted.</strong> Low-confidence guesses are dropped, unproven
          “critical” claims are toned down, and anything already raised on the pull request isn’t posted again.
        </li>
        <li>
          <strong>You get inline comments, a summary and a verdict.</strong> The check passes, passes with notes, or
          fails on a blocking issue. You can make it a{' '}
          <Link href="/docs/required-check">required check</Link>.
        </li>
        <li>
          <strong>Reply and it rechecks.</strong> Push back on a finding and it looks at the code again: it withdraws
          the finding, lowers it, or explains why it still applies. Your team’s 👍 and 👎 teach it what to stop raising.
        </li>
      </ol>

      <H2>Where it runs</H2>
      <Table
        head={['Surface', 'What it does', 'Guide']}
        rows={[
          ['GitHub', 'Automatic reviews, inline comments, the merge check, replies, re-run', <Link key="g" href="/docs/github">GitHub</Link>],
          ['GitLab', 'Automatic merge request reviews and @auditbench answers', <Link key="gl" href="/docs/gitlab">GitLab</Link>],
          ['Bitbucket Cloud', 'Automatic pull request reviews and a build status', <Link key="b" href="/docs/bitbucket">Bitbucket</Link>],
          ['VS Code', 'Review the file you’re editing, before you commit', <Link key="v" href="/docs/vscode">VS Code</Link>],
          ['CLI and CI', 'Review files or folders, fail a pipeline on blocking issues', <Link key="c" href="/docs/cli">CLI</Link>],
          ['Web app', 'Whole-repository scans, reports, team rules and metrics', <Link key="r" href="/docs/repository-scans">Repository scans</Link>],
        ]}
      />

      <H2>What it looks for</H2>
      <p>
        Every finding has one of twelve categories: <strong>Security</strong>, <strong>Logic</strong>,{' '}
        <strong>Performance</strong>, <strong>Reliability</strong>, <strong>Data Integrity</strong>,{' '}
        <strong>Concurrency</strong>, <strong>Resource Management</strong>, <strong>API Design</strong>,{' '}
        <strong>Semantic Accuracy</strong> (a name or comment that says something different from what the code does),{' '}
        <strong>Testing</strong>, <strong>Architecture</strong> and <strong>Maintainability</strong>.
      </p>
      <p>
        It reviews TypeScript, JavaScript, Python, Go, Java, Kotlin, C#, PHP, Ruby, Rust, Swift, Scala, C and C++, along
        with SQL, Prisma schemas, YAML and JSON.
      </p>

      <Callout type="tip" title="Try it without installing anything">
        Paste a public GitHub repository or pull request link into the <Link href="/scan">free scan</Link>. It runs the local
        checks only, so no code is sent to an AI provider, and you get a shareable report.
      </Callout>

      <H2>Next steps</H2>
      <Cards cols={3}>
        <Card href="/docs/github" title="Connect GitHub" icon={<DocIcon d={ICONS.branch} />}>
          The App, its permissions and automatic reviews.
        </Card>
        <Card href="/docs/conversations" title="Replies and reactions" icon={<DocIcon d={ICONS.chat} />}>
          How to argue with a finding, and how it learns.
        </Card>
        <Card href="/docs/security" title="Security and data" icon={<DocIcon d={ICONS.shield} />}>
          What’s read, what’s sent, what’s kept.
        </Card>
      </Cards>
    </DocPage>
  );
}
