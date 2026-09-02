import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'path-traversal-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function PathTraversalCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Path traversal shows up wherever a filename or path segment travels from a request into a filesystem call
        without first being confined to the directory it&apos;s supposed to stay in. The classic{' '}
        <code>../../../etc/passwd</code> payload is what security scanners look for, but real-world traversal
        bugs are usually quieter than that — a single <code>..</code> that walks a download endpoint one
        directory above a user&apos;s own upload folder is enough to leak another tenant&apos;s files.
      </p>

      <h2>Where user input meets a filesystem path</h2>
      <ul>
        <li>File download or preview endpoints that take a filename, document ID, or template name as a
        parameter and join it onto a base directory.</li>
        <li>Static file servers with a custom route for user-uploaded content, rather than a dedicated object
        store with its own access controls.</li>
        <li>Template or theme engines that let a user select a template by name, which then gets read from
        disk.</li>
        <li>Archive extraction — a zip, tar, or similar upload whose internal entry names get written to disk
        using the paths stored inside the archive itself.</li>
        <li>Log file viewers or export features in admin panels that accept a log name or date as a path
        component.</li>
      </ul>

      <h2>Why blocking &quot;..&quot; isn&apos;t enough</h2>
      <p>
        A surprising number of fixes stop at stripping the literal string <code>..</code> from the input, which
        is trivially bypassed with URL encoding (<code>%2e%2e%2f</code>), double encoding, backslashes on
        Windows-hosted services, or null-byte tricks on older runtimes. The reliable fix isn&apos;t pattern
        matching on the input string at all — it&apos;s resolving the final path (<code>path.resolve</code> or
        equivalent) and then checking that the resolved absolute path still starts with the intended base
        directory before touching the filesystem. Reject anything that resolves outside that boundary, rather
        than trying to sanitize the input into looking safe.
      </p>

      <h2>Archive extraction is a traversal vector too</h2>
      <p>
        &quot;Zip slip&quot; is path traversal wearing a different hat: a malicious archive contains an entry named
        something like <code>../../../../home/user/.ssh/authorized_keys</code>, and a naive extraction loop writes
        each entry to <code>outputDir + entry.name</code> without validating that the joined path stays inside{' '}
        <code>outputDir</code>. Any feature that unzips user-supplied archives — theme uploads, bulk import,
        report bundles — needs the same resolved-path check as a direct file-read endpoint, applied per entry
        during extraction.
      </p>

      <h2>Symlinks complicate the resolved-path check</h2>
      <p>
        Resolving a path and confirming it starts with the base directory handles <code>..</code> segments, but a
        symlink that was placed inside the base directory ahead of time can still point somewhere else entirely.
        For upload directories where users control filenames, either resolve through symlinks (most path
        resolution functions do this by default) before the boundary check, or reject symlinks in
        user-writable directories outright if the feature doesn&apos;t need them.
      </p>

      <h2>Checklist for reviewing a diff that reads or writes files by name</h2>
      <ol>
        <li>The final path is resolved to an absolute path and checked against the intended base directory —
        not just checked for the substring <code>..</code>.</li>
        <li>Archive extraction validates each entry&apos;s resolved output path individually, not just the
        archive&apos;s own filename.</li>
        <li>Where possible, the endpoint maps a user-facing identifier to a path server-side (a database lookup by
        ID) rather than trusting a path fragment from the client at all.</li>
        <li>File read/write permissions on the process are scoped as narrowly as the deployment allows, so a
        traversal bug that slips through still can&apos;t reach unrelated system files.</li>
      </ol>

      <p>
        <Link href="/blog/file-upload-security-code-review" className="font-semibold">
          Read how to review file upload features for security risk →
        </Link>
      </p>

      <p>
        <Link href="/blog/ssrf-code-review-guide" className="font-semibold">
          See how to spot SSRF in code review →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
