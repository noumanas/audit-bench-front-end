// Shared across layout metadata, the generated OG image, robots.txt, and the
// sitemap — server-only, so no NEXT_PUBLIC_ prefix needed (never shipped to
// the browser bundle; Next reads it while rendering <head> tags).
export const SITE_URL = (process.env.SITE_URL || 'https://auditbenchai.com').replace(/\/$/, '');

export const SITE_NAME = 'Audit Bench Ai';

export const SITE_DESCRIPTION =
  'AI code review for security, logic, performance, and architecture — before it ships. Audit a single file, a pull request, or a whole repository.';
