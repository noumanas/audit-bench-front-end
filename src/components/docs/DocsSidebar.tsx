'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DOC_GROUPS, docHref } from '@/lib/docs';
import { DocsSearch } from './DocsSearch';

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Documentation" className="space-y-6">
      {DOC_GROUPS.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 px-3 text-[10.5px] font-medium tracking-[0.14em] text-muted-on-ink uppercase">
            {group.title}
          </h2>
          <ul className="space-y-0.5">
            {group.pages.map((page) => {
              const href = docHref(page.slug);
              const active = pathname === href;
              return (
                <li key={page.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md border-l-2 px-3 py-1.5 text-[13.5px] transition-colors ${
                      active
                        ? 'border-cobalt bg-cobalt/10 font-semibold text-white'
                        : 'border-transparent text-[#bdbdbd] hover:bg-ink-soft hover:text-white'
                    }`}
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * Left column on desktop (sticky, scrolls on its own); a "Menu" bar that
 * opens the same list as a drawer on small screens.
 */
export function DocsSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-ink-line lg:block">
        <div data-lenis-prevent className="sticky top-0 max-h-screen overflow-y-auto px-4 py-8">
          <div className="mb-6">
            <DocsSearch />
          </div>
          <NavList />
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-line bg-ink/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="docs-drawer"
          className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-line px-3 py-1.5 text-sm font-semibold text-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          Menu
        </button>
        <div className="min-w-0 flex-1">
          <DocsSearch compact />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Documentation menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div
            id="docs-drawer"
            data-lenis-prevent
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-ink-line bg-ink px-4 py-6"
          >
            <div className="mb-5 flex items-center justify-between px-3">
              <span className="text-sm font-bold text-white">Documentation</span>
              <button
                onClick={() => setOpen(false)}
                className="cursor-pointer text-sm text-muted-on-ink hover:text-white"
              >
                Close
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
