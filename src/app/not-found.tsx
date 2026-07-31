import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

// A visited-but-missing URL shouldn't get indexed as if it were real content.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div>
      <section className="flex min-h-[60vh] flex-col items-center justify-center border-b border-ink-line bg-ink px-6 py-20 text-center">
        <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">404</div>
        <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4] sm:text-4xl">This page doesn&apos;t exist</h1>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-on-ink">
          The link that brought you here is broken, or the page moved. Here&apos;s where you probably meant to go.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
          >
            Go home
          </Link>
          <Link
            href="/features"
            className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
          >
            See features
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
          >
            View pricing
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
