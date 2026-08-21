import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'jwt-authentication-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function JwtAuthenticationCodeReviewPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Authentication — proving who someone is — is a different problem from authorization, which is deciding
        what they&apos;re allowed to do once you know. Broken access control, the authorization failure, gets a
        lot of attention because it&apos;s common and usually a simple missing check. Authentication has its own
        recurring mistake patterns, and because so many of today&apos;s applications hang their entire session
        model on a JSON Web Token, those mistakes tend to look the same across otherwise unrelated codebases.
      </p>

      <h2>The &quot;alg: none&quot; and algorithm-confusion mistakes</h2>
      <p>
        A JWT carries its signing algorithm in its own header, and some JWT libraries — especially older ones —
        will trust whatever algorithm the token claims rather than the one the server actually expects.
        Historically this allowed an attacker to submit a token with <code>&quot;alg&quot;: &quot;none&quot;</code>{' '}
        and have it accepted with no signature at all. A closely related mistake is algorithm confusion: a server
        configured to verify tokens with an asymmetric algorithm like RS256, using a public key, that can also be
        tricked into accepting a token signed with HS256 using that same public key as if it were a shared HMAC
        secret. Both are library-configuration issues, and both are worth confirming explicitly rather than
        assuming the library&apos;s defaults are safe.
      </p>

      <h2>Signature verification that isn&apos;t actually happening</h2>
      <p>
        Most JWT libraries expose a <code>decode</code> function and a separate <code>verify</code> function —
        decode reads the payload without checking the signature at all, verify does both. It is an easy mistake
        to call decode because it&apos;s convenient for reading a claim, and never realize the signature was never
        checked. Any code path that trusts a claim from a decoded-but-unverified token is equivalent to trusting
        whatever the client sends, no matter how legitimate the rest of the authentication flow looks.
      </p>

      <h2>Token lifecycle mistakes</h2>
      <ul>
        <li>No expiration claim set, or an expiration far longer than is reasonable for what the token grants
        access to.</li>
        <li>No way to revoke a token before it naturally expires — a purely stateless JWT setup has no answer for
        &quot;log this user out everywhere&quot; or &quot;invalidate every token issued before this password
        change.&quot;</li>
        <li>Refresh tokens that can be reused indefinitely rather than rotated on each use, with reuse of an old
        refresh token treated as a sign of theft.</li>
        <li>Sensitive claims (role, permission level) embedded in the token and trusted long after they might have
        changed server-side.</li>
      </ul>

      <h2>Session-cookie mistakes for teams not using JWTs</h2>
      <p>
        Traditional server-side sessions have their own well-known failure modes worth checking in review:
        session fixation, where a session identifier issued before login is kept after login instead of being
        rotated, letting an attacker who set that ID in advance hijack the authenticated session; missing{' '}
        <code>Secure</code>, <code>HttpOnly</code>, or <code>SameSite</code> cookie flags on the session cookie;
        and session identifiers generated with anything less than a cryptographically secure random source,
        making them guessable.
      </p>

      <h2>Checklist for reviewing authentication code</h2>
      <ol>
        <li>The JWT library is configured to accept only the specific algorithm the server expects, not whatever
        the incoming token claims.</li>
        <li>Every code path that reads a claim from a token has gone through actual signature verification, not
        just a decode call.</li>
        <li>Tokens have a reasonable expiration, and there is a real mechanism to invalidate them early when
        needed.</li>
        <li>Refresh tokens rotate on use, with reuse of a stale token treated as a signal, not ignored.</li>
        <li>Session identifiers are rotated after login and carry <code>Secure</code>, <code>HttpOnly</code>, and
        an explicit <code>SameSite</code> setting.</li>
      </ol>

      <p>
        <Link href="/blog/reviewing-broken-access-control" className="font-semibold">
          Read about reviewing broken access control before it ships →
        </Link>
      </p>

      <p>
        <Link href="/blog/secrets-and-api-keys-in-source-code" className="font-semibold">
          See how to keep secrets and API keys out of source code →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
