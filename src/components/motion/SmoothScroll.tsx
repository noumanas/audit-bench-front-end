'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** The product UI has its own scroll panels and drawers; smooth scrolling is for the public site. */
function isMarketingPath(pathname: string): boolean {
  return !pathname.startsWith('/app') && pathname !== '/login' && pathname !== '/signup';
}

/**
 * Inertial smooth scrolling (Lenis) driven by GSAP's ticker, so
 * ScrollTrigger reveals stay in step with the eased scroll position.
 * Off for prefers-reduced-motion, on touch devices (native momentum is
 * better there), and inside the app.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const enabled = isMarketingPath(pathname);

  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // In-page links such as /#free-scan or the due diligence quick nav glide
      // instead of jumping; the offset clears the sticky quick-nav bar.
      anchors: { offset: -72 },
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}
