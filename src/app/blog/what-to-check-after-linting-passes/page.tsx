import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'what-to-check-after-linting-passes')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhatToCheckAfterLintingPassesPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Once a file passes linting, the review should shift from mechanical correctness to behavioral correctness.
        The file no longer needs another pass for indentation or naming. It needs a reviewer who can tell whether
        the change is safe, complete, and appropriate for the rest of the system.
      </p>

      <h2>Review the data flow</h2>
      <ul>
        <li>Where does the input come from?</li>
        <li>Who can control it?</li>
        <li>Where does the output go?</li>
        <li>Could the file leak sensitive data along the way?</li>
      </ul>

      <h2>Review the control flow</h2>
      <p>
        A clean file can still take the wrong branch, skip an important condition, or fail open when it should
        fail closed. That is especially important for security-sensitive code, where one missing branch can mean
        a privilege escalation or data exposure.
      </p>

      <h2>Review the boundaries</h2>
      <ul>
        <li>Authentication and authorization</li>
        <li>Configuration and environment variables</li>
        <li>Dependency updates and imports</li>
        <li>Error handling and logging</li>
      </ul>

      <h2>Review the user impact</h2>
      <p>
        A file is not done just because it is syntactically correct. Ask whether it helps the user, preserves
        the system’s invariants, and avoids introducing a new security or reliability risk. That is the real
        meaning of “ready to merge.”
      </p>
    </BlogArticleLayout>
  );
}
