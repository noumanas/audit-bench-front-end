'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOC_GROUPS, docHref } from '@/lib/docs';

const ENTRIES = DOC_GROUPS.flatMap((g) =>
  g.pages.map((p) => ({
    ...p,
    group: g.title,
    href: docHref(p.slug),
    haystack: [p.title, p.description, g.title, ...(p.keywords ?? [])].join(' ').toLowerCase(),
  })),
);

/** Every word of the query must appear somewhere; title matches rank first. */
function search(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return ENTRIES;
  return ENTRIES.filter((e) => words.every((w) => e.haystack.includes(w))).sort(
    (a, b) =>
      Number(words.some((w) => b.title.toLowerCase().includes(w))) -
      Number(words.some((w) => a.title.toLowerCase().includes(w))),
  );
}

/** A search button that opens a page finder; ⌘K / Ctrl+K or "/" opens it from anywhere in the docs. */
export function DocsSearch({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
    setActive(0);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active].href);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-ink-line bg-ink-soft px-3 py-1.5 text-left text-[13px] text-muted-on-ink transition-colors hover:border-[#3d3d3d] hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="flex-1 truncate">{compact ? 'Search' : 'Search docs…'}</span>
        {!compact && (
          <kbd className="rounded border border-ink-line px-1.5 font-mono text-[10px] text-muted-on-ink">⌘K</kbd>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search documentation">
          <button aria-label="Close search" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-ink-line bg-ink shadow-2xl">
            <div className="flex items-center gap-2 border-b border-ink-line px-4">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted-on-ink" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search the docs"
                aria-label="Search the docs"
                className="w-full bg-transparent py-3.5 text-sm text-white placeholder:text-muted-on-ink focus:outline-none"
              />
              <kbd className="rounded border border-ink-line px-1.5 font-mono text-[10px] text-muted-on-ink">Esc</kbd>
            </div>
            <ul data-lenis-prevent className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-on-ink">No pages match “{query}”.</li>
              )}
              {results.map((r, i) => (
                <li key={r.href} role="option" aria-selected={i === active}>
                  <button
                    onClick={() => go(r.href)}
                    onMouseEnter={() => setActive(i)}
                    className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left ${i === active ? 'bg-cobalt/15' : ''}`}
                  >
                    <span className="block text-[10px] tracking-wider text-muted-on-ink uppercase">{r.group}</span>
                    <span className="block text-sm font-semibold text-white">{r.title}</span>
                    <span className="block truncate text-[12px] text-muted-on-ink">{r.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
