import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/features', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/alignment-lab', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/cli', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/vscode', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/security', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.5 },
  ];

  const blogRoutes = BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...blogRoutes].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
