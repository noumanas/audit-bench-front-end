'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginRegistered = false;

/**
 * Animates a leading integer up from 0 to its target once the element
 * scrolls into view, preserving any trailing non-numeric suffix (e.g. the
 * '+' in '11+') as static text. Falls back to rendering `value` as-is for
 * non-numeric strings and under prefers-reduced-motion.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/^(\d+)(.*)$/);
    if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const [, digits, suffix] = match;
    const target = parseInt(digits, 10);

    if (!pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      pluginRegistered = true;
    }

    el.textContent = `0${suffix}`;
    const counter = { n: 0 };

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: target,
        duration: 1.1,
        ease: 'power1.out',
        snap: { n: 1 },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = `${counter.n}${suffix}`;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
