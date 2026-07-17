import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/features', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/cli', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.5 },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
