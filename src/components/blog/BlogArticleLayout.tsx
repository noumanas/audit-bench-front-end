import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { StructuredData } from '@/components/StructuredData';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogArticleLayout({
  slug,
  title,
  publishedAt,
  readingTime,
  image,
  children,
}: {
  slug: string;
  title: string;
  publishedAt: string;
  readingTime: string;
  image?: string;
  children: React.ReactNode;
}) {
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    datePublished: publishedAt,
    dateModified: publishedAt,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: articleUrl,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: title, item: articleUrl },
    ],
  };

  return (
    <div>
      <StructuredData data={[schema, breadcrumb]} />
      <section className="border-b border-ink-line bg-ink px-6 py-14">
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="mb-4 inline-block text-xs font-semibold text-muted-on-ink hover:text-[#E8ECF4]">
            ← All posts
          </Link>
          <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4] sm:text-4xl">{title}</h1>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            <span>·</span>
            <span>{readingTime}</span>
          </div>
        </div>
        {image && (
          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-xl border border-ink-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG cover art, no optimization needed */}
            <img src={image} alt="" className="block w-full" width={1200} height={630} />
          </div>
        )}
      </section>

      <article className="bg-paper px-6 py-14">
        <div className="prose-blog mx-auto max-w-2xl text-sm leading-relaxed text-[#1C2128]">{children}</div>
      </article>

      <Footer />
    </div>
  );
}
