import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'secrets-in-ci-cd')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecretsInCiCdPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        CI/CD pipelines are one of the easiest places to leak secrets because they combine code, automation, and
        third-party integrations. A mistake in one place can expose credentials to logs, forks, artifacts, or
        downstream jobs.
      </p>

      <h2>Common failure modes</h2>
      <ul>
        <li>Secrets printed in build logs</li>
        <li>Untrusted pull requests getting access to privileged credentials</li>
        <li>Overly broad environment secrets shared across too many jobs</li>
        <li>Long-lived tokens that never rotate</li>
        <li>Artifacts or caches containing sensitive data</li>
      </ul>

      <h2>What to do instead</h2>
      <ul>
        <li>Limit secret scope to the smallest job or environment possible</li>
        <li>Use short-lived credentials when the platform supports them</li>
        <li>Protect release jobs from untrusted contributors</li>
        <li>Mask sensitive values and avoid echoing them in scripts</li>
        <li>Review workflow changes like application code, not just YAML</li>
      </ul>

      <h2>Why this matters</h2>
      <p>
        A secure app can still be compromised by a sloppy pipeline. If attackers can reach your secrets in CI, they
        can often reach your production systems too. That is why CI/CD deserves the same review rigor as the code
        being shipped.
      </p>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Map this to OWASP Top 10 →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
