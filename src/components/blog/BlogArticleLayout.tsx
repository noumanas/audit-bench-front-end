import Link from 'next/link';
import { Footer } from '@/components/Footer';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogArticleLayout({
  title,
  publishedAt,
  readingTime,
  children,
}: {
  title: string;
  publishedAt: string;
  readingTime: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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
      </section>

      <article className="bg-paper px-6 py-14">
        <div className="prose-blog mx-auto max-w-2xl text-sm leading-relaxed text-[#1C2128]">{children}</div>
      </article>

      <Footer />
    </div>
  );
}
