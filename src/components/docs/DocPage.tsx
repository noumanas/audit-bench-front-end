import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { StructuredData } from '@/components/StructuredData';
import { docBySlug, docGroupOf, docHref, docNeighbours } from '@/lib/docs';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

/** Page metadata from the docs table of contents, so titles and descriptions live in one place. */
export function docMetadata(slug: string): Metadata {
  const page = docBySlug(slug);
  return {
    title: slug ? `${page.title} · Docs` : 'Documentation',
    description: page.description,
    alternates: { canonical: docHref(slug) },
  };
}

/**
 * TechArticle + BreadcrumbList for a docs page, so search engines and AI
 * answer engines know what the page is, where it sits, and when it changed.
 */
function docSchema(slug: string, updated?: string) {
  const page = docBySlug(slug);
  const url = `${SITE_URL}${docHref(slug)}`;
  // "November 1, 2026" parses as local midnight; build the ISO date from local parts so it can't slip a day.
  const parsed = updated ? new Date(updated) : undefined;
  const modified =
    parsed && !Number.isNaN(parsed.getTime())
      ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
      : undefined;
  const crumbs = [
    { name: 'Documentation', url: `${SITE_URL}/docs` },
    ...(slug ? [{ name: page.title, url }] : []),
  ];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: page.title,
      description: page.description,
      url,
      ...(page.keywords ? { keywords: page.keywords.join(', ') } : {}),
      ...(modified ? { dateModified: modified } : {}),
      inLanguage: 'en',
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    },
  ];
}

/**
 * One docs page: group kicker, title and subtitle from lib/docs, the
 * content, then previous/next links and a way to report a problem.
 */
export function DocPage({ slug, updated, children }: { slug: string; updated?: string; children: ReactNode }) {
  const page = docBySlug(slug);
  const { prev, next } = docNeighbours(slug);

  return (
    <article data-docs-article>
      <StructuredData data={docSchema(slug, updated)} />
      <header className="mb-8 border-b border-ink-line pb-6">
        <p className="mb-2 text-[11px] font-medium tracking-[0.14em] text-cobalt uppercase">
          {docGroupOf(slug)}
        </p>
        <h1 className="text-3xl text-white sm:text-[2rem] font-light tracking-[-0.03em]">{page.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-on-ink">{page.description}</p>
      </header>

      <div className="docs-prose">{children}</div>

      <footer className="mt-14 border-t border-ink-line pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={docHref(prev.slug)}
              className="group rounded-lg border border-ink-line p-4 transition-colors hover:border-cobalt/60"
            >
              <span className="block text-[11px] text-muted-on-ink">← Previous</span>
              <span className="block text-sm font-semibold text-white group-hover:text-white">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={docHref(next.slug)}
              className="group rounded-lg border border-ink-line p-4 text-right transition-colors hover:border-cobalt/60"
            >
              <span className="block text-[11px] text-muted-on-ink">Next →</span>
              <span className="block text-sm font-semibold text-white group-hover:text-white">{next.title}</span>
            </Link>
          )}
        </div>
        <p className="mt-6 flex flex-wrap justify-between gap-2 text-[12px] text-muted-on-ink">
          <span>
            Something unclear or out of date?{' '}
            <Link href="/contact" className="text-[#a58bff] hover:underline">
              Tell us
            </Link>
            .
          </span>
          {updated && <span>Last updated {updated}</span>}
        </p>
      </footer>
    </article>
  );
}
