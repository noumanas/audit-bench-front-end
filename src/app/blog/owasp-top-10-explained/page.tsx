import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'owasp-top-10-explained')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function OwaspTop10Post() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        The OWASP Top 10 is the default vocabulary for web application security, and the 2025 edition is the
        first major update since 2021. It matters because the list is not just a ranking of bugs; it is a
        practical signal about where real-world applications keep failing, what security teams should prioritize,
        and what developers should treat as non-negotiable in code review.
      </p>
      <p>
        If you build, review, or secure web apps, this list is worth tracking closely. The 2025 release keeps
        the familiar core risks, but it also reflects how modern systems actually break: more configuration
        mistakes, more supply-chain exposure, more integrity problems, and more failures in edge-case handling.
      </p>

      <h2>The OWASP Top 10:2025 at a glance</h2>
      <p>
        According to the official OWASP release, the 2025 list is:
      </p>
      <ol>
        <li>A01:2025 - Broken Access Control</li>
        <li>A02:2025 - Security Misconfiguration</li>
        <li>A03:2025 - Software Supply Chain Failures</li>
        <li>A04:2025 - Cryptographic Failures</li>
        <li>A05:2025 - Injection</li>
        <li>A06:2025 - Insecure Design</li>
        <li>A07:2025 - Authentication Failures</li>
        <li>A08:2025 - Software or Data Integrity Failures</li>
        <li>A09:2025 - Security Logging and Alerting Failures</li>
        <li>A10:2025 - Mishandling of Exceptional Conditions</li>
      </ol>
      <p>
        The important thing is not memorizing the order. It is understanding what each category means in practice,
        how it shows up in code, and how to stop shipping it.
      </p>

      <p>
        The 2025 update keeps A01 Broken Access Control at the top. That should not be surprising: most serious
        application security failures are still authorization failures first and bug classes second. If a user can
        change an ID in a URL, hit an admin route directly, or access another tenant&apos;s data because the server
        trusted the client too much, that is Broken Access Control.
      </p>
      <p>
        The article below is written for engineers, not security marketing. The goal is to make the Top 10 useful
        in code review, architecture review, and post-incident analysis.
      </p>

      <h2>What changed from 2021</h2>
      <p>
        The release notes make three changes especially important for teams:
      </p>
      <ul>
        <li>
          <strong>A03:2025 - Software Supply Chain Failures</strong> expands the older vulnerable-components
          idea into a wider trust problem: dependencies, build systems, CI/CD, package registries, and artifact
          distribution all matter now.
        </li>
        <li>
          <strong>A09:2025 - Security Logging and Alerting Failures</strong> makes alerting explicit. Good logs
          without alerts are not enough if nobody sees the incident in time.
        </li>
        <li>
          <strong>A10:2025 - Mishandling of Exceptional Conditions</strong> pulls error handling into the
          security conversation. Failing open, leaking stack traces, and assuming the happy path are all security
          issues, not just reliability bugs.
        </li>
      </ul>
      <p>
        The broader shift is clear: OWASP is pushing teams to think about systems, not just single lines of code.
        That is a better fit for modern apps, where the most dangerous weaknesses often come from architecture,
        configuration, and operational trust boundaries.
      </p>

      <h2>What each category means in real code</h2>

      <h3>A01:2025 - Broken Access Control</h3>
      <p>
        This is the category that keeps showing up in production incidents because it is easy to get wrong and
        hard to spot in a happy-path demo. Fix it with server-side authorization checks, tenant isolation, and
        object-level permissions. Never trust the client to enforce access rules.
      </p>

      <h3>A02:2025 - Security Misconfiguration</h3>
      <p>
        This includes exposed debug modes, overly permissive CORS, missing security headers, default credentials,
        and cloud resources left open. In practice, it is often the fastest category to improve because many fixes
        are configuration changes rather than code changes.
      </p>

      <h3>A03:2025 - Software Supply Chain Failures</h3>
      <p>
        If a dependency, build step, or release artifact is compromised, your application can inherit the attack.
        This category is why dependency pinning, integrity checks, signed artifacts, and CI hardening matter.
      </p>

      <h3>A04:2025 - Cryptographic Failures</h3>
      <p>
        Use strong, modern cryptography correctly. This category covers weak algorithms, bad key handling,
        plaintext storage, and encryption that exists in name only because the implementation is wrong.
      </p>

      <h3>A05:2025 - Injection</h3>
      <p>
        Any time untrusted input is treated like code, commands, or query syntax, you are in injection territory.
        Parameterized queries, context-aware escaping, and strict input handling still matter because this class of
        bug is foundational.
      </p>

      <h3>A06:2025 - Insecure Design</h3>
      <p>
        Some issues cannot be fixed by patching a function. If the workflow allows unlimited retries, no abuse
        controls, or a security-sensitive action with no verification, the design itself is the problem.
      </p>

      <h3>A07:2025 - Authentication Failures</h3>
      <p>
        Weak login flows, fragile session handling, missing MFA, and poor account recovery controls all belong
        here. Strong auth is not just password policy; it is the full lifecycle of identity and session security.
      </p>

      <h3>A08:2025 - Software or Data Integrity Failures</h3>
      <p>
        This category is about trusting data, code, or artifacts without verifying integrity. Deserialization,
        update mechanisms, plugins, and pipeline outputs are all common pressure points.
      </p>

      <h3>A09:2025 - Security Logging and Alerting Failures</h3>
      <p>
        If you cannot detect, investigate, and respond, then even a well-secured system can stay compromised
        longer than it should. Good observability is part of security, not a separate concern.
      </p>

      <h3>A10:2025 - Mishandling of Exceptional Conditions</h3>
      <p>
        Error handling is a security boundary. Do not leak internals, do not fail open, and do not assume the
        system will only ever see well-formed inputs or clean downstream responses.
      </p>

      <h2>How to use the OWASP Top 10 in code review</h2>
      <p>
        The Top 10 becomes valuable when it turns into a review checklist. For every important change, ask:
      </p>
      <ul>
        <li>Is access enforced on the server, not only in the UI?</li>
        <li>Are dangerous defaults removed and environment settings locked down?</li>
        <li>Are dependencies, builds, and releases verified end to end?</li>
        <li>Are secrets, tokens, and sensitive data handled safely?</li>
        <li>Do authentication, authorization, and session rules cover edge cases?</li>
        <li>Can this failure be detected and responded to quickly?</li>
      </ul>
      <p>
        That is the difference between knowing the Top 10 and using it. A good review process should map each
        meaningful change back to one or more of these risks.
      </p>

      <h2>Why this matters for engineering teams</h2>
      <p>
        The OWASP Top 10 is useful because it stays close to the kind of vulnerabilities that show up repeatedly in
        real systems. It helps teams focus on the problems that cause the most damage, not just the ones that are
        easiest to name.
      </p>
      <p>
        If your team already runs static analysis, linting, and tests, the Top 10 gives you the security layer that
        those tools do not fully cover: authorization logic, design flaws, trust boundaries, release integrity, and
        operational visibility.
      </p>

      <h2>Quick takeaway</h2>
      <p>
        The 2025 list is a reminder that secure software is not just about patching vulnerabilities. It is about
        designing systems that enforce access correctly, defend their supply chain, handle edge cases safely, and
        surface attacks before they become incidents.
      </p>
      <p>
        <Link href="/signup" className="font-semibold">
          Try Audit Bench Ai on your own code →
        </Link>
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-paper-line)' }} />
      <p style={{ fontSize: '0.8em', color: 'var(--color-muted-on-paper)' }}>
        Sources:{" "}
        <a href="https://owasp.org/Top10/" target="_blank" rel="noopener noreferrer">
          OWASP Top 10:2025
        </a>
        ,{" "}
        <a href="https://owasp.org/Top10/2025/0x00_2025-Introduction/" target="_blank" rel="noopener noreferrer">
          OWASP Top 10:2025 Introduction
        </a>
        .
      </p>
    </BlogArticleLayout>
  );
}
