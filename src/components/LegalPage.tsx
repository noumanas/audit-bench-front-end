import Link from 'next/link';
import { Footer } from './Footer';
import { TextReveal } from './gsap/TextReveal';

/** Shared shell for Privacy, Terms and Contact: dark title band, readable prose body, footer. */
export function LegalPage({
  kicker,
  title,
  intro,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            {kicker}
          </div>
          <h1 className="mb-3 text-3xl leading-tight font-bold text-[#E8ECF4] sm:text-4xl">
            <TextReveal>{title}</TextReveal>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-on-ink">{intro}</p>
          {updated && (
            <p className="mt-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
              Last updated {updated}
            </p>
          )}
        </div>
      </section>
      <article className="bg-paper px-6 py-14">
        <div className="prose-blog mx-auto max-w-3xl text-sm leading-relaxed text-[#1C2128]">{children}</div>
        <nav
          aria-label="Legal"
          className="mx-auto mt-12 flex max-w-3xl flex-wrap gap-4 border-t border-paper-line pt-6 text-[13px]"
        >
          <Link href="/privacy" className="text-cobalt hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-cobalt hover:underline">
            Terms of Service
          </Link>
          <Link href="/security" className="text-cobalt hover:underline">
            Security &amp; Trust
          </Link>
          <Link href="/contact" className="text-cobalt hover:underline">
            Contact
          </Link>
        </nav>
      </article>
      <Footer />
    </div>
  );
}
