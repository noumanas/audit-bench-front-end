import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'vibe-coding-duplicated-business-logic')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function VibeCodingDuplicatedBusinessLogicPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Ask an AI assistant to add a discount calculation to checkout, and three months later ask it to add the
        same discount logic to an admin refund tool, and there&apos;s a real chance you end up with two separate
        implementations of the same business rule — each correct on its own, each subtly different in a rounding
        edge case, and neither aware the other exists. This is the most common way vibe coding breaks DRY, and
        it&apos;s structural rather than accidental: the assistant genuinely doesn&apos;t know the first
        implementation is there unless something tells it to look.
      </p>

      <h2>Why the model writes new code instead of finding old code</h2>
      <p>
        A human engineer who&apos;s worked in a codebase for months has a rough mental index of what already
        exists, and reaching for <code>calculateDiscount()</code> instead of writing it again is often just
        habit. An AI assistant&apos;s &quot;memory&quot; of the codebase is whatever fits in its current context
        window — the files it happened to read for this specific prompt. If the discount logic lives in a file
        the assistant didn&apos;t open, it doesn&apos;t exist as far as this prompt is concerned, and the fastest
        path to a working feature is writing the calculation fresh. This isn&apos;t a bug in the tool; it&apos;s a
        direct consequence of not having a persistent, searchable map of the codebase available at every
        prompt.
      </p>

      <h2>Why three copies is worse than it sounds</h2>
      <p>
        Duplicated logic written by a single careless human is usually duplicated consistently, because one
        person copy-pasted it. Duplicated logic written across separate AI sessions tends to diverge in small,
        specific ways — one copy rounds half-up, another rounds half-even; one copy applies the discount before
        tax, another after; one copy checks for a minimum order value, another doesn&apos;t. Each version reads as
        entirely reasonable in isolation. The business now has three slightly different definitions of
        &quot;discount,&quot; and no single code review ever saw all three at once to notice they disagree.
      </p>

      <h2>Where this shows up beyond pricing math</h2>
      <ul>
        <li>Permission checks re-implemented per endpoint instead of calling a shared authorization function —
        exactly the kind of drift that produces broken access control.</li>
        <li>Input validation rules duplicated between a form component and its corresponding API handler, which
        silently diverge as one gets updated and the other doesn&apos;t.</li>
        <li>Date/timezone handling reimplemented per feature, each with its own assumption about which timezone
        the underlying timestamp is stored in.</li>
        <li>Formatting and currency logic scattered across components instead of centralized, so a locale bug fix
        has to be found and applied in several places.</li>
      </ul>

      <h2>How to prevent it instead of finding it later</h2>
      <p>
        The fix is to make the existing implementation part of what the assistant sees before it writes anything.
        Prompting with &quot;search the codebase for existing discount or pricing logic before implementing this,
        and reuse it if found&quot; changes the assistant&apos;s default from write-first to search-first. Keeping
        a short reference of core business rules and where they live — in a README or a context file the assistant
        is pointed at — closes the gap that a limited context window otherwise leaves open.
      </p>

      <h2>Checklist for reviewing a diff that adds business logic</h2>
      <ol>
        <li>Search the codebase for an existing implementation of the same rule before approving a new one —
        this is the one check a diff-only review will never surface on its own.</li>
        <li>When duplication is unavoidable in the short term, leave an explicit comment or ticket noting both
        locations, so a future fix doesn&apos;t update one copy and miss the other.</li>
        <li>Treat validation and business rules that exist in two layers (client and server, form and API) as a
        drift risk, and confirm they&apos;re either shared or tested for equivalence.</li>
        <li>For high-stakes logic — pricing, permissions, tax — prefer a single, well-tested shared function over
        convenience duplication, even when the duplication looks small at review time.</li>
      </ol>

      <p>
        <Link href="/blog/how-to-review-ai-generated-code-without-trusting-it-blindly" className="font-semibold">
          Read how to review AI-generated code without trusting it blindly →
        </Link>
      </p>

      <p>
        <Link href="/blog/tests-that-catch-real-bugs" className="font-semibold">
          See how to write tests that catch real bugs →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
