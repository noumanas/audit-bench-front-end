import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-build-a-security-first-review-culture')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToBuildASecurityFirstReviewCulturePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Security-first review culture is not a policy document. It is a set of habits that make the secure path
        the normal path. Teams usually say they care about security, but the real question is whether that care
        shows up in how they review, approve, and merge code every day.
      </p>

      <h2>Start with what people actually do</h2>
      <p>
        Review culture is shaped by repeated behavior. If reviewers are rewarded for speed alone, they will skim.
        If they are punished for asking questions, they will stop asking. If the team treats security as a
        specialist job, it will only appear when one person remembers to raise it.
      </p>

      <h2>The habits that matter</h2>
      <ul>
        <li>Keep pull requests small enough to review carefully.</li>
        <li>Ask which files affect trust boundaries, auth, or user data.</li>
        <li>Expect reviewers to explain why they approved a risky change.</li>
        <li>Make test failures and security findings visible before merge.</li>
      </ul>

      <h2>Review norms should be explicit</h2>
      <p>
        A strong review culture defines what good review looks like. It says which changes require deeper review,
        which ones can move quickly, and which ones must not ship until a security concern is resolved. Without
        that clarity, every reviewer improvises.
      </p>

      <h2>Use automation to support judgment</h2>
      <p>
        Automation should remove friction, not judgment. Linters, tests, secret scanners, and AI review can
        surface likely issues early. The reviewer then focuses on the parts that require context, judgment, or a
        decision about risk.
      </p>

      <h2>Make security part of the default conversation</h2>
      <p>
        In a security-first team, “does it work?” is not enough. The next question is “what is the security
        impact?” That habit shifts security from a side concern to a normal part of engineering quality.
      </p>

      <p>
        The best teams do not create a separate security ritual that only happens during incidents. They build a
        review culture where secure behavior is expected every time a change is proposed.
      </p>

      <p>
        <Link href="/blog/security-review-patterns-for-large-codebases" className="font-semibold">
          See how this scales in large repos →
        </Link>
      </p>

      <p>
        <Link href="/blog/secure-code-review-workflow" className="font-semibold">
          Read the secure workflow guide →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
