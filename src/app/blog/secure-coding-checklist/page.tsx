import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'secure-coding-checklist')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecureCodingChecklistPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        A secure coding checklist is useful only if it catches the things teams actually miss. The point is not to
        be exhaustive. The point is to make dangerous mistakes hard to overlook during review.
      </p>

      <h2>Before merge</h2>
      <ul>
        <li>Is access control enforced on the server?</li>
        <li>Are inputs validated and encoded in the correct context?</li>
        <li>Are secrets, tokens, and credentials kept out of code and logs?</li>
        <li>Are dependencies current and pinned where appropriate?</li>
        <li>Do tests cover security-sensitive paths and edge cases?</li>
      </ul>

      <h2>Design review</h2>
      <ul>
        <li>Does the workflow allow abuse, replay, or privilege escalation?</li>
        <li>Are failure states safe by default?</li>
        <li>Can a user act on another user&apos;s data by guessing an identifier?</li>
        <li>Does the system reveal too much detail in errors or logs?</li>
      </ul>

      <h2>Implementation review</h2>
      <ul>
        <li>Use parameterized queries and safe APIs for commands and templates.</li>
        <li>Prefer allowlists over blocklists for security-sensitive input.</li>
        <li>Check authorization at the point of use, not only at the edge.</li>
        <li>Handle nulls, timeouts, and downstream failures explicitly.</li>
        <li>Verify artifacts, updates, and build outputs where trust matters.</li>
      </ul>

      <h2>Release review</h2>
      <ul>
        <li>Confirm logging and alerting exist for suspicious behavior.</li>
        <li>Check that security headers and environment settings are correct.</li>
        <li>Make sure rollback paths are tested.</li>
        <li>Verify that observability tells you when the app is being abused.</li>
      </ul>

      <p>
        The best checklist is short enough to use on every meaningful change and specific enough to catch recurring
        mistakes. If a reviewer cannot apply it in two minutes, it is too long.
      </p>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Map it to OWASP Top 10 →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
