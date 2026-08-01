import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Public marketing/blog routes are intentionally crawlable.
      // /app — the authenticated product, already noindex'd per-page too
      // (see app/app/layout.tsx), disallowed here as well so it isn't
      // crawled at all, not just excluded from the index.
      // /login, /oauth — auth flow pages, no content value to index.
      // /invite/[token] — single-use, recipient-specific invite links;
      // indexing one would just leak that an invite exists.
      disallow: ['/app', '/login', '/oauth', '/invite'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
