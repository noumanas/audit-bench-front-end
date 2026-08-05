import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'auditing-monorepos-without-losing-signal')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AuditingMonoreposWithoutLosingSignalPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Monorepos are efficient for sharing code, standards, and tooling. They are also easy to audit badly if every
        change is treated as equally important. The core challenge is preserving signal while the repository grows.
      </p>

      <h2>What breaks first</h2>
      <ul>
        <li>Reviewers lose context across many packages.</li>
        <li>Automated checks become too broad to be useful.</li>
        <li>Small changes get buried under large unrelated diffs.</li>
        <li>Security-sensitive changes are harder to prioritize correctly.</li>
      </ul>

      <h2>How to keep signal high</h2>
      <ul>
        <li>Scope audits to the files and packages that changed.</li>
        <li>Use ownership boundaries to route the right reviewers.</li>
        <li>Separate structural changes from behavior changes where possible.</li>
        <li>Make risky patterns easy to surface, not buried in the noise.</li>
      </ul>

      <h2>The real goal</h2>
      <p>
        A monorepo audit should answer one question quickly: what changed that could break users or create risk?
        If the system cannot answer that, it is generating output, not insight.
      </p>

      <p>
        <Link href="/blog/static-analysis-vs-ai-review" className="font-semibold">
          See how automation fits in →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
