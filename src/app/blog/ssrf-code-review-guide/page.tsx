import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ssrf-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SsrfCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Server-side request forgery happens when server code makes an outbound HTTP request to a destination
        that a user fully or partially controls. The danger isn&apos;t the request itself — it&apos;s that the
        request originates from inside your infrastructure, with your server&apos;s network position and
        sometimes its credentials, letting an attacker use your own backend as a proxy into places the public
        internet was never supposed to reach.
      </p>

      <h2>Where SSRF hides in ordinary features</h2>
      <ul>
        <li>Webhook URL fields — anywhere a user configures a URL that your server will later call.</li>
        <li>&quot;Import from URL&quot; or link-preview and unfurling features that fetch a page to extract a
        title, image, or metadata.</li>
        <li>PDF or image generation that renders a user-supplied URL server-side.</li>
        <li>Logo or avatar fetching during signup or OAuth flows, where a URL is pulled from an external
        profile.</li>
        <li>Any server-side rendering step that resolves a link the user provided before displaying it.</li>
      </ul>

      <h2>Why cloud metadata endpoints raise the stakes</h2>
      <p>
        Most cloud providers expose an instance metadata service at a fixed link-local address (commonly{' '}
        <code>169.254.169.254</code>) that hands back information about the running instance — and, in
        misconfigured setups, temporary credentials for whatever role the instance runs as. If server-side code
        can be tricked into making a request to that address, SSRF stops being an information-disclosure
        curiosity and becomes a path to full credential theft and lateral movement inside the cloud account. This
        single fact is why SSRF is treated far more seriously today than its description — &quot;the server
        fetched a URL it shouldn&apos;t have&quot; — might initially suggest.
      </p>

      <h2>Blocklists are the wrong control</h2>
      <p>
        Checking a user-supplied URL against a list of forbidden strings like <code>localhost</code> or{' '}
        <code>127.0.0.1</code> feels like a fix and isn&apos;t one. Attackers route around it with alternate IP
        encodings (decimal, octal, or IPv6-mapped forms of a loopback address), DNS names that resolve to an
        internal address only at request time (DNS rebinding), and redirects — a URL that passes validation, then
        responds with a redirect to an internal address that the HTTP client follows without re-checking.
      </p>

      <h2>What a real fix looks like</h2>
      <ol>
        <li>Validate against an explicit allow list of expected hosts wherever the set of legitimate destinations
        is known in advance, rather than trying to block everything bad.</li>
        <li>Resolve the DNS name and check the resulting IP address is not in a private, loopback, or link-local
        range before opening the connection — checking the hostname string alone is not enough.</li>
        <li>Disable automatic redirect-following on outbound requests, or re-validate the destination after every
        redirect hop rather than trusting the first check.</li>
        <li>Add network-level egress restrictions as defense in depth, so that even a missed case in application
        code can&apos;t reach internal services or the metadata endpoint.</li>
      </ol>

      <h2>Checklist for reviewing code that makes outbound requests</h2>
      <ul>
        <li>Every server-side fetch, image download, or webhook delivery that uses a user-supplied URL is traced
        end to end for validation.</li>
        <li>Validation happens against the resolved IP address, not just the hostname string.</li>
        <li>Redirects are either disabled or re-validated on each hop.</li>
        <li>Features that don&apos;t need to support arbitrary destinations use an allow list instead of a
        blocklist.</li>
      </ul>

      <p>
        <Link href="/blog/secure-code-review-for-api-changes" className="font-semibold">
          Read about reviewing API changes for security risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/reviewing-rate-limiting-and-abuse-prevention" className="font-semibold">
          See how to review rate limiting and abuse prevention →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
