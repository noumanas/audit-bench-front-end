import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Get started free — 5 AI audits a day, no credit card required.',
  alternates: { canonical: '/signup' },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
