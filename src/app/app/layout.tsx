import type { Metadata } from 'next';

// Applies to every route under /app — the authenticated product, not the
// marketing site. No SEO value, and indexing it would surface UI structure
// that's meaningless (or misleading) without an authenticated session.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
