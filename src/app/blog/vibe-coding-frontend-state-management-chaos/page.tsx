import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'vibe-coding-frontend-state-management-chaos')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function VibeCodingFrontendStateManagementChaosPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Building a UI feature by feature, one prompt at a time, produces working screens quickly. It also
        produces, reliably, a frontend where the same piece of data — the current user, a cart total, a
        notification count — is held in more than one place at once, updated by more than one component, and
        occasionally shows two different values on the same screen. This isn&apos;t a framework problem or a skill
        problem. It&apos;s what happens when state decisions get made one component at a time, by a process with
        no visibility into the components that already exist.
      </p>

      <h2>Every prompt reaches for local state first</h2>
      <p>
        Asked to build a component, an AI assistant reaches for the smallest self-contained solution: a{' '}
        <code>useState</code> inside the component that needs the value. That&apos;s the correct default in
        isolation — it&apos;s simple, and it doesn&apos;t require touching any other file. The problem surfaces
        only when a second component, built in a separate prompt, needs the same piece of data and gets its own
        local copy instead of a shared source, because the assistant building it had no reason to know the first
        component&apos;s state existed, let alone reuse it.
      </p>

      <h2>Prop drilling as the default wiring pattern</h2>
      <p>
        When a later prompt does need to connect two components, the fastest fix — and the one an assistant will
        reach for without being asked otherwise — is passing the value down through props from whatever ancestor
        already has it. One layer of this is normal React. Five or six layers of components passing a prop
        through that they don&apos;t themselves use is a sign that the state actually belongs somewhere more
        central — context, a store, a query cache — and that no single prompt in the feature&apos;s history had
        enough visibility into the component tree to notice that at the time.
      </p>

      <h2>Two sources of truth that quietly drift</h2>
      <p>
        The more damaging version of this isn&apos;t inefficient wiring — it&apos;s genuine duplication: server
        data fetched and cached in two different components instead of one shared query, a form&apos;s draft
        value held both in local component state and in a global store, or a &quot;current user&quot; object
        fetched independently by three different features. Each copy updates correctly in response to its own
        events and incorrectly stays stale in response to everyone else&apos;s. The bug that results —
        &quot;the sidebar still shows the old name after I changed it in settings&quot; — is a state-architecture
        problem wearing the costume of a UI bug, and it won&apos;t be fixed by patching the sidebar.
      </p>

      <h2>Why this is hard to catch feature by feature</h2>
      <p>
        A single component reviewed on its own always looks reasonable — it fetches what it needs and renders it.
        The defect only exists in relation to other components elsewhere in the tree that fetch or hold the
        <em>same</em> logical value independently. Catching it requires asking a question no individual diff
        review naturally raises: does this value already exist somewhere else in the app&apos;s state, and if so,
        why is this component getting its own copy instead of subscribing to it.
      </p>

      <h2>What to ask for in review</h2>
      <ol>
        <li>Before approving a new piece of local state, check whether the same logical value — user, cart,
        auth status, feature flags — already exists elsewhere as shared state.</li>
        <li>Treat props passed through more than two or three intermediate components that don&apos;t use them as
        a signal to lift the state to context or a store, not as an acceptable wiring cost.</li>
        <li>For server data specifically, prefer a shared fetching/caching layer (a query library, a single
        store slice) over each component fetching independently, so &quot;stale in one place&quot; becomes
        structurally impossible rather than a bug to chase down later.</li>
        <li>When a bug report describes inconsistent values on the same screen, look for duplicated state before
        assuming a rendering or timing bug.</li>
      </ol>

      <p>
        <Link href="/blog/how-to-review-generated-code-for-production-risk" className="font-semibold">
          Read how to review generated code for production risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/why-small-diffs-improve-security-review" className="font-semibold">
          See why small diffs improve security review →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
