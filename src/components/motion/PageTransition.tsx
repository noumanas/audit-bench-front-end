'use client';

import { useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

/**
 * Fades and lifts the new page in after every client-side navigation.
 * Animates the innermost content area that exists — the app's content
 * column ([data-app-content], so the sidebar stays put) or the site's
 * <main> ([data-site-main]). Skipped on the first load, so it never delays
 * the initial paint (or the hero's own entrance animation).
 */
export function PageTransition() {
  const pathname = usePathname();
  // The path we last animated for; the first load only records it.
  const previous = useRef<string | null>(null);

  // Layout effect: hide the new page before the browser paints it, so it
  // never flashes in at full opacity first.
  useLayoutEffect(() => {
    const isFirstLoad = previous.current === null;
    const changed = previous.current !== pathname;
    previous.current = pathname;
    if (isFirstLoad || !changed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target =
      document.querySelector<HTMLElement>('[data-app-content]') ??
      document.querySelector<HTMLElement>('[data-site-main]');
    if (!target) return;
    const tween = gsap.fromTo(
      target,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity,visibility' },
    );
    return () => {
      tween.kill();
      gsap.set(target, { clearProps: 'transform,opacity,visibility' });
    };
  }, [pathname]);

  return null;
}
