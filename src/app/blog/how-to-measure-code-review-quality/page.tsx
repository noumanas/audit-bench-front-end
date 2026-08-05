import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-measure-code-review-quality')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToMeasureCodeReviewQualityPage() {
  return (
    <BlogArticleLayout title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime}>
      <p>
        Code review quality is easy to talk about and hard to measure. If you only track speed, you miss whether the
        review was useful. If you only track defects, you miss whether the process is sustainable. The right
        metrics sit in the middle.
      </p>

      <h2>Useful metrics</h2>
      <ul>
        <li>Signal: how many comments led to real improvements?</li>
        <li>Latency: how long does review add before merge?</li>
        <li>Coverage: how much of the risky code actually got reviewed?</li>
        <li>Actionability: were comments specific enough to act on quickly?</li>
        <li>Noise: how much feedback was discarded as irrelevant?</li>
      </ul>

      <h2>What not to optimize blindly</h2>
      <p>
        A low review time can hide superficial review. A high comment count can hide noise. A useful metric is one
        that helps the team improve judgment, not one that simply makes activity look impressive.
      </p>

      <h2>How to use the metrics</h2>
      <p>
        Start by measuring a small number of reviews consistently, then look for patterns: where do reviewers miss
        risk, where do authors get stuck, and where does automation help or hurt? That gives you a more honest view
        of the process than raw throughput alone.
      </p>

      <p>
        <Link href="/blog/why-code-reviews-fail" className="font-semibold">
          Read why reviews fail →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
