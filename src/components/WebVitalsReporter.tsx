'use client';

import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { API_URL } from '@/lib/api';

const CORE_METRICS = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']);

/**
 * Ships each Core Web Vital to the backend as it's measured — fire-and-
 * forget, anonymous (see WebVital in schema.prisma), never blocks
 * rendering. Ignores Next.js's own internal timing metrics (hydration,
 * route-change-to-render) — those aren't Web Vitals and the backend's
 * RecordWebVitalDto would reject them anyway.
 *
 * sendBeacon over fetch: it's designed specifically for this — queues the
 * request and guarantees it's sent even if the page is being unloaded right
 * as the metric (e.g. a late LCP or CLS entry) fires.
 */
export function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    if (!CORE_METRICS.has(metric.name)) return;

    const payload = JSON.stringify({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: pathname,
    });

    const url = `${API_URL}/web-vitals`;
    if (navigator.sendBeacon) {
      // text/plain, not application/json: sendBeacon can only send requests
      // that qualify as CORS-safelisted "simple requests" (no preflight) —
      // application/json doesn't qualify, so a cross-origin beacon with that
      // type silently fails as a CORS error. The backend is configured to
      // parse a text/plain body here as JSON anyway (see main.ts).
      navigator.sendBeacon(url, new Blob([payload], { type: 'text/plain' }));
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(
        () => {},
      );
    }
  });

  return null;
}
