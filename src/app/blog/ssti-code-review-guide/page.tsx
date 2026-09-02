import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ssti-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SstiCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Server-side template injection happens when user input is concatenated into a template string before
        that template is rendered, instead of being passed in as data the template engine merely fills in. The
        result is often worse than XSS on the same endpoint — because template engines are designed to execute
        logic, not just interpolate text, a successful SSTI payload frequently escalates to full remote code
        execution on the server.
      </p>

      <h2>The tell: a template string built with user input</h2>
      <p>
        The vulnerable pattern looks almost identical to a string-formatting bug: instead of{' '}
        <code>render(&quot;welcome.html&quot;, {'{'}name{'}'})</code>, the code does something like{' '}
        <code>render_string(&quot;Hello &quot; + name)</code> or{' '}
        <code>Template(f&quot;Welcome {'{'}user_input{'}'}&quot;)</code> — the user&apos;s value becomes part of
        the template source itself, not a variable the template references. Jinja2, Twig, Freemarker, Velocity,
        Handlebars, and EJS all support this pattern, and all of them will happily execute template syntax that
        arrives embedded in that string, including syntax the developer never intended to expose.
      </p>

      <h2>Where it tends to appear</h2>
      <ul>
        <li>&quot;Customizable&quot; email or notification templates where an admin or end user can edit the
        template body — a legitimate feature that becomes a vulnerability the moment the same input path is
        reachable by a lower-trust user.</li>
        <li>Dynamic page or report generation where a title, header, or filename gets woven into a template
        string for convenience instead of passed as template context.</li>
        <li>Error pages or debug views that echo the requested path or query string back through a template
        renderer for a &quot;friendly&quot; message.</li>
        <li>Chat or support-ticket features that render user messages through a templating layer meant for
        markdown or variable substitution.</li>
      </ul>

      <h2>Why this is worse than it looks at first glance</h2>
      <p>
        A basic SSTI probe (something like <code>{'{{7*7}}'}</code> rendering as <code>49</code>) looks harmless,
        which is exactly why it&apos;s dangerous — that same syntax space in most template engines can reach
        object introspection, and from there the engine&apos;s own Python/Java/JavaScript runtime, and from there
        arbitrary code execution. Confirming SSTI with a math expression and treating the finding as low severity
        because &quot;it&apos;s just a template bug&quot; is a common and costly misjudgment; in most engines the
        distance from confirmed injection to RCE is short.
      </p>

      <h2>The fix is separation, not sanitization</h2>
      <p>
        Sanitizing user input before it enters a template string is fragile, because the set of dangerous
        template syntax is large and engine-specific. The reliable fix is architectural: never build a template
        string from user input at all. Templates should be static, developer-authored files or strings; user
        input should only ever be passed in as context data that a template <em>references</em>, never as text
        that becomes part of the template&apos;s own source before compilation. Where a feature genuinely needs
        user-editable templates, isolate rendering in a sandboxed environment with a restricted subset of the
        engine&apos;s functionality, and treat that sandbox as a security boundary that needs its own review.
      </p>

      <h2>Checklist for reviewing a diff that renders templates</h2>
      <ol>
        <li>No template string is built via concatenation or f-string interpolation of user input before being
        passed to the rendering function.</li>
        <li>User-facing &quot;custom template&quot; features render through a sandboxed or restricted template
        environment, not the same full-featured engine used for trusted, developer-authored templates.</li>
        <li>Error and debug views that echo request data through a templating layer are checked with the same
        scrutiny as any other user-input sink.</li>
        <li>A confirmed template-injection finding is treated as a potential RCE path, not downgraded until the
        actual blast radius in that specific engine has been verified.</li>
      </ol>

      <p>
        <Link href="/blog/xss-code-review-guide" className="font-semibold">
          Read how to review code for XSS risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/insecure-deserialization-code-review" className="font-semibold">
          See how to detect insecure deserialization in code review →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
