import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'reviewing-rate-limiting-and-abuse-prevention')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function ReviewingRateLimitingAndAbusePreventionPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        New endpoints usually get built to satisfy a feature requirement, not to withstand abuse, and that gap is
        rarely intentional — it is just what happens when the person building a login form or an export button is
        focused on making it work correctly, not on how many times a minute someone could hit it. Rate limiting and
        abuse prevention tend to get added after an incident rather than before one. Reviewing for this ahead of
        time means asking a specific question about every new endpoint: what happens if this gets called far more
        often than any legitimate user would ever call it.
      </p>

      <h2>Which endpoints need abuse controls by default</h2>
      <ul>
        <li>Authentication flows — login, signup, password reset, and one-time-code verification — which are the
        most common target for credential stuffing and brute-force attempts.</li>
        <li>Anything that sends an email, SMS, or push notification on behalf of a user, since these can be abused
        to spam third parties or exhaust a messaging budget.</li>
        <li>Expensive operations like report generation, bulk export, or search across large datasets, which can
        degrade the whole system if called repeatedly with no limit.</li>
        <li>Any write endpoint exposed to the public internet without authentication, such as a contact form,
        signup waitlist, or public API.</li>
      </ul>

      <h2>Common gaps reviewers should look for</h2>
      <p>
        Rate limiting is often present somewhere in a system but still leaves a gap for a specific new endpoint. A
        limit applied only per IP address is easy to bypass with rotating proxies or a botnet, and does nothing
        against a single attacker with a small pool of rotating addresses. A limit applied only at an API gateway
        does nothing to protect a service that can also be called directly by another internal service, a mobile
        client using a different code path, or a newly added route that was not registered with the gateway rule.
        Failed login attempts are sometimes counted together with successful ones, which dilutes the signal that
        actually matters for detecting brute force. And a brand-new endpoint that reuses an existing, previously
        unprotected route&apos;s middleware stack can silently inherit a gap that nobody meant to leave open.
      </p>

      <h2>Specific patterns worth flagging</h2>
      <ul>
        <li>Account enumeration through different error messages for &quot;user not found&quot; versus &quot;wrong
        password,&quot; which lets an attacker map out valid accounts before ever trying to brute force one.</li>
        <li>No lockout, delay, or CAPTCHA step-up after a run of failed attempts on a single account or from a
        single source.</li>
        <li>No exponential backoff on retries, allowing an attacker to keep attempting at full speed indefinitely.</li>
        <li>A rate limit that resets per request rather than being tracked over a sliding window, making it
        trivial to burst just under the limit repeatedly.</li>
      </ul>

      <h2>Rate limiting alone does not stop coordinated abuse</h2>
      <p>
        A single rate limit rule assumes abuse looks like one source hitting an endpoint too fast. Credential
        stuffing and coordinated abuse often look nothing like that — valid-looking credentials tried at low volume
        across many different accounts, spread across many IP addresses, each individually well under any
        reasonable per-IP or per-account limit. Reviewers should treat rate limiting as one layer, not the whole
        answer, and check whether the system also has a way to detect distributed patterns — unusual login
        locations, a spike in failed logins across the account base as a whole, or device and behavior signals
        beyond simple request counts.
      </p>

      <h2>Test abuse controls like a feature, not an afterthought</h2>
      <p>
        The most useful review question is concrete: what happens if this endpoint receives a thousand requests a
        second from one IP address, from a hundred different IP addresses, or from one authenticated user hammering
        it as fast as possible. If nobody can answer that question with confidence during review, the endpoint is
        not actually ready to ship, even if its happy-path functionality works perfectly.
      </p>

      <h2>Checklist for endpoints in review</h2>
      <ol>
        <li>Authentication-related endpoints have a rate limit or lockout that accounts for both per-IP and
        per-account abuse.</li>
        <li>Rate limits are enforced at the service level, not only at a gateway that some callers can bypass.</li>
        <li>Failed and successful attempts are tracked separately where that distinction matters, such as login.</li>
        <li>Expensive operations (export, search, report generation) have a limit that reflects their real cost,
        not the same generic limit applied everywhere.</li>
        <li>New endpoints do not silently inherit an existing gap by reusing an unprotected route&apos;s
        configuration.</li>
      </ol>

      <p>
        <Link href="/blog/secure-code-review-for-api-changes" className="font-semibold">
          Read about reviewing API changes for security risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/code-security-review-signals-that-matter" className="font-semibold">
          See the code security review signals that matter →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
