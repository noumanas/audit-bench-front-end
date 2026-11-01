import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('reviews');

const EXAMPLE_COMMENT = `Security | 🔴 Critical

**Order lookup builds SQL from the customer's email**

findOrdersByCustomer pastes customerEmail straight into the query string.

**When it breaks:** an email of  ' OR '1'='1  returns every customer's orders.
**Suggested fix:** pass the email as a parameter ($1) instead of interpolating it.

\`\`\`suggestion
  \`SELECT ... WHERE c.email = $1\`, [customerEmail],
\`\`\`

92% confidence · 💬 Reply here and Audit Bench Ai will recheck the code · 👀 to acknowledge · 👍/👎 teaches it what your team wants`;

export default function ReadingAReview() {
  return (
    <DocPage slug="reviews" updated="November 1, 2026">
      <p>A review has three parts: inline comments on the changed lines, one summary comment, and the check result.</p>

      <H2>Inline comments</H2>
      <p>Each finding is posted on the lines it’s about. It reads like this:</p>
      <CodeBlock label="Inline comment" code={EXAMPLE_COMMENT} />
      <ul>
        <li>
          <strong>The header</strong> gives the category and severity.
        </li>
        <li>
          <strong>The title</strong> says what’s wrong in plain language, then a short description.
        </li>
        <li>
          <strong>Why it happens</strong> (when useful) explains the root cause.
        </li>
        <li>
          <strong>When it breaks</strong> gives the concrete input or sequence of events that triggers it.
        </li>
        <li>
          <strong>Tests</strong> says whether existing tests cover the behavior, when it matters.
        </li>
        <li>
          <strong>Suggested fix</strong>, with a one-click GitHub suggestion when the fix exactly replaces the commented
          lines, or an example patch otherwise.
        </li>
        <li>
          <strong>The footer</strong> shows how confident the reviewer is and how to respond.
        </li>
      </ul>
      <p>
        If a finding comes back after being fixed, it’s marked ♻️ <em>reappeared</em>; if its lines changed but the
        problem is still there, 🔁 <em>still present</em>.
      </p>

      <H2>Severities</H2>
      <Table
        head={['Severity', 'Meaning', 'Effect on the check']}
        rows={[
          ['🔴 Critical', 'Exploitable, data-losing or crashing in normal use', 'Fails'],
          ['🟠 High', 'Serious bug or risk that will bite in realistic conditions', 'Fails if it’s a Security finding; otherwise neutral'],
          ['🟡 Medium', 'A real problem with limited impact, or an edge case', 'Neutral'],
          ['🔵 Low', 'Minor issue worth fixing when convenient', 'None'],
          ['💡 Suggestion', 'Optional improvement; listed in the summary, never posted inline', 'None'],
        ]}
      />
      <Callout type="note" title="Severity and confidence are separate">
        Severity is how bad it would be; confidence is how sure the reviewer is that it’s real. A critical claim below
        0.6 confidence is posted as medium, so a guess can’t block your merge. You can tune both thresholds in{' '}
        <Link href="/docs/configuration">Rules and strictness</Link>.
      </Callout>

      <H2>Categories</H2>
      <Table
        head={['Category', 'Covers']}
        rows={[
          ['Security', 'Injection, auth and access control, secrets, unsafe deserialization, XSS'],
          ['Logic', 'Wrong results, off-by-one errors, inverted conditions, unhandled cases'],
          ['Reliability', 'Missing error handling, retries, timeouts, crashes on bad input'],
          ['Data Integrity', 'Lost or duplicated writes, missing transactions, money in floats'],
          ['Concurrency', 'Races, check-then-act, double processing'],
          ['Resource Management', 'Leaks, unbounded memory, connections left open'],
          ['Performance', 'N+1 queries, needless work in hot paths'],
          ['API Design', 'Breaking changes to callers, confusing or unsafe interfaces'],
          ['Semantic Accuracy', 'Names, comments or docs that say something different from what the code does'],
          ['Testing', 'Tests that don’t test what they claim, missing coverage for risky behavior'],
          ['Architecture', 'Layering and coupling problems (capped at medium)'],
          ['Maintainability', 'Deep nesting, very complex functions, duplication (capped at medium)'],
        ]}
      />

      <H2>The summary comment</H2>
      <p>One comment per review, updated as you push. From the top:</p>
      <ul>
        <li>
          <strong>Actionable comments posted</strong>, and how many findings were <strong>not repeated</strong> because
          they’re still open from an earlier review or your team dismissed them.
        </li>
        <li>
          <strong>Merge readiness:</strong> ✅ Ready, 🟡 Ready with notes or ⛔ Not ready, with lists of what to fix
          before merging and what’s worth a look.
        </li>
        <li>
          <strong>Merge risk</strong> and <strong>pre-merge checks</strong>: whether the title and description explain
          the change, whether an issue is linked, and whether the scope is focused.
        </li>
        <li>
          Collapsible sections: a <strong>walkthrough</strong> of each file, <strong>review info</strong> (commit,
          verdict, counts), <strong>optional suggestions</strong>, and a <strong>prompt to fix</strong> you can paste
          into an AI coding agent.
        </li>
      </ul>

      <H3>Verdict</H3>
      <ul>
        <li>
          <strong>⛔ Do not ship:</strong> at least one critical finding.
        </li>
        <li>
          <strong>⚠️ Needs work:</strong> high or medium findings.
        </li>
        <li>
          <strong>✅ Pass:</strong> nothing above low.
        </li>
      </ul>
      <p>
        Merge readiness also counts things outside the code: a draft, merge conflicts, failing CI checks and likely
        secrets all make a pull request ⛔ Not ready.
      </p>

      <H2>The full report</H2>
      <p>
        The <strong>Open full report</strong> link in the summary opens the review in the web app, with every finding,
        the local check results and the token cost.
      </p>
    </DocPage>
  );
}
