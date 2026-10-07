import type { Metadata } from 'next';
import { PublicScanView } from '@/components/PublicScanView';
import { Footer } from '@/components/Footer';

type Props = { params: Promise<{ shareId: string }> };

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

// Link previews (LinkedIn, X, Slack) read these tags, so the shared URL shows
// the repo name and its result instead of a generic page title. Reports are
// user-generated, so they stay out of search indexes.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  let title = 'Free code health report';
  let description = 'Security, dependency and code-health scan by Audit Bench Ai.';
  try {
    const res = await fetch(`${API_URL}/public/scans/${encodeURIComponent(shareId)}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const scan = (await res.json()) as {
        sourceName: string;
        riskAggregation: { overallRiskRating: string; overallHealthScore: number } | null;
        secrets: { count: number } | null;
      };
      title = `${scan.sourceName}: code health report`;
      if (scan.riskAggregation) {
        description = `Overall risk ${scan.riskAggregation.overallRiskRating}, health score ${scan.riskAggregation.overallHealthScore}/100${
          scan.secrets ? `, ${scan.secrets.count} potential secret(s)` : ''
        }. Scan any public GitHub repo free with Audit Bench Ai.`;
      }
    }
  } catch {
    // Fall back to the generic title; the page itself handles errors.
  }
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function SharedScanPage({ params }: Props) {
  const { shareId } = await params;
  return (
    <>
      <PublicScanView shareId={shareId} />
      <Footer />
    </>
  );
}
