'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';
import { BLOG_POSTS } from '@/lib/blog';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const POSTS_PER_PAGE = 8;

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function BlogIndexClient() {
  const searchParams = useSearchParams();
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const currentPage = parsePage(searchParams.get('page'));
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, start + POSTS_PER_PAGE);

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
          {pagePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="row-hover group flex gap-5 rounded-lg border border-paper-line bg-paper-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
            >
              {post.image && (
                // eslint-disable-next-line @next/next/no-img-element -- local SVG cover art, no optimization needed
                <img
                  src={post.image}
                  alt=""
                  width={1200}
                  height={630}
                  className="hidden h-24 w-40 shrink-0 rounded-md border border-ink-line object-cover sm:block"
                />
              )}
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mb-1.5 text-lg font-bold text-[#1C2128] group-hover:text-cobalt">{post.title}</h2>
                <p className="text-sm leading-relaxed text-muted-on-paper">{post.description}</p>
              </div>
            </Link>
          ))}
        </Reveal>

        {posts.length > POSTS_PER_PAGE && (
          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-4 text-sm">
            <PageNav label="Previous" href={page > 1 ? `/blog?page=${page - 1}` : null} disabled={page <= 1} />
            <div className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">
              Page {page} of {totalPages}
            </div>
            <PageNav label="Next" href={page < totalPages ? `/blog?page=${page + 1}` : null} disabled={page >= totalPages} />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function PageNav({
  label,
  href,
  disabled,
}: {
  label: string;
  href: string | null;
  disabled: boolean;
}) {
  if (disabled || !href) {
    return <span className="rounded-lg border border-paper-line px-4 py-2 text-muted-on-paper opacity-50">{label}</span>;
  }

  return (
    <Link href={href} className="rounded-lg border border-paper-line px-4 py-2 font-semibold text-[#1C2128] hover:border-cobalt/40 hover:text-cobalt">
      {label}
    </Link>
  );
}
