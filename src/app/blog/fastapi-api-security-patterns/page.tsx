import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'fastapi-api-security-patterns')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function FastapiApiSecurityPatternsPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        FastAPI makes it straightforward to build APIs quickly, but speed and safety are not the same thing. The
        difference between a demo API and a production API usually comes down to how carefully you handle trust
        boundaries.
      </p>

      <h2>Authentication is not authorization</h2>
      <p>
        A user being logged in does not mean they are allowed to access every object or action. FastAPI projects
        should make authorization explicit, ideally at the dependency or service layer where it is hard to skip by
        accident.
      </p>

      <h2>Validate input aggressively</h2>
      <p>
        Request validation should happen at the boundary and should fail fast. Strong Pydantic models reduce the
        amount of defensive code deeper in the system and make bad requests obvious.
      </p>

      <h2>Prefer safe defaults</h2>
      <ul>
        <li>Do not expose debug behavior in production.</li>
        <li>Do not return internal exceptions to clients.</li>
        <li>Do not trust client-provided identifiers without ownership checks.</li>
        <li>Do not let CORS or middleware settings drift without review.</li>
      </ul>

      <h2>Design for failure</h2>
      <p>
        APIs fail in the real world because downstream services time out, databases reject queries, or tokens expire
        at awkward times. The safer API is the one that handles failure predictably and never turns a temporary
        outage into a security event.
      </p>

      <p>
        <Link href="/blog/fastapi-production-readiness-guide" className="font-semibold">
          Continue with the production guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
