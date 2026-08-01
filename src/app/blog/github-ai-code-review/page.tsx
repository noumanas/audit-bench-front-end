import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'github-ai-code-review')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function GitHubAiCodeReviewPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        GitHub Copilot Code Review is the most obvious AI review option for teams already centered on GitHub. It
        fits where your pull requests already live, which is a big deal: review tools tend to fail when they ask
        people to change habits before they see value.
      </p>

      <h2>Why it matters</h2>
      <p>
        GitHub&apos;s official positioning is simple: Copilot can take the first pass on a PR, analyze the full
        changeset, and surface feedback that helps human reviewers spend their time on what matters most. That is
        exactly the right division of labor if your bottleneck is review throughput.
      </p>

      <h2>Where it fits well</h2>
      <ul>
        <li>GitHub-first teams that want the smallest possible workflow change</li>
        <li>Repositories with a lot of routine PRs that still need a first review</li>
        <li>Teams that want inline suggestions rather than external dashboards</li>
      </ul>

      <h2>Where it needs help</h2>
      <ul>
        <li>Large architectural decisions still need human judgment</li>
        <li>Security-sensitive changes still need explicit review standards</li>
        <li>Teams should verify the tool against their own codebase, not demo repos</li>
      </ul>

      <h2>How to get better results</h2>
      <ul>
        <li>Keep PRs small enough for context to remain clear.</li>
        <li>Write contribution standards so the tool has something to compare against.</li>
        <li>Treat AI comments as triage, not final authority.</li>
        <li>Measure whether it reduces reviewer load and catches real defects.</li>
      </ul>

      <p>
        The best use of GitHub AI review is not replacing your team. It is compressing the time between “PR opened”
        and “someone competent looked at it.”
      </p>

      <p>
        <Link href="/blog/ai-code-review-guide" className="font-semibold">
          Read the general guide →
        </Link>
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-paper-line)' }} />
      <p style={{ fontSize: '0.8em', color: 'var(--color-muted-on-paper)' }}>
        Source:{" "}
        <a href="https://github.com/features/code-review" target="_blank" rel="noopener noreferrer">
          GitHub Copilot Code Review
        </a>
        .
      </p>
    </BlogArticleLayout>
  );
}
