import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'security-by-design-for-web-apps')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecurityByDesignForWebAppsPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Security by design means the system is built so that the secure path is the default path. The practical
        effect is that the architecture, data model, and workflow all reduce the chance that developers need to
        remember security in every single line they write.
      </p>

      <h2>What changes in practice</h2>
      <ul>
        <li>Authentication and authorization become explicit design constraints.</li>
        <li>Trust boundaries are documented early.</li>
        <li>Dangerous assumptions are removed from the happy path.</li>
        <li>Failure states are designed to be safe, not merely tolerated.</li>
      </ul>

      <h2>How it changes reviews</h2>
      <p>
        Instead of asking only whether code is correct, reviewers ask whether the system could be abused, whether it
        leaks too much information, and whether a bad state can cascade into a bigger one. That shifts review from
        syntax to architecture.
      </p>

      <h2>Why teams struggle with it</h2>
      <p>
        Security by design is hard because it asks teams to make tradeoffs early, when requirements are still
        changing. But that is also why it matters: the earlier the decision is made, the cheaper it is to protect.
      </p>

      <p>
        A system built this way is easier to audit because the important boundaries were never hidden in the first
        place.
      </p>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Connect it to OWASP Top 10 →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
