import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'python-dependency-hygiene')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function PythonDependencyHygienePage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Python dependency hygiene is not just about avoiding vulnerable packages. It is about keeping the supply
        chain understandable enough that a team can upgrade safely, review changes honestly, and recover when
        something breaks.
      </p>

      <h2>Why hygiene matters</h2>
      <p>
        Python projects often accumulate dependencies quickly because the ecosystem makes it easy to add libraries.
        That is a strength, but it also means teams need a discipline for reviewing why a dependency exists and what
        risk it introduces.
      </p>

      <h2>Good habits</h2>
      <ul>
        <li>Pin versions deliberately instead of floating everything.</li>
        <li>Keep a lockfile or reproducible environment strategy.</li>
        <li>Review transitive dependencies when upgrading major packages.</li>
        <li>Separate runtime dependencies from tooling dependencies.</li>
        <li>Upgrade regularly so security fixes do not become giant diffs.</li>
      </ul>

      <h2>What to watch for</h2>
      <p>
        The biggest risk is not only a known CVE. It is dependency sprawl: packages that nobody remembers adding,
        libraries that overlap in purpose, and upgrades deferred until they become painful.
      </p>

      <p>
        Healthy dependency hygiene makes audits easier because the codebase has fewer hidden assumptions and fewer
        surprises when a package changes behavior.
      </p>

      <p>
        <Link href="/blog/8-python-libraries-cleaner-smarter-maintainable-code" className="font-semibold">
          See the Python tooling guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
