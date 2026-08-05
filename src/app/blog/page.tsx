import type { Metadata } from 'next';
import { BlogIndexClient } from './blog-index-client';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guides and explainers on AI code review, application security, and secure coding practices — from the team building Audit Bench Ai.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  return <BlogIndexClient />;
}
