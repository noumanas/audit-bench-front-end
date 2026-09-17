'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginRegistered = false;

/**
 * GSAP-driven replacement for the old IntersectionObserver + CSS-keyframe
 * Reveal component. Fades + slides content up once as it scrolls into view.
 * With `stagger`, animates the wrapper's direct children in sequence instead
 * of the wrapper as a single block — used for card grids and lists.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(stagger ? el.children : el, { opacity: 1, y: 0 });
      return;
    }

    if (!pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      pluginRegistered = true;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        stagger ? el.children : el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: delay / 1000,
          ease: 'power2.out',
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
