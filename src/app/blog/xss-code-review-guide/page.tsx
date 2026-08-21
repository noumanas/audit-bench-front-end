import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'xss-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function XssCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Cross-site scripting is one of the oldest vulnerability classes on the web, and modern frameworks have
        made it much rarer by escaping output automatically. React escapes strings rendered in JSX, Vue escapes
        template interpolation, and most server-side template engines escape by default. That success is exactly
        why the XSS that does show up today is concentrated in a small number of predictable places: the specific
        spots where a developer deliberately turned that automatic protection off.
      </p>

      <h2>Where auto-escaping gets turned off</h2>
      <ul>
        <li>React&apos;s <code>dangerouslySetInnerHTML</code>, used to render rich text, markdown output, or
        content from a CMS.</li>
        <li>Vue&apos;s <code>v-html</code> directive, and Angular&apos;s <code>[innerHTML]</code> binding or
        <code>bypassSecurityTrustHtml</code> calls.</li>
        <li>Server-side template filters that explicitly opt out of escaping — <code>|safe</code> in Jinja,
        <code>|raw</code> in Twig, or similar &quot;trust this string&quot; filters in other engines.</li>
        <li>Any of these used on content that ultimately traces back to another user — a comment, a display name,
        a file name, a support ticket description.</li>
      </ul>
      <p>
        None of these are wrong to use on their own. They are wrong to use on a string that could contain
        attacker-controlled markup without first passing it through a dedicated HTML sanitizer built for that
        purpose, not a hand-rolled regex.
      </p>

      <h2>The three flavors, and why the fix differs</h2>
      <p>
        Stored XSS happens when malicious input is saved — in a database, a file, a cache — and later rendered
        unescaped to other users; it is the most damaging variant because one attacker can affect every visitor.
        Reflected XSS happens when input from the current request (a query parameter, a search term) is echoed
        back into the page without escaping, requiring a victim to click a crafted link. DOM-based XSS happens
        entirely in the browser, when client-side JavaScript reads something attacker-influenced and writes it
        into the page without ever touching the server. The fix is the same in principle — escape or sanitize
        based on where the value lands — but where you have to look for the bug is different for each one.
      </p>

      <h2>DOM-based XSS hides from a server-side review</h2>
      <p>
        A code reviewer scanning backend templates and API responses can completely miss DOM-based XSS, because
        the vulnerable code never touches the server at all. Client-side JavaScript that reads{' '}
        <code>location.hash</code>, <code>location.search</code>, or <code>document.referrer</code> and writes the
        result into <code>innerHTML</code>, <code>document.write</code>, or an <code>eval</code> call is a
        complete, self-contained vulnerability that a backend-focused review will walk right past. Front-end code
        needs the same scrutiny as backend templates, not less.
      </p>

      <h2>Why input validation alone doesn&apos;t solve this</h2>
      <p>
        The correct way to neutralize a value depends entirely on where it ends up — inside an HTML element body,
        inside an HTML attribute, inside a <code>&lt;script&gt;</code> block, or inside a URL each require
        different escaping rules. Validating that an input &quot;looks like a normal name&quot; on the way in
        does nothing to protect the several different contexts it might later be rendered into. This is why
        framework-provided, context-aware escaping consistently beats a single custom sanitization function
        applied once at the input boundary.
      </p>

      <h2>Sinks worth flagging on sight</h2>
      <ul>
        <li><code>innerHTML</code>, <code>outerHTML</code>, and <code>insertAdjacentHTML</code> assigned from
        anything other than a fixed, developer-written string.</li>
        <li><code>document.write</code> or <code>eval</code> used on any value that traces back to user input.</li>
        <li><code>style.cssText</code> or attribute values built from user input, which can enable CSS-based
        exfiltration in older browsers.</li>
        <li>An <code>href</code> or <code>src</code> attribute built from user input without checking the scheme,
        allowing a <code>javascript:</code> URL to execute on click.</li>
      </ul>

      <h2>Content Security Policy is a backstop, not a substitute</h2>
      <p>
        A well-configured CSP can prevent an injected script from executing even if an XSS bug slips through
        review, and it is worth having for exactly that reason. But it should never be treated as the primary
        control — CSP has known bypass techniques, gets weakened by legitimate needs like inline scripts or
        third-party widgets, and does nothing to prevent the underlying bug from existing. Review the code as if
        no CSP exists, then treat CSP as a second layer on top.
      </p>

      <h2>Checklist for reviewing a diff that touches rendering</h2>
      <ol>
        <li>Every use of <code>dangerouslySetInnerHTML</code>, <code>v-html</code>, or an unescaped template
        filter is paired with a real HTML sanitizer, not a hand-written filter.</li>
        <li>Front-end code that reads from the URL, referrer, or <code>postMessage</code> and writes to the DOM
        gets the same scrutiny as server-rendered output.</li>
        <li>User-influenced values used in attributes, inline styles, or URLs are escaped for that specific
        context, not just HTML-body-escaped by default.</li>
        <li>Links built from user input validate the URL scheme before rendering as a clickable{' '}
        <code>href</code>.</li>
      </ol>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Read the OWASP Top 10:2025, explained →
        </Link>
      </p>

      <p>
        <Link href="/blog/sql-injection-code-review-guide" className="font-semibold">
          See how to review code for SQL injection risk →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
