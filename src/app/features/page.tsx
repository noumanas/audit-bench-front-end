import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { FeaturesTabs } from '@/components/FeaturesTabs';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Repo, PR, and file review. Security, logic, performance, and architecture findings. Fix-and-re-audit, a CLI built for CI, team dashboards, reports, and integrations — everything audit/bench does.',
  alternates: { canonical: '/features' },
};

export default function FeaturesPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Features
          </div>
          <h1 className="mb-4 max-w-2xl text-3xl leading-tight font-bold text-[#E8ECF4] sm:text-4xl">
            Everything audit/bench does, before you ship it.
          </h1>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-muted-on-ink">
            One engine, applied everywhere your code moves — a file, a repo, a pull request, a pipeline. Pick a
            category below to see it in action.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white">
              Get started free
            </Link>
            <Link
              href="/cli"
              className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink hover:text-[#E8ECF4]"
            >
              CLI docs
            </Link>
          </div>
        </div>
      </section>

      <FeaturesTabs />

      <section className="border-t border-ink-line bg-ink px-6 py-16 text-center">
        <h2 className="mb-3 text-2xl font-bold text-[#E8ECF4]">See it on your own code</h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
          No credit card required. Connect GitHub or GitLab, or upload a .zip, and get a real verdict on real code.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white">
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink hover:text-[#E8ECF4]"
          >
            See pricing
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
