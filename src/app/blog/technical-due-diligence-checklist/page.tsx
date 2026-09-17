import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'technical-due-diligence-checklist')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function TechnicalDueDiligenceChecklistPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        A technical due diligence checklist for M&amp;A and investment deals, organized by category. Not
        every item applies to every deal — a pre-seed acqui-hire and a growth-stage platform acquisition
        need different depth — but this is the full set worth scoping in or explicitly scoping out before
        an engagement starts.
      </p>

      <h2>Security exposure</h2>
      <ul>
        <li>Known-vulnerable dependencies with available fixes, and whether any are internet-facing.</li>
        <li>Hardcoded secrets or API keys committed to the repository, including in old commit history.</li>
        <li>Authentication and authorization patterns — session handling, access control on
        multi-tenant data, admin-panel exposure.</li>
        <li>Whether the same class of vulnerability recurs across many endpoints, which signals a process
        gap rather than an isolated bug.</li>
      </ul>

      <h2>Dependency and license risk</h2>
      <ul>
        <li>Direct and transitive dependencies under copyleft licenses (GPL, AGPL) inside a proprietary
        codebase.</li>
        <li>Abandoned or unmaintained dependencies with no recent releases or security patches.</li>
        <li>Version pinning and lockfile discipline — whether builds are reproducible or drift silently.</li>
        <li>Any vendored or copy-pasted third-party code without a clear license.</li>
      </ul>

      <h2>Technical debt and code health</h2>
      <ul>
        <li>Test-coverage estimate on the paths that touch money, auth, and data integrity specifically —
        not just an aggregate percentage.</li>
        <li>Dead code: files nothing imports and that aren&apos;t entry points.</li>
        <li>Duplicate or copy-pasted logic implementing the same business rule in more than one place.</li>
        <li>Whether a CI pipeline actually runs tests and blocks merges on failure, or exists but isn&apos;t
        enforced.</li>
      </ul>

      <h2>Architecture consistency</h2>
      <ul>
        <li>Whether the current architecture can plausibly support the growth plan in the deal thesis, or
        needs a rewrite to get there.</li>
        <li>Circular dependencies and unclear service boundaries in a monolith or microservice split.</li>
        <li>Database schema design — normalization, indexing, and whether migrations are reversible.</li>
        <li>Single points of failure: one database, one region, one undocumented cron job everything
        depends on.</li>
      </ul>

      <h2>Talent concentration (bus-factor) risk</h2>
      <ul>
        <li>Commit and code-ownership distribution across the team, not just headcount.</li>
        <li>Whether the person with the most institutional knowledge is contractually committed to stay
        post-close.</li>
        <li>Documentation quality for the systems the most concentrated owner maintains.</li>
        <li>Recent or pending departures on the core engineering team.</li>
      </ul>

      <h2>Operational readiness</h2>
      <ul>
        <li>Monitoring, alerting, and incident-response practices — is anyone paged when something breaks.</li>
        <li>Backup and disaster-recovery testing, not just backup existence.</li>
        <li>Infrastructure-as-code coverage versus manually configured, undocumented production
        infrastructure.</li>
        <li>Cost structure of the current infrastructure relative to the growth plan&apos;s projected scale.</li>
      </ul>

      <h2>What a remediation estimate should include</h2>
      <ul>
        <li>Engineer-days to remediate each material finding, not just a severity label.</li>
        <li>A dollar range built from that estimate, usable directly in a valuation adjustment.</li>
        <li>A distinction between findings that block closing and findings that are normal post-close
        cleanup.</li>
      </ul>

      <p>
        <Link href="/due-diligence" className="font-semibold">
          See how Audit Bench Ai runs this checklist as an automated engagement →
        </Link>
      </p>

      <p>
        <Link href="/blog/technical-due-diligence-red-flags" className="font-semibold">
          Read which of these findings actually kill deals →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
