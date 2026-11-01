import Link from 'next/link';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('review-quality');

export default function ReviewQualityDocs() {
  return (
    <DocPage slug="review-quality" updated="November 1, 2026">
      <p>
        More findings isn’t better. The <strong>Review quality</strong> panel on the <Link href="/app/rules">Rules page</Link>{' '}
        measures whether reviews are useful to your team, using what happened to findings once pull requests closed.
      </p>

      <H2>The metrics</H2>
      <Table
        head={['Metric', 'How it’s worked out', 'What good looks like']}
        rows={[
          ['Precision', 'Accepted ÷ (accepted + dismissed), on closed pull requests', 'High. Below 60% means too many findings your team rejects'],
          ['Dismissed', 'Share of findings that got a 👎', 'Low'],
          ['Acknowledged', 'Share of findings someone reacted 👀 to or replied on', 'People are reading the comments'],
          ['Repeats held back', 'Share of raised findings that were already on the pull request, and so not posted again', 'Shows how much noise was avoided'],
          ['Findings per review', 'Average findings on each pull request review', 'Fewer, correct ones'],
          ['Tokens per review / per finding', 'AI cost of each review and each finding', 'Stable or falling'],
        ]}
      />

      <H2>When developers push back</H2>
      <p>The panel also shows what happened after someone disputed a finding:</p>
      <ul>
        <li>
          <strong>Withdrawn:</strong> the recheck agreed it wasn’t an issue. A high share means first reviews are raising
          things they shouldn’t; raise the minimum confidence.
        </li>
        <li>
          <strong>Upheld:</strong> the recheck kept it, with evidence.
        </li>
        <li>
          <strong>Downgraded:</strong> real, but overstated. A high share means severities are too high.
        </li>
        <li>
          <strong>Fixed after discussion:</strong> the conversation led to a fix.
        </li>
      </ul>

      <H2>What happened to findings</H2>
      <p>
        Next to the metrics, the Rules page lists the last 90 days of outcomes: accepted, dismissed or ignored, by kind
        of finding. Use it to spot categories your team never acts on, then add a “Don’t flag” rule or adjust{' '}
        <Link href="/docs/configuration">strictness</Link>.
      </p>

      <Callout type="note" title="Why the numbers start empty">
        Outcomes are recorded when a pull request closes, because that’s when reactions are read. Precision,
        dismissals and acknowledgements fill in as reviewed pull requests are merged or closed.
      </Callout>
    </DocPage>
  );
}
