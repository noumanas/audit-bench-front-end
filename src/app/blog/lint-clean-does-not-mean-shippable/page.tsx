import type { Metadata } from 'next';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'lint-clean-does-not-mean-shippable')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function LintCleanDoesNotMeanShippablePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Passing lint is a good sign, but it is not the same as being safe to ship. A file can be perfectly
        formatted and still contain a broken assumption, a risky control path, or a security problem that only
        shows up in real use.
      </p>

      <h2>What lint does not prove</h2>
      <ul>
        <li>That the code is correct</li>
        <li>That the behavior is secure</li>
        <li>That the file matches the intended product logic</li>
        <li>That the change is safe in production</li>
      </ul>

      <h2>Why this mistake happens</h2>
      <p>
        Teams often treat lint output as a quality signal for the whole file. It is only one signal. If the rest
        of the review process is weak, a lint-clean file can move through too quickly even when the important
        parts were never checked.
      </p>

      <h2>What reviewers should still confirm</h2>
      <ul>
        <li>The control flow matches the business requirement</li>
        <li>The file does not open a new trust boundary</li>
        <li>Secrets, tokens, and sensitive data stay protected</li>
        <li>The file’s failure mode is acceptable</li>
      </ul>

      <h2>The practical takeaway</h2>
      <p>
        Treat lint as the floor, not the finish line. If the file matters enough to merge, it matters enough to
        review for correctness and security after linting has done its job.
      </p>
    </BlogArticleLayout>
  );
}
