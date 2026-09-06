import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ai-coding-assistants-monolith-by-default')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AiCodingAssistantsMonolithByDefaultPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Ask an AI coding assistant to add a feature and it will almost always take the path of least resistance:
        find the file that looks most related, and add the new logic there. That instinct is reasonable in
        isolation — it&apos;s the smallest possible diff, and it doesn&apos;t require the assistant to invent a
        new module boundary the human didn&apos;t ask for. Repeated across a hundred features, it produces a
        route handler, a service class, or a controller that has quietly grown into the de facto home for
        half the application&apos;s logic.
      </p>

      <h2>Why the assistant reaches for the nearest file</h2>
      <p>
        Proposing a new file, module, or service boundary carries a kind of risk an assistant is tuned to avoid:
        it might guess wrong about where the seam should be, second-guess a structure the developer already had
        in mind, or produce a larger, harder-to-review diff. Adding five more lines to an existing function is
        always defensible. Splitting that function into two responsibilities requires a judgment call about the
        codebase&apos;s future shape that the assistant has no reliable way to make from a single prompt. So it
        doesn&apos;t make the call — it defers, every time, to the smallest local change.
      </p>

      <h2>The 800-line route handler</h2>
      <p>
        This is the concrete shape the problem takes in practice: an endpoint that started as
        &quot;fetch the user and return their profile&quot; accretes validation, authorization checks, a
        notification side effect, an analytics event, a cache invalidation, and eventually a second unrelated
        feature that just needed <em>something</em> to run after the user was fetched. None of these additions
        was wrong on its own. The handler as a whole is now a single point of failure for testing, review, and
        change — one file that has to be understood in full before anyone can safely touch any part of it.
      </p>

      <h2>Why &quot;it still works&quot; hides the cost</h2>
      <p>
        A monolithic handler usually still passes its tests and behaves correctly, which is exactly why this
        doesn&apos;t get flagged as a bug. The cost shows up later and elsewhere: a change to the notification
        logic now requires understanding the authorization logic sitting next to it to be sure nothing gets
        broken; a new engineer can&apos;t safely modify one concern without reading the whole file; and the blast
        radius of a bug in any one responsibility now includes every other responsibility bundled into the same
        function. Correctness and maintainability are different axes, and AI-generated code is optimized far more
        reliably for the first than the second.
      </p>

      <h2>What good boundary-drawing looks like</h2>
      <p>
        The fix isn&apos;t to demand a new microservice for every feature — that overcorrects into its own kind of
        debt. It&apos;s to notice, at review time, when a file is accumulating unrelated responsibilities and to
        explicitly prompt for extraction: &quot;pull the notification logic into its own function, called from
        here.&quot; An AI assistant is generally good at executing a well-specified extraction once asked; it
        just won&apos;t propose the extraction unprompted, because that requires foresight about the codebase
        that a single feature-request prompt doesn&apos;t give it.
      </p>

      <h2>Checklist for reviewing AI-generated feature additions</h2>
      <ol>
        <li>Check the size and responsibility count of the file being modified, not just the diff — a
        five-line addition to an 800-line handler is a different review than a five-line addition to a
        40-line one.</li>
        <li>When a handler starts doing more than one distinct thing (fetch and notify, validate and log), flag
        it for extraction rather than approving the incremental addition.</li>
        <li>Ask whether the new logic belongs to an existing responsibility or is a new one being bolted onto the
        nearest convenient file.</li>
        <li>Periodically review the largest files in the codebase specifically for accumulated, unrelated
        responsibilities, since this pattern never triggers a test failure on its own.</li>
      </ol>

      <p>
        <Link href="/blog/auditing-monorepos-without-losing-signal" className="font-semibold">
          Read how to audit monorepos without losing signal →
        </Link>
      </p>

      <p>
        <Link href="/blog/how-to-review-generated-code-for-production-risk" className="font-semibold">
          See how to review generated code for production risk →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
