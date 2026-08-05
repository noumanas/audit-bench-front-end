import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogIndexClient } from './blog-index-client';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides and explainers on AI code review, application security, and secure coding practices — from the team building Audit Bench Ai.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  return (
    <Suspense fallback={<BlogIndexFallback />}>
      <BlogIndexClient />
    </Suspense>
  );
}

function BlogIndexFallback() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">Blog</div>
          <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4] sm:text-4xl">Guides on code review and security</h1>
          <p className="text-sm leading-relaxed text-muted-on-ink">
            Loading articles...
          </p>
        </div>
      </section>
    </div>
  );
}
