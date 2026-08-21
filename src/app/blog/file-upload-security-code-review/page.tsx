import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'file-upload-security-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function FileUploadSecurityCodeReviewPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        File upload features are everywhere — avatars, attachments, document imports, bulk data loads — and they
        are consistently under-reviewed for a simple reason: the happy path is easy to verify by testing. Upload
        a normal image, confirm it displays, ship it. The failure modes only show up when someone deliberately
        uploads a file crafted to be something other than what it claims to be, which is exactly the scenario a
        quick manual test never covers.
      </p>

      <h2>Client-side validation is a UX nicety, not a control</h2>
      <p>
        An <code>accept=&quot;image/*&quot;</code> attribute or a JavaScript extension check makes the browser&apos;s file
        picker more convenient — it does nothing to stop anyone who sends the upload request directly, bypassing
        the browser UI entirely. Every validation rule that matters for security has to be enforced server-side,
        on the bytes that actually arrive, regardless of what the client claimed about them.
      </p>

      <h2>Checking the extension is not checking the file</h2>
      <p>
        A file named <code>invoice.jpg</code> can contain anything — including a working PHP or JSP script,
        renamed specifically to defeat an extension check. Validating actual file content, not the filename, is
        what matters: checking magic bytes against the claimed type, or using a real content-sniffing library
        rather than trusting the <code>Content-Type</code> header the client sent. Even content-based checks
        aren&apos;t bulletproof — polyglot files can be crafted to be simultaneously valid as two different
        formats, which is one more reason defense in depth matters here more than a single clever check.
      </p>

      <h2>Where an uploaded file gets executed unintentionally</h2>
      <ul>
        <li>Storing uploads inside a directory the web server will execute scripts from, so a file that slips
        past validation as <code>.php</code> or <code>.jsp</code> runs as code the moment it&apos;s requested.</li>
        <li>Serving uploaded SVG or HTML files inline with your application&apos;s own origin — both formats can
        carry embedded <code>&lt;script&gt;</code> content, turning a file upload feature into a stored XSS
        vector.</li>
        <li>Image-processing libraries used to resize or transform uploads, which have their own history of
        exploitable parsing bugs when fed a deliberately malformed file.</li>
      </ul>

      <h2>Practical controls worth checking for</h2>
      <ol>
        <li>Uploaded files are stored outside the web root, or in object storage with no execute permission at
        all.</li>
        <li>Uploads are served from a separate domain or subdomain, isolating any script they might contain from
        your main application&apos;s session cookies.</li>
        <li>Images are re-encoded rather than having the original bytes passed straight through, which strips
        most embedded exploits along the way.</li>
        <li>A real file size limit is enforced server-side, not just suggested in the UI.</li>
        <li>Malware scanning is applied where the risk profile justifies it — a public-facing upload feature
        handling arbitrary file types is a very different risk than an internal tool with a handful of trusted
        users.</li>
      </ol>

      <h2>Test it like an attacker would, not like a user would</h2>
      <p>
        The most useful review question for an upload feature isn&apos;t &quot;does a normal file work&quot; —
        it&apos;s &quot;what happens if I upload a script renamed to look like an image, or an SVG with a payload
        inside, or a file ten times larger than expected.&quot; If nobody on the team can answer that with
        confidence, the feature isn&apos;t actually ready, regardless of how clean the happy path looks.
      </p>

      <p>
        <Link href="/blog/secure-coding-checklist" className="font-semibold">
          Read the secure coding checklist →
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
