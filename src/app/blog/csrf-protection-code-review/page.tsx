import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'csrf-protection-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function CsrfProtectionCodeReviewPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Cross-site request forgery exploits a basic fact about how browsers work: a browser attaches a
        site&apos;s cookies to a request no matter which page triggered that request. If a logged-in user visits
        a malicious page that quietly submits a form to your application, the browser sends the user&apos;s
        session cookie right along with it. CSRF gets less attention now that modern cookie defaults help contain
        it, but &quot;less attention&quot; and &quot;solved&quot; are not the same thing.
      </p>

      <h2>What actually needs CSRF protection</h2>
      <p>
        Any request that changes state — creates, updates, or deletes something — and authenticates using a
        cookie the browser sends automatically needs protection. That covers most <code>POST</code>,{' '}
        <code>PUT</code>, <code>PATCH</code>, and <code>DELETE</code> endpoints in a typical application. A{' '}
        <code>GET</code> request that changes state is a separate problem worth flagging on its own — GET requests
        should be safe to prefetch, cache, and link to without side effects, CSRF risk or not.
      </p>

      <h2>Why SameSite cookies reduce the risk but don&apos;t eliminate it</h2>
      <p>
        Modern browsers default new cookies to <code>SameSite=Lax</code>, which blocks most cross-site requests
        from carrying the cookie and has genuinely reduced how often CSRF gets exploited in the wild. It is not a
        complete fix. Lax mode still allows the cookie on a top-level GET navigation, which matters if a
        state-changing action can be triggered by GET. Older browsers and some in-app webviews don&apos;t enforce
        SameSite at all. And an application that authenticates through more than one mechanism — a session cookie
        with a bearer-token fallback, for example — can still be exposed through whichever path doesn&apos;t rely
        on the cookie being blocked.
      </p>

      <h2>Signs CSRF protection is missing or only looks present</h2>
      <ul>
        <li>A state-changing endpoint with no anti-CSRF token check at all, relying solely on the session cookie
        being present.</li>
        <li>A token that is checked for existence — &quot;is a token field present&quot; — without actually
        verifying its value against the one issued for that session.</li>
        <li>A CSRF token passed in the URL of a GET-triggered action, where it can leak through browser history,
        server logs, or the <code>Referer</code> header sent to third-party resources on the page.</li>
        <li>A double-submit-cookie implementation that compares the cookie value and the submitted value with a
        plain equality check instead of a constant-time comparison, or that doesn&apos;t tie the token to the
        session at all.</li>
      </ul>

      <h2>APIs are not automatically exempt</h2>
      <p>
        It is tempting to assume CSRF is a &quot;web forms&quot; problem and that a JSON API is naturally immune.
        That is only true if the API authenticates purely through a header the browser won&apos;t attach
        automatically, like a bearer token read from local storage. An API that authenticates via a
        browser-managed session cookie — common in single-page applications that share a domain with their
        backend — is exactly as exposed to CSRF as an HTML form, regardless of the request body being JSON
        instead of form-encoded fields.
      </p>

      <h2>Checklist for reviewing state-changing endpoints</h2>
      <ol>
        <li>Every state-changing request that relies on cookie-based authentication requires and verifies an
        anti-CSRF token, or is otherwise proven unreachable cross-site.</li>
        <li>No state-changing action is reachable via a plain <code>GET</code> request.</li>
        <li>CSRF tokens are transmitted in the request body or a custom header, never in a URL that could end up
        in logs, history, or a referrer.</li>
        <li>Cookie-authenticated APIs get the same CSRF review as HTML form submissions — the response format
        doesn&apos;t change the underlying browser behavior.</li>
        <li>SameSite cookie attributes are set deliberately, not left at whatever the framework or library
        defaults to.</li>
      </ol>

      <p>
        <Link href="/blog/secure-code-review-for-api-changes" className="font-semibold">
          Read about reviewing API changes for security risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/reviewing-broken-access-control" className="font-semibold">
          See how to review broken access control before it ships →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
