import { useSyncExternalStore } from 'react';
import { SITE_URL } from './seo';

const subscribe = () => () => {};

/**
 * The origin the app is actually running on, so share links point at the
 * same deployment whose database holds the report: localhost in
 * development, auditbenchai.com in production. SITE_URL is only the
 * server-render fallback.
 */
export function useSiteOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => SITE_URL,
  );
}
