import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'why-file-linters-miss-security-bugs')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function WhyFileLintersMissSecurityBugsPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        File linters are useful because they are strict, fast, and predictable. Security bugs are usually not
        useful in those same ways. They often depend on application behavior, trust boundaries, or the way one
        file interacts with another. That is why a lint-clean file can still be unsafe to ship.
      </p>

      <h2>What linters are designed to do</h2>
      <p>
        Linters are built to enforce rules that can be expressed clearly and checked mechanically. They are
        excellent at style, syntax, and known anti-patterns, but they are not designed to understand whether a
        file gives the wrong person access to data or assumes a value is safe when it is not.
      </p>

      <h2>Why security is different</h2>
      <ul>
        <li>Security depends on context, not just code shape.</li>
        <li>Some bugs only appear when multiple files are considered together.</li>
        <li>Threats often involve attacker behavior, not just programmer mistakes.</li>
        <li>Many dangerous paths look normal at the line level.</li>
      </ul>

      <h2>Common blind spots</h2>
      <ul>
        <li>Authorization checks that are missing or incomplete</li>
        <li>Secrets exposed in logs or config files</li>
        <li>Unsafe default values hidden in helpers</li>
        <li>Validation that is technically present but logically wrong</li>
      </ul>

      <h2>What to do instead</h2>
      <p>
        Use the linter as a gate for mechanical quality, then use AI or human review to inspect the parts that
        depend on intent. Security review is about asking what could go wrong, not just whether the code compiles
        and passes style checks.
      </p>
    </BlogArticleLayout>
  );
}
