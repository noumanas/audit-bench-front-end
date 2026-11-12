'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * "On this page": the article's h2/h3 headings (those with ids), with the
 * one currently in view highlighted. Read from the DOM after each
 * navigation, so pages don't have to list their own sections.
 */
export function DocsToc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector('[data-docs-article]');
    if (!article) return;
    const elements = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    // Headings only exist in the DOM after render, so they're read in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent?.replace(/#$/, '').trim() ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      })),
    );
    setActiveId(elements[0]?.id ?? null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[12.5px]">
      <h2 className="mb-3 text-[10.5px] font-medium tracking-[0.14em] text-muted-on-ink uppercase">
        On this page
      </h2>
      <ul className="space-y-1.5 border-l border-ink-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l py-0.5 transition-colors ${h.level === 3 ? 'pl-6' : 'pl-3'} ${
                activeId === h.id
                  ? 'border-cobalt font-semibold text-white'
                  : 'border-transparent text-muted-on-ink hover:text-white'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
