'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let pluginRegistered = false;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Splits text into words and animates them in with a smooth, tight stagger
 * as the element scrolls into view — a lighter-weight, dependency-free
 * stand-in for GSAP's SplitText (no license/plugin needed for a word-level
 * split). Renders the plain text immediately on the server; the split only
 * happens client-side in an effect, so there's no hydration mismatch and
 * search engines / no-JS clients still see the real text node.
 */
export function TextReveal({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = el.textContent?.split(/(\s+)/) ?? [];
    el.innerHTML = words
      .map((w) =>
        w.trim() === '' ? w : `<span class="text-reveal-word" style="display:inline-block;">${escapeHtml(w)}</span>`,
      )
      .join('');
    const wordEls = el.querySelectorAll<HTMLElement>('.text-reveal-word');
    if (wordEls.length === 0) return;

    if (!pluginRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      pluginRegistered = true;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordEls,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [children]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
