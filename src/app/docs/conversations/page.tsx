import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('conversations');

export default function Conversations() {
  return (
    <DocPage slug="conversations" updated="November 1, 2026">
      <p>
        A review is the start of a conversation, not the end. You can dispute a finding, ask about the pull request, and
        react to comments; each of these changes what Audit Bench Ai does next.
      </p>

      <H2>Reply to a finding</H2>
      <p>
        Reply in a finding’s thread, for example <em>“This can’t be null here, the caller checks it on line 40”</em> or{' '}
        <em>“Fixed in the last commit”</em>. Audit Bench Ai rechecks the code at the pull request’s latest commit and
        answers in the thread with one of:
      </p>
      <Table
        head={['Answer', 'Meaning']}
        rows={[
          ['✅ Resolved', 'The fix is in. The thread is resolved.'],
          ['👍 Dismissed', 'You were right, it isn’t an issue here. The thread is resolved.'],
          ['↘️ Downgraded', 'It’s real but less serious than first stated; the new severity is given.'],
          ['🔁 Confirmed', 'It still applies, with the evidence from the code.'],
          ['❓ Under review', 'It needs a bit more detail from you.'],
        ]}
      />
      <p>
        It judges your reply against the code, not against how confident it sounds: “we have tests for this” leads it to
        look for those tests. If you disagree with its answer, reply again. Each thread gets up to five replies.
      </p>
      <Callout type="note">
        Recheck replies are available on GitHub. Each recheck uses one AI review from your plan; if you’re at your
        limit, it says it couldn’t recheck.
      </Callout>

      <H2>Ask about the pull request</H2>
      <p>
        Mention <code>@auditbench</code> anywhere in a pull request comment to ask a question about the change:
      </p>
      <ul>
        <li>
          <em>“@auditbench what happens to existing sessions after this deploy?”</em>
        </li>
        <li>
          <em>“@auditbench is there anything here that needs a database migration?”</em>
        </li>
      </ul>
      <p>
        It answers in the conversation, using the changed files. If the answer is about one place in the code, it also
        opens a thread on that line and links to it. Mentioning <code>@auditbench</code> in a new inline comment starts a
        recheck of that spot.
      </p>
      <p>
        <code>@auditbench</code> works on GitHub and GitLab. It’s the only command: there are no slash commands to
        remember.
      </p>

      <H2>React to findings</H2>
      <Table
        head={['Reaction', 'Means']}
        rows={[
          ['👍', 'Useful, keep raising this kind of thing'],
          ['👎', 'Not useful here, stop raising this kind of thing'],
          ['👀', 'Seen; you’ll deal with it (counted as acknowledged)'],
        ]}
      />
      <p>
        GitHub doesn’t send reaction events, so reactions are read <strong>when the pull request closes</strong>. At
        that point each finding gets an outcome: <strong>accepted</strong> (👍, the thread was resolved, or its lines
        were changed), <strong>dismissed</strong> (👎) or <strong>ignored</strong>. Those outcomes feed the{' '}
        <Link href="/docs/review-quality">review quality metrics</Link>.
      </p>

      <H2>How it learns</H2>
      <p>
        When the same kind of finding in a repository is pushed back on at least twice (a 👎, an agreed “not an issue”,
        or “won’t fix”) and that outweighs the positive signals, Audit Bench Ai creates a <strong>learned rule</strong>{' '}
        to stop raising it there.
      </p>
      <H3>Managing learned rules</H3>
      <ul>
        <li>
          Learned rules appear on the <Link href="/app/rules">Rules page</Link>, marked as learned, next to the rules you wrote.
        </li>
        <li>Switch one off to start seeing that kind of finding again.</li>
        <li>If the evidence behind a learned rule is withdrawn, the rule is removed by itself.</li>
      </ul>
      <p>
        Learning is per repository, so a convention your team follows in one project doesn’t silence the same finding
        everywhere.
      </p>
    </DocPage>
  );
}
