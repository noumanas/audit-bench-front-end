import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { BLOG_POSTS } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides and explainers on AI code review, application security, and secure coding practices — from the team building Audit Bench Ai.',
  alternates: { canonical: '/blog' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <Reveal>
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">Blog</div>
          <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4] sm:text-4xl">Guides on code review and security</h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-on-ink">
            Explainers and practical guides on AI code review, application security, and secure coding —
            written by the team building Audit Bench Ai.
          </p>
        </Reveal>
      </section>

      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-3xl space-y-4">
          {posts.length === 0 && <p className="text-sm text-muted-on-paper">No posts yet — check back soon.</p>}
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="row-hover group block rounded-lg border border-paper-line bg-paper-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="mb-1.5 text-lg font-bold text-[#1C2128] group-hover:text-cobalt">{post.title}</h2>
              <p className="text-sm leading-relaxed text-muted-on-paper">{post.description}</p>
            </Link>
          ))}
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
