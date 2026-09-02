import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'technical-due-diligence-red-flags')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function TechnicalDueDiligenceRedFlagsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Most technical due diligence findings don&apos;t kill a deal on their own — a missing test suite or a
        stale dependency is normal for a company that&apos;s been shipping fast. What actually moves a valuation
        or stalls a term sheet is a small set of patterns that point at concentrated, hard-to-fix risk sitting
        underneath the product. Knowing which findings are cosmetic and which are structural is most of the job.
      </p>

      <h2>Bus-factor risk concentrated in one person</h2>
      <p>
        A codebase where one engineer authored the majority of commits across the core service, and especially
        where that engineer is a founder who may not stay on post-acquisition, is one of the findings investors
        weigh most heavily — because it isn&apos;t fixable with money on a short timeline. Unlike a security bug,
        institutional knowledge can&apos;t be patched in a sprint. Diligence should quantify this directly: commit
        and code-ownership distribution across the team, not just headcount, and specifically whether the person
        with the most context is contractually committed to stay.
      </p>

      <h2>License exposure buried in the dependency tree</h2>
      <p>
        A single GPL or AGPL-licensed dependency pulled in transitively — not by a direct <code>import</code>, but
        several levels down in a dependency&apos;s own dependency tree — can force disclosure obligations on a
        proprietary codebase that the engineering team never noticed. This is a common and underweighted finding
        because it&apos;s invisible from the surface: nobody wrote <code>import gpl_library</code>, so nobody
        thought to check. A full dependency scan needs to walk the transitive tree, not just the top-level
        manifest.
      </p>

      <h2>Security findings that reveal a pattern, not an incident</h2>
      <p>
        One SQL injection bug in an old admin panel is a fix. The same class of bug appearing in twelve different
        endpoints across the codebase is a signal about how the team writes code, and that&apos;s what actually
        affects valuation — it implies every other endpoint deserves the same scrutiny, and that the fix isn&apos;t
        twelve line-changes but a process change. Diligence reports should group findings by root cause and
        recurrence, not just list them individually, so a reviewer can tell the difference between an incident and
        a pattern.
      </p>

      <h2>Architecture that doesn&apos;t match the growth story</h2>
      <p>
        A pitch built around 10x user growth paired with a single-tenant database with no sharding path, a
        monolith with no clear service boundaries, or synchronous processing on a path that needs to handle
        bursty load is a mismatch worth flagging even when nothing is currently broken. The question isn&apos;t
        whether the architecture works today — it&apos;s whether the remediation cost to support the stated growth
        plan was accounted for in the valuation at all.
      </p>

      <h2>Test coverage that&apos;s absent where risk is highest</h2>
      <p>
        Aggregate test coverage percentage is a weak signal on its own — what matters is whether coverage exists
        on the paths that touch money, auth, and data integrity specifically. A codebase with 60% overall coverage
        but none on the billing service is a materially different risk than the reverse, and a diligence report
        that only reports the aggregate number misses the finding that actually matters for underwriting.
      </p>

      <h2>What a strong diligence report does differently</h2>
      <p>
        It separates findings that are expensive to fix (architecture, bus factor, license exposure) from
        findings that are cheap to fix (a missing header, an outdated minor dependency), and it prices the
        expensive ones in engineer-days and dollars rather than leaving the buyer to guess. A health score without
        that breakdown tells an investment committee less than a shorter list of prioritized, quantified risks.
      </p>

      <p>
        <Link href="/due-diligence" className="font-semibold">
          See how Audit Bench Ai&apos;s technical due diligence product works →
        </Link>
      </p>

      <p>
        <Link href="/blog/ai-generated-audit-report" className="font-semibold">
          Read what a good AI-generated audit report should include →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
