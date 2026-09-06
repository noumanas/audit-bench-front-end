import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'vibe-coding-architecture-debt')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function VibeCodingArchitectureDebtPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Vibe coding — describing what you want in plain language and letting an AI assistant write the
        implementation, prompt after prompt, feature after feature — has a velocity curve that looks great for
        the first few weeks and then quietly inverts. Early features ship in minutes. Later features, which
        should be easier because there&apos;s more code to build on, start taking longer instead. The codebase
        isn&apos;t getting more capable with size — it&apos;s getting more expensive to change. That&apos;s
        architecture debt, and it accumulates faster under vibe coding than under a hand-written codebase for a
        specific, structural reason.
      </p>

      <h2>Why the curve inverts</h2>
      <p>
        A human engineer building feature twelve remembers, at least roughly, how features three and seven were
        built, and reaches for the same pattern out of habit. An AI assistant has no such continuity unless it
        re-reads the relevant files every time, and even then it optimizes for the prompt in front of it, not for
        consistency with decisions made in a session it doesn&apos;t remember. The result is a codebase that
        looks coherent inside any single file and incoherent across the project — three different ways of
        calling the API layer, two different error-handling conventions, one feature using a service class and
        the next reimplementing the same responsibility as a set of standalone functions.
      </p>

      <h2>Debt that&apos;s invisible file-by-file</h2>
      <p>
        This is the part that makes it hard to catch in normal review: every individual diff can look
        clean — reasonable variable names, no obvious bug, tests passing. The debt lives in the gaps{' '}
        <em>between</em> diffs, not inside any one of them. A reviewer approving pull requests one at a time has
        no vantage point from which to notice that this is the fourth distinct pattern for the same kind of
        problem. Catching it requires deliberately looking across the codebase, not just at the change in front
        of you — the same reason large-repository review needs its own approach.
      </p>

      <h2>The tell-tale signs</h2>
      <ul>
        <li>The same conceptual operation (validate a form, call an API, format a currency value) implemented
        differently in different features, with no shared utility for any of them.</li>
        <li>New features taking longer to build than old ones did, despite more of the &quot;hard part&quot;
        already existing in the codebase.</li>
        <li>A growing number of files that only one recent conversation&apos;s worth of context explains — no one
        on the team can say why a particular abstraction exists.</li>
        <li>Bug fixes that have to be applied in multiple places because the same logic was copied instead of
        shared.</li>
      </ul>

      <h2>Why this isn&apos;t a reason to avoid AI coding assistants</h2>
      <p>
        The instinct to blame the tool misses the actual failure mode: the debt accumulates because nothing is
        checking for cross-feature consistency, not because an AI wrote the code. A team using AI assistants with
        a deliberate review step for architectural drift accumulates this kind of debt no faster than a team of
        junior engineers working without a tech lead. The fix is process, not abstinence.
      </p>

      <h2>What actually slows the accumulation</h2>
      <ol>
        <li>Maintain a short, living document of the patterns the codebase has standardized on — how errors are
        handled, how services are structured — and reference it explicitly in prompts, so the assistant has
        something to converge on instead of reinventing the choice each time.</li>
        <li>Review new features against existing ones periodically, not just against their own diff — specifically
        looking for a second implementation of something that already exists.</li>
        <li>Treat &quot;this duplicates an existing pattern&quot; as a blocking review comment with the same
        weight as a correctness bug, since it&apos;s the finding a diff-only review is structurally unable to
        produce on its own.</li>
        <li>Budget time periodically to consolidate duplicated patterns into shared abstractions before the
        number of variants makes consolidation itself a multi-week project.</li>
      </ol>

      <p>
        <Link href="/blog/how-to-review-generated-code-for-production-risk" className="font-semibold">
          Read how to review generated code for production risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/security-review-patterns-for-large-codebases" className="font-semibold">
          See security review patterns for large codebases →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
