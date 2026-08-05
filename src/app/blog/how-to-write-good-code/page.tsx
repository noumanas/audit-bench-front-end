import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-write-good-code')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToWriteGoodCodePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        How to write good code is one of the most important skills a developer can learn, because code is read far
        more often than it is written. Good code is not just code that works today. It is code that other people can
        understand, test, change, and trust tomorrow without fear of breaking something unexpected.
      </p>

      <p>
        If you want to write good code consistently, start by making the next person&apos;s job easier. That person
        may be your teammate, your future self, or a reviewer trying to understand a change under time pressure.
        Clarity matters more than cleverness. Small, named functions matter more than giant blocks of logic. And
        explicit behavior matters more than hidden assumptions.
      </p>

      <h2>Write for humans first</h2>
      <p>
        The best code explains itself. Variable names should describe intent, functions should do one thing well,
        and files should stay focused on a single responsibility when possible. If a reader has to decode every line
        to understand the goal, the code may still run correctly, but it is harder to maintain and easier to break.
      </p>

      <h2>Make correctness easy to verify</h2>
      <p>
        Good code is easier to test because its boundaries are obvious. Inputs are validated early, side effects are
        isolated, and edge cases are handled intentionally. When the structure is clean, tests can focus on behavior
        instead of fighting complex setup. That is one of the clearest signs that you are learning how to write good
        code instead of just how to make something pass once.
      </p>

      <h2>Reduce surprises</h2>
      <p>
        Surprises are expensive. Avoid mixing unrelated responsibilities, avoid magic numbers when a named constant
        would be clearer, and avoid duplicating business logic in multiple places. The less hidden coupling your
        code has, the easier it is to evolve safely when requirements change.
      </p>

      <h2>Prefer simple over impressive</h2>
      <p>
        Simple code is usually not simplistic code. It is code whose behavior can be explained in a few sentences,
        code whose failure modes are known, and code whose structure matches the problem it solves. A simple design
        is often more valuable than an elegant but fragile one.
      </p>

      <h2>Use review and tests as a feedback loop</h2>
      <p>
        Reviews and tests help you learn whether your code is truly understandable. If reviewers keep asking the same
        questions, the code may be too dense. If tests are hard to write, the design may be too coupled. Over time,
        this feedback makes you better at writing code that survives real-world change.
      </p>

      <p>
        In practice, how to write good code comes down to a few habits: keep things small, name things clearly,
        isolate risky behavior, and make correctness visible. Developers who do that well ship code that is easier
        to maintain, easier to audit, and easier for teams to trust.
      </p>

      <p>
        <Link href="/blog/pr-review-checklist-for-engineers" className="font-semibold">
          See the review checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
