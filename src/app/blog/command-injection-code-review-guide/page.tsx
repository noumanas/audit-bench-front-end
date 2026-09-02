import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'command-injection-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function CommandInjectionCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Command injection is what happens when user-controlled input reaches a shell instead of staying data. It
        tends to survive in codebases longer than SQL injection because the trigger is less obvious — there&apos;s
        no query string to eyeball, just a function call that looks like ordinary process orchestration. A
        reviewer who isn&apos;t specifically looking for it can read straight past the line that matters.
      </p>

      <h2>The functions that deserve a second look</h2>
      <ul>
        <li>Node&apos;s <code>child_process.exec</code> and <code>execSync</code>, which run their argument through
        a real shell — versus <code>execFile</code>/<code>spawn</code>, which don&apos;t unless{' '}
        <code>shell: true</code> is set.</li>
        <li>Python&apos;s <code>os.system</code>, <code>subprocess.run(..., shell=True)</code>, and{' '}
        <code>os.popen</code>.</li>
        <li>PHP&apos;s <code>shell_exec</code>, <code>exec</code>, <code>system</code>, <code>passthru</code>, and
        the backtick operator.</li>
        <li>Ruby&apos;s backticks, <code>system</code>, and <code>%x{}</code>.</li>
        <li>Any call in any language that builds a shell command string with interpolation or concatenation before
        handing it to an execution function.</li>
      </ul>
      <p>
        The rule isn&apos;t &quot;never use these&quot; — it&apos;s that the moment any argument includes a value
        that traces back to a request, a filename, an environment variable set by another process, or a webhook
        payload, the call needs to not go through a shell at all.
      </p>

      <h2>Why the shell is the actual vulnerability</h2>
      <p>
        The danger isn&apos;t running an external program — it&apos;s handing a string to something that
        interprets metacharacters. A shell treats <code>;</code>, <code>|</code>, <code>&amp;&amp;</code>,{' '}
        <code>$()</code>, and backticks as control syntax, not literal characters. An attacker who can influence
        one argument in an otherwise-safe command can use those characters to chain on an entirely separate
        command. Passing arguments as an array to a non-shell execution function (<code>execFile</code>,{' '}
        <code>subprocess.run</code> without <code>shell=True</code>) sidesteps the entire class, because there is
        no shell around to interpret anything.
      </p>

      <h2>Where it hides in plain code</h2>
      <p>
        The obvious case — a search box piped straight into <code>system()</code> — rarely makes it to production
        anymore. The versions that do ship look mundane: an image-processing pipeline that shells out to{' '}
        <code>convert</code> or <code>ffmpeg</code> with a user-supplied filename, a &quot;test connection&quot;
        admin feature that pings a hostname the user typed in, a git integration that runs <code>git clone</code>{' '}
        against a repository URL from a webhook, or a report generator that shells out to <code>pandoc</code> or{' '}
        <code>wkhtmltopdf</code> with a path built from request data. None of these look like an injection point
        on a quick read — they look like normal use of a command-line tool.
      </p>

      <h2>Allowlisting beats escaping</h2>
      <p>
        Escaping shell metacharacters correctly is genuinely hard to get right across platforms, and a single
        missed character reopens the hole. Where the set of legal values is small — a file format, a compression
        level, a predefined operation — validate against an explicit allowlist and reject anything else before it
        gets near a command. Where a real filesystem path is unavoidable, resolve it and confirm it stays inside
        an expected directory rather than trusting the string as given.
      </p>

      <h2>Checklist for reviewing a diff that shells out</h2>
      <ol>
        <li>Prefer an argument-array execution API over a shell-interpreted one; if a shell is genuinely required,
        every interpolated value is escaped for that specific shell, not string-concatenated.</li>
        <li>Any value in the command that originates from a request, filename, header, or another service is
        validated against an allowlist before use, not just checked for &quot;reasonable-looking&quot; input.</li>
        <li>Third-party CLI wrappers (image conversion, PDF generation, git operations, archive tools) get the
        same scrutiny as a raw <code>exec</code> call — they&apos;re shelling out on the library&apos;s behalf.</li>
        <li>Environment variables passed to a subprocess are an explicit, minimal set rather than an inherited
        copy of the parent process&apos;s environment.</li>
      </ol>

      <p>
        <Link href="/blog/ssrf-code-review-guide" className="font-semibold">
          See how to spot SSRF in code review →
        </Link>
      </p>

      <p>
        <Link href="/blog/sql-injection-code-review-guide" className="font-semibold">
          Read how to review code for SQL injection risk →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
