'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Staggers the wrapper's direct children in on mount — used for the hero,
 * which is visible immediately on load, so a scroll-triggered reveal
 * (ScrollReveal) would never get a chance to fire naturally the way it does
 * for below-the-fold sections.
 */
export function HeroEntrance({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el.children, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.children,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.7, delay: delay / 1000, ease: 'power2.out', stagger: 0.1 },
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
