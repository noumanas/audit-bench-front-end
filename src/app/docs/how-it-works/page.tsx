import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, H3, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('how-it-works');

export default function HowItWorks() {
  return (
    <DocPage slug="how-it-works" updated="November 1, 2026">
      <p>
        Every review runs in two stages. The first is deterministic and free; the second is a focused AI review that
        only sees what it needs. The aim is a few findings that are right, not many that might be.
      </p>

      <H2>Stage 1: local checks</H2>
      <p>These run on our servers without any AI and never count toward your plan’s limits:</p>
      <ul>
        <li>Linters and type checks: ESLint, the TypeScript compiler and Prettier for JavaScript and TypeScript, plus Python checks.</li>
        <li>Semgrep rules and risky-pattern detection.</li>
        <li>Secret scanning for keys, tokens and passwords added in the change.</li>
        <li>
          Complexity and nesting analysis. Functions that are deeply nested or have too many paths are flagged, and the
          riskiest functions are picked out for the AI to look at closely.
        </li>
      </ul>

      <H2>Stage 2: the AI review</H2>
      <p>Each changed file gets one AI call. For a pull request, the model is given:</p>
      <ul>
        <li>The changed lines with a little surrounding code.</li>
        <li>
          <strong>Callers:</strong> short excerpts of code elsewhere in the repository that uses the changed functions,
          so it can tell when a change breaks something that isn’t in the diff.
        </li>
        <li>
          <strong>Related tests:</strong> test files for the changed code, so it can judge whether behavior is covered.
        </li>
        <li>The pull request’s title and description, your team’s rules and your repository’s <code>auditbench.md</code>.</li>
      </ul>
      <p>
        Repository context is read for repositories up to 50 MB. Larger ones are reviewed with the diff and the pull
        request alone.
      </p>

      <H3>What the model is asked for</H3>
      <p>
        The model has to back every finding with evidence from the code: the line that fails, the input that triggers
        it, and what happens next (“When it breaks”). It rates two things separately:
      </p>
      <ul>
        <li>
          <strong>Severity:</strong> how bad it would be if it’s real.
        </li>
        <li>
          <strong>Confidence:</strong> how sure it is that it’s real. Above 0.85 means proven by the code in view;
          0.6–0.85 strongly suggested; below 0.6 needs checking.
        </li>
      </ul>

      <H2>Calibration</H2>
      <p>Before anything is posted, findings go through fixed rules, so the same model output always publishes the same way:</p>
      <Table
        head={['Rule', 'Why']}
        rows={[
          ['Findings below the minimum confidence (0.4 by default) are dropped', 'A guess shouldn’t be presented as a defect'],
          [
            'Critical and high findings below 0.6 confidence become medium',
            'An unconfirmed concern shouldn’t block a merge on its own',
          ],
          ['Maintainability and Architecture findings stop at medium', 'Code health is worth raising, but rarely a reason to stop a merge'],
          ['Two findings of the same kind on overlapping lines are merged', 'One problem, one comment'],
          ['Kinds of finding your team keeps dismissing are dropped', 'See learned suppressions in Rules and strictness'],
        ]}
      />
      <p>
        The thresholds are adjustable per team. See <Link href="/docs/configuration">Rules and strictness</Link>.
      </p>

      <H2>No repeated comments</H2>
      <p>
        When you push again, the new review is compared with comments it already left on the pull request, matched by
        file and the kind of problem, not by line number, so moving code around doesn’t create duplicates:
      </p>
      <ul>
        <li>Still open from an earlier review: not posted again.</li>
        <li>Dismissed by your team (👎 or agreed “not an issue”): not posted again.</li>
        <li>Marked fixed but detected again: posted, marked ♻️ <em>reappeared</em>.</li>
        <li>Its lines changed but the problem is still there: posted, marked 🔁 <em>still present</em> (GitHub and Bitbucket).</li>
      </ul>
      <p>The summary says how many findings were held back and why.</p>

      <H2>Caching</H2>
      <p>
        Results are cached by the code, your rules, the context and the engine version. Re-reviewing unchanged code is
        served from the cache and doesn’t use your plan’s limits. Changing your rules or strictness starts fresh reviews.
      </p>

      <Callout type="note" title="Which AI model?">
        Audit Bench Ai supports several AI providers. The hosted service at auditbenchai.com uses one provider through
        its API, under terms that don’t allow your code to be used for training. See{' '}
        <Link href="/docs/security">Security and data</Link>.
      </Callout>
    </DocPage>
  );
}
