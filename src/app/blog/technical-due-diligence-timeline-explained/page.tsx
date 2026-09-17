import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'technical-due-diligence-timeline-explained')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function TechnicalDueDiligenceTimelineExplainedPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Technical due diligence used to run on the same clock as a consulting engagement, because it
        was one: find a firm, negotiate a statement of work, wait for a team to be staffed, then wait two
        or three weeks for a manual code review and a written report. None of that timeline was about the
        codebase — it was entirely about the logistics of hiring humans to look at it. That&apos;s the
        piece that changed.
      </p>

      <h2>What actually consumed the old timeline</h2>
      <p>
        A traditional engagement&apos;s calendar time was almost never spent on analysis. It was spent on
        scheduling calls with the target&apos;s engineering lead to request repository access, waiting for
        legal to clear an NDA broad enough to cover code review, waiting for a consultant bench to free up,
        and then waiting again for that consultant to manually read through a codebase they&apos;d never
        seen before. The actual technical assessment — once someone was finally looking at the code — often
        took a fraction of the total elapsed time.
      </p>

      <h2>What software-based diligence removes from that clock</h2>
      <p>
        An automated scan doesn&apos;t wait for a consultant&apos;s calendar to open up, and it doesn&apos;t
        need weeks to get oriented in an unfamiliar codebase — dependency graphing, dead-code detection,
        secret scanning, and license-compliance checks run in the same amount of time on day one of an
        engagement as they would in week three of a manual one. What&apos;s left to determine the timeline
        is read-only repository access and an NDA, both of which can be turned around in a day when the
        target is motivated to close.
      </p>

      <h2>Why a report still takes more than an hour</h2>
      <p>
        Read-only access and a fast engine don&apos;t compress the timeline to zero, and it&apos;s worth
        being specific about why. A scan surfaces raw findings — vulnerabilities, dependency risk, coverage
        gaps, ownership concentration — but a report an investment committee can act on needs those findings
        triaged, prioritized, and translated into a risk rating and a remediation cost estimate a
        non-engineer can read. That synthesis step is where a fast-screening engagement spends its 3-5
        business days, and where a full diligence engagement spends its 1-2 weeks digging into the findings
        that actually matter for the deal.
      </p>

      <h2>Why the tier you choose changes the timeline, not just the price</h2>
      <p>
        An investment-screening pass is fast because it&apos;s scoped to answer one question — is there
        anything here that should stop this deal or change the offer — not to produce an exhaustive
        inventory of every finding in the codebase. A full technical diligence engagement takes longer
        because it goes deeper on exactly the findings a screening pass would only flag: verifying whether
        a security exposure is actually exploitable in production, confirming whether a bus-factor risk is
        as concentrated as the commit history suggests, and pricing remediation in engineer-days rather than
        a risk-rating label. Choosing the tier is choosing how much certainty the timeline needs to buy.
      </p>

      <h2>What this means for a deal team weighing whether to skip diligence entirely</h2>
      <p>
        The traditional 2-3 week timeline and $50,000+ price tag are exactly why mid-market and smaller
        deals have historically skipped technical review altogether — the diligence cost and calendar time
        didn&apos;t make sense relative to deal size. A multi-day, five-figure engagement changes that
        math for a much larger share of the deals a fund or acquirer actually looks at, which is the more
        significant shift than the timeline number on its own.
      </p>

      <p>
        <Link href="/due-diligence" className="font-semibold">
          See how Audit Bench Ai&apos;s technical due diligence engagements are scoped →
        </Link>
      </p>

      <p>
        <Link href="/blog/technical-due-diligence-red-flags" className="font-semibold">
          Read which findings actually kill deals →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
