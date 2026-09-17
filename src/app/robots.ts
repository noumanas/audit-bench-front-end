import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Public marketing/blog routes are intentionally crawlable.
// /app — the authenticated product, already noindex'd per-page too
// (see app/app/layout.tsx), disallowed here as well so it isn't
// crawled at all, not just excluded from the index.
// /login, /oauth — auth flow pages, no content value to index.
// /invite/[token] — single-use, recipient-specific invite links;
// indexing one would just leak that an invite exists.
//
// Each entry is listed as both an exact match ($) and a directory prefix
// (trailing /), not the bare path — robots.txt disallow rules are plain
// string-prefix matches, so a bare '/app' also matches '/apple-icon' (it
// starts with the same four characters), which got /apple-icon wrongly
// blocked from indexing. See https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt#url-matching-based-on-path-values.
const DISALLOW = ['/app$', '/app/', '/login$', '/login/', '/oauth$', '/oauth/', '/invite$', '/invite/'];

// The wildcard rule below already allows these, but they're listed
// explicitly so intent survives even if the wildcard rule is ever
// tightened later — these are the crawlers that back citations/answers
// in ChatGPT, Perplexity, and Claude, not just classic search indexing.
const AI_ANSWER_ENGINE_BOTS = [
  'GPTBot', // OpenAI — training data
  'OAI-SearchBot', // OpenAI — surfaces sites in ChatGPT search results
  'ChatGPT-User', // OpenAI — live fetch during a user's ChatGPT query
  'PerplexityBot', // Perplexity — surfaces/links sites in results
  'Perplexity-User', // Perplexity — live fetch during a user's query
  'ClaudeBot', // Anthropic — training data
  'Claude-SearchBot', // Anthropic — improves Claude's search results
  'Claude-User', // Anthropic — live fetch during a user's Claude query
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: AI_ANSWER_ENGINE_BOTS,
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
