import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'insecure-deserialization-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function InsecureDeserializationCodeReviewPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Insecure deserialization gets less attention in day-to-day code review than injection or access control,
        partly because it is less common and partly because it looks harmless — a line of code that turns stored
        bytes back into an object. But when the format being deserialized is a native serialization format rather
        than plain data, and the bytes come from somewhere an attacker can influence, that one line can lead
        straight to remote code execution. Reviewers do not need to be exploit developers to catch this. They need
        to recognize a short list of dangerous function calls and ask where their input actually comes from.
      </p>

      <h2>Why deserialization can be dangerous</h2>
      <p>
        Plain data formats like JSON describe values — strings, numbers, arrays, objects — with no way to encode
        executable behavior. Native serialization formats are different: they can describe entire objects,
        including which class to instantiate and what should happen during that instantiation. If an attacker can
        control the serialized bytes an application deserializes, they may be able to construct an object graph
        that triggers arbitrary code execution the moment it is loaded, before the application ever gets a chance
        to validate it. This is what makes insecure deserialization categorically different from most input
        validation problems — the danger happens during parsing, not after.
      </p>

      <h2>Where it shows up in real codebases</h2>
      <ul>
        <li>Session data stored using a language&apos;s native object serialization instead of a plain format, then
        read back on every request.</li>
        <li>Caching layers that serialize objects to store them and deserialize them on read, where the cache can
        be written to or poisoned by something other than fully trusted application code.</li>
        <li>Background job or message queue payloads deserialized into objects on the worker side, especially when
        the queue is reachable by more than one trusted service.</li>
        <li>Cookies or hidden form fields that store a serialized object directly, sent back to the server on the
        next request and deserialized without question.</li>
        <li>Configuration or plugin systems that load serialized objects from a file or remote location to support
        extensibility.</li>
      </ul>

      <h2>Function calls that deserve a second look</h2>
      <p>
        A short list of calls accounts for most real insecure deserialization findings, and reviewers can treat any
        of them as worth a closer look whenever the input is not fully trusted: <code>pickle.loads</code> and
        similar in Python, <code>yaml.load</code> without an explicit safe loader, Java&apos;s
        <code>ObjectInputStream.readObject</code>, PHP&apos;s <code>unserialize()</code>, and Ruby&apos;s
        <code>Marshal.load</code>. None of these are automatically wrong to use — they are wrong to use on data that
        originated outside a fully trusted boundary.
      </p>

      <h2>Safer alternatives reviewers should expect to see</h2>
      <p>
        The most reliable fix is to avoid native object deserialization for anything that touches untrusted input
        at all, and use a plain data format like JSON instead, parsed into known fields rather than arbitrary
        objects. Where a native format is genuinely required, safer variants exist: <code>yaml.safe_load</code>{' '}
        instead of <code>yaml.load</code>, and deserialization libraries that support an explicit allow list of
        classes that are permitted to be constructed, rejecting anything else. A reviewer seeing one of the risky
        calls above should ask whether the safer equivalent was considered, and if not, why not.
      </p>

      <h2>Trust boundaries matter more than the format itself</h2>
      <p>
        The same serialization call can be entirely safe or seriously dangerous depending on where its input comes
        from. Deserializing a value your own backend wrote to its own cache, using a key it controls, is a very
        different risk than deserializing a value pulled from a queue that any authenticated client can publish to,
        or from a cookie sent by the browser. Reviewers should trace the data back to its origin before deciding how
        much scrutiny a deserialization call deserves — the function name alone does not tell the whole story.
      </p>

      <h2>Reviewer checklist</h2>
      <ol>
        <li>Identify every place in the diff that deserializes data using a native object format rather than a
        plain data format.</li>
        <li>For each one, trace the input back to its source and confirm whether any part of it could be
        influenced by a user, client, or external system.</li>
        <li>Where input is not fully trusted, confirm a safe-loading variant or class allow list is used, not the
        default unrestricted loader.</li>
        <li>Prefer plain data formats over native serialization wherever the use case allows it, especially for
        anything crossing a trust boundary.</li>
      </ol>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Read the OWASP Top 10:2025, explained →
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
