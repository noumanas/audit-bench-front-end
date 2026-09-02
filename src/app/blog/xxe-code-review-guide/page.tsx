import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'xxe-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function XxeCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        XML External Entity injection is easy to miss in review because the vulnerable line is almost always the
        XML parser&apos;s default configuration, not application code someone wrote deliberately. A codebase can
        parse XML safely for years and then become exploitable the moment a new endpoint accepts XML from an
        untrusted source using the same parser everything else already uses.
      </p>

      <h2>What makes a parser exploitable</h2>
      <p>
        The XML spec allows a document to define custom entities, and by default many XML parsers will resolve an
        external entity that points at a file path or a URL — <code>&lt;!ENTITY xxe SYSTEM
        &quot;file:///etc/passwd&quot;&gt;</code> — and substitute its contents wherever that entity is
        referenced in the document. An attacker who can submit XML that gets parsed with this default left on can
        read local files, reach internal network services the application server can access (an SSRF pivot), or,
        in the worst case, trigger a denial-of-service through an entity that references itself recursively
        (a &quot;billion laughs&quot; expansion).
      </p>

      <h2>Where XML parsing shows up unexpectedly</h2>
      <ul>
        <li>SOAP APIs and any legacy web service integration still communicating in XML.</li>
        <li>SAML authentication — SAML assertions are XML documents, and identity provider integrations are a
        classic XXE target.</li>
        <li>File format parsers that don&apos;t look XML-related on the surface: DOCX, XLSX, PPTX, and SVG are
        all XML under the hood, so an &quot;upload your profile picture&quot; feature that accepts SVG is an XML
        parsing endpoint.</li>
        <li>RSS/Atom feed parsers, sitemap importers, and any &quot;paste your XML config&quot; admin feature.</li>
        <li>Older REST APIs that accept both JSON and XML request bodies based on <code>Content-Type</code>.</li>
      </ul>

      <h2>The fix is almost always a parser flag, not custom code</h2>
      <p>
        Every major XML library has a setting to disable external entity resolution and DTD processing entirely,
        and for the vast majority of applications there is no legitimate reason to have it on — most systems
        parsing untrusted XML don&apos;t need external entities at all. Java&apos;s{' '}
        <code>DocumentBuilderFactory</code> needs{' '}
        <code>setFeature(&quot;http://apache.org/xml/features/disallow-doctype-decl&quot;, true)</code>, .NET&apos;s{' '}
        <code>XmlReaderSettings</code> needs <code>DtdProcessing.Prohibit</code>, Python&apos;s{' '}
        <code>lxml</code> needs <code>resolve_entities=False</code> on the parser, and PHP&apos;s{' '}
        <code>libxml</code> needs <code>LIBXML_NOENT</code> left off with entity loading disabled via{' '}
        <code>libxml_disable_entity_loader</code>. The exact call differs by library, but the review question is
        always the same one: does this parser have external entity resolution turned off, explicitly, at the
        point it&apos;s constructed.
      </p>

      <h2>Why this keeps recurring in newer languages too</h2>
      <p>
        It&apos;s tempting to treat XXE as a legacy-Java problem, but any language whose XML library ships with
        permissive defaults for backward compatibility reintroduces the same bug. The review habit that holds up
        across ecosystems is checking every new XML parser instantiation for its entity-handling configuration,
        the same way a reviewer checks every new database query for parameterization — not assuming a modern
        stack made the problem go away.
      </p>

      <h2>Checklist for reviewing a diff that parses XML</h2>
      <ol>
        <li>Every XML parser instantiation explicitly disables DTD processing and external entity resolution,
        rather than relying on library defaults.</li>
        <li>File-upload features accepting XML-based formats (SVG, DOCX, XLSX, RSS) route through the same
        hardened parser configuration as any other XML endpoint.</li>
        <li>SAML and SOAP integrations use a library or configuration known to reject external entities by
        default, since these are the highest-value XXE targets in most stacks.</li>
        <li>A parser change or library upgrade doesn&apos;t silently reset an entity-handling flag that was set
        explicitly elsewhere in the codebase.</li>
      </ol>

      <p>
        <Link href="/blog/ssrf-code-review-guide" className="font-semibold">
          See how to spot SSRF in code review →
        </Link>
      </p>

      <p>
        <Link href="/blog/insecure-deserialization-code-review" className="font-semibold">
          Read how to detect insecure deserialization in code review →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
