import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple plans, real limits. Free, Pro, Team, and Enterprise — priced by AI-reviewed audits per day and month, not raw request counts.',
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
