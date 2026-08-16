import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'reviewing-broken-access-control')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function ReviewingBrokenAccessControlPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Broken access control has topped the OWASP Top 10 for years, and unlike some categories on that list it is
        rarely subtle. Most access control failures are not clever exploits — they are a missing <code>if</code>{' '}
        statement. An endpoint that fetches a resource by ID without checking whether the requester actually owns
        it. A role check that happens on the page that renders a button, but not on the API the button calls. A
        permission that is enforced on the main path through a feature but forgotten on a secondary one added later.
        Catching these in review is less about spotting a hard-to-find bug and more about asking the same question,
        consistently, on every endpoint that touches data.
      </p>

      <h2>The question every endpoint has to answer</h2>
      <p>
        For any code that reads, writes, or deletes a resource, a reviewer should be able to point to the exact line
        that answers: is the current user actually allowed to do this to this specific resource. Not allowed to do
        this kind of action in general — allowed to do it to this particular row, record, or object. If that check
        is missing, implicit, or only enforced somewhere else in the stack that this code path does not actually
        go through, that is a broken access control bug, whether or not anyone has found a way to exploit it yet.
      </p>

      <h2>IDOR: the most common access control bug in real systems</h2>
      <p>
        Insecure direct object reference happens when an endpoint looks up a resource by an identifier supplied in
        the request — a URL parameter, a body field, a query string — and returns or modifies it without confirming
        the current user is actually entitled to that resource. It is extremely common because it is easy to write
        correctly-looking code that is still wrong: fetching an invoice, order, or document by ID and rendering it,
        without a corresponding <code>WHERE owner_id = current_user.id</code> or equivalent check.
      </p>
      <ul>
        <li>A resource is fetched directly by ID with no ownership or tenant filter in the query.</li>
        <li>An update or delete endpoint accepts an ID in the request body and trusts it without re-verifying
        ownership server-side.</li>
        <li>A generic &quot;admin&quot; update endpoint allows editing fields — like role or account status — that
        should only be settable by a privileged caller, with no separate check for who is calling it.</li>
        <li>Sequential or guessable IDs make the problem worse, since an attacker does not even need another
        account&apos;s data leaked to them — they can simply try nearby IDs.</li>
      </ul>

      <h2>Multi-tenant systems turn access control bugs into data leaks</h2>
      <p>
        In a multi-tenant application, a missing ownership check is not just one user seeing another user&apos;s
        data — it can mean one customer seeing another customer&apos;s entire account. Reviewers working on
        multi-tenant code should specifically check that every query touching tenant-scoped data includes a
        tenant identifier in its filter, and that this scoping happens at the query level, not only in application
        logic that decides what to display after the data has already been fetched. Caches are a common blind spot
        here too — a cache keyed only by resource ID, without the tenant ID as part of the key, can leak data across
        tenants even when the underlying query was scoped correctly.
      </p>

      <h2>Privilege escalation from role and permission mistakes</h2>
      <p>
        Access control bugs are not only about which resource a user can reach — they are also about what a user is
        allowed to do once they get there. Common mistakes worth watching for in review include a role or
        permission check performed only on the client, with no server-side re-verification; a role or permission
        value read from a client-supplied token or cookie and trusted without confirming it against the
        authoritative source; and a permission check applied at the entry point of a feature but not re-applied on
        a nested action within it, such as checking access when opening a document but not when editing a
        specific section of it.
      </p>

      <h2>Checklist for any change touching access or authorization</h2>
      <ol>
        <li>Every resource lookup by ID includes an explicit ownership or tenant check at the query level.</li>
        <li>Role and permission checks happen server-side, on every request, not only in the UI.</li>
        <li>Sensitive fields (role, account status, billing plan) cannot be modified through a generic update
        endpoint without a specific authorization check.</li>
        <li>Caches, background jobs, and webhooks that handle tenant-scoped data are scoped by tenant, not only by
        resource ID.</li>
        <li>Permission checks are applied consistently across every action within a feature, not only the entry
        point.</li>
      </ol>

      <h2>&quot;It&apos;s protected by the UI&quot; is not an answer</h2>
      <p>
        A hidden button or a disabled menu item is a usability decision, not a security control. Any API endpoint
        that a hidden button would have called is still reachable directly, and it needs its own access check. When
        a reviewer hears that a feature is safe because the interface does not expose it to unauthorized users, the
        right response is to go find the underlying endpoint and check what happens when it is called directly with
        a valid session that simply lacks the intended permission.
      </p>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Read the OWASP Top 10:2025, explained →
        </Link>
      </p>

      <p>
        <Link href="/blog/secure-code-review-for-api-changes" className="font-semibold">
          See how to review API changes for security risk →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
