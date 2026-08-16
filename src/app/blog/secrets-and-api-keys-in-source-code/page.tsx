import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'secrets-and-api-keys-in-source-code')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SecretsAndApiKeysInSourceCodePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        A secret committed to source control is, for practical purposes, permanent. Deleting the line in a later
        commit does not remove it from git history, and anyone with clone access — including a former employee, a
        compromised CI runner, or an attacker who finds a public mirror of a repo that was meant to stay private —
        can still read it. This is different from secrets in CI/CD pipelines, which is really about how a pipeline
        injects credentials at build time. This is about the application source code itself: the config files, the
        constants, the logging statements, and the &quot;temporary&quot; hardcoded values that quietly become
        permanent.
      </p>

      <h2>Where secrets hide in a normal diff</h2>
      <ul>
        <li>A config or settings file committed with real values instead of placeholders, often because it was
        copied from a working local environment to get something running quickly.</li>
        <li>A default value baked into code &quot;for local development,&quot; where the default happens to be a
        real staging or production credential rather than an obviously fake one.</li>
        <li>An <code>.env.example</code> or sample configuration file that was supposed to show the shape of the
        config but was accidentally saved with real values before being renamed.</li>
        <li>A hardcoded database connection string, third-party API key, or signing secret embedded directly in a
        script written for a one-off task and never cleaned up.</li>
        <li>A comment left in code referencing a credential — &quot;temporary key, remove before merge&quot; — that
        never actually gets removed.</li>
      </ul>

      <h2>What a hardcoded secret actually looks like in a diff</h2>
      <p>
        Reviewers do not need to memorize every provider&apos;s key format to catch most of these. A few patterns
        cover the majority of real leaks: long random-looking alphanumeric strings assigned to a variable named
        anything like <code>key</code>, <code>token</code>, <code>secret</code>, or <code>password</code>; base64
        blobs sitting in configuration rather than being loaded from an environment variable or secret manager; and
        connection strings with a username and password embedded directly in the URL. None of these require special
        tooling to notice — they require reading the diff with the specific question &quot;could this value grant
        access to something if someone else read it.&quot;
      </p>

      <h2>Logging is a secret leak vector too</h2>
      <p>
        Not all leaks happen through source code that ships. Verbose request or response logging that captures
        entire headers — including <code>Authorization</code> — or full request bodies can write credentials
        straight into log files that are often far less access-controlled than the source repository itself. Error
        handlers that dump the full request context on failure are a common offender, especially when they are
        added during debugging and never scoped back down before merge. A reviewer looking at new logging or error
        handling should ask specifically whether it could ever capture a token, password, or API key, not just
        whether it is useful for debugging.
      </p>

      <h2>What to do the moment a secret is found in a PR</h2>
      <p>
        Deleting the line and merging is not a fix — the value is already in git history and possibly already in
        CI logs, cached diffs, or a reviewer&apos;s local clone. The correct response is to treat the credential as
        compromised: rotate or revoke it with the provider immediately, and only then clean up the code. Rewriting
        git history to remove the value is a reasonable secondary step, but it does not undo exposure that has
        already happened, so it should never replace rotation.
      </p>

      <h2>Reviewer checklist for secret handling</h2>
      <ol>
        <li>No configuration file committed to the repository contains a real credential, connection string, or
        key — only placeholders or references to a secret manager.</li>
        <li>Default values used for local development are obviously fake, not working staging or production
        credentials.</li>
        <li>New logging or error-handling code does not capture authorization headers, tokens, or full request
        bodies that might contain credentials.</li>
        <li>Any secret found in a diff is rotated with the provider, not just deleted from the code.</li>
        <li>Secrets are loaded from environment variables or a secret manager at runtime, not compiled into the
        source.</li>
      </ol>

      <h2>The right pattern: secrets live in a secret manager, not the repo</h2>
      <p>
        The durable fix is architectural, not just vigilance in review: application code should read secrets from
        environment variables populated by a secret manager or platform-level secret store at deploy time, never
        from values embedded in the repository. When that pattern is already in place, code review&apos;s job
        becomes much simpler — the reviewer only needs to confirm new code follows the existing pattern, rather
        than deciding from scratch whether a given hardcoded value is dangerous.
      </p>

      <p>
        <Link href="/blog/secrets-in-ci-cd" className="font-semibold">
          Read about secrets in CI/CD pipelines →
        </Link>
      </p>

      <p>
        <Link href="/blog/secure-coding-checklist" className="font-semibold">
          See the full secure coding checklist →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
