'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';

/** Same-tab navigation to another page of this site — the only clicks that should start the bar. */
function isInternalNavigation(e: MouseEvent, a: HTMLAnchorElement): boolean {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== '_self') return false;
  if (a.hasAttribute('download')) return false;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // Same page (or only the #hash changes): no navigation happens.
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

/**
 * Thin top progress bar for page navigations. Starts the moment an internal
 * link is clicked (or Back/Forward is used), creeps towards 85% while the
 * next page loads, then completes and fades once the URL changes.
 */
export function RouteProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const activeRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      tweenRef.current?.kill();
      gsap.set(bar, { scaleX: 0, opacity: 1 });
      tweenRef.current = gsap.to(bar, { scaleX: 0.85, duration: reduced ? 0 : 8, ease: 'power4.out' });
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a');
      if (a instanceof HTMLAnchorElement && a.href && isInternalNavigation(e, a)) start();
    };
    const onPop = () => start();

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // The URL changed: the new page is in. Finish and fade the bar.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || !activeRef.current) return;
    activeRef.current = false;
    tweenRef.current?.kill();
    tweenRef.current = gsap
      .timeline()
      .to(bar, { scaleX: 1, duration: 0.25, ease: 'power2.out' })
      .to(bar, { opacity: 0, duration: 0.3, delay: 0.1 }) as unknown as gsap.core.Tween;
  }, [pathname, searchParams]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-cobalt opacity-0 shadow-[0_0_10px_rgba(43,91,227,0.7)] print:hidden"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
