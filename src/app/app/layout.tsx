import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';

// Applies to every route under /app — the authenticated product, not the
// marketing site. No SEO value, and indexing it would surface UI structure
// that's meaningless (or misleading) without an authenticated session.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
