'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { BrandMark } from './BrandMark';

const MARKETING_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/scan', label: 'Free scan' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/due-diligence', label: 'Due diligence' },
  { href: '/docs/required-check', label: 'Docs' },
  { href: '/blog', label: 'Blog' },
];

function UserActions({ onLogout, stacked }: { onLogout: () => void; stacked?: boolean }) {
  const wrap = stacked ? 'flex flex-col items-start gap-3' : 'flex items-center gap-2';
  return (
    <div className={wrap}>
      <button
        onClick={onLogout}
        className="inline-flex min-h-11 cursor-pointer items-center px-3 text-sm text-ab-soft hover:text-white"
      >
        Log out
      </button>
      <Link
        href="/app"
        className="inline-flex min-h-10 items-center rounded-lg bg-chartreuse px-4 text-sm font-semibold text-ab-bg"
      >
        Go to app
      </Link>
    </div>
  );
}

function GuestActions({ stacked }: { stacked?: boolean }) {
  const wrap = stacked ? 'flex flex-col items-start gap-3' : 'flex items-center gap-2';
  return (
    <div className={wrap}>
      <Link href="/login" className="inline-flex min-h-11 items-center px-3 text-sm text-ab-soft hover:text-white">
        Sign in
      </Link>
      <Link
        href="/contact"
        className="inline-flex min-h-10 items-center rounded-lg border border-ab-line-3 px-4 text-sm font-medium text-white hover:border-lavender"
      >
        Contact sales
      </Link>
      <Link
        href="/signup"
        className="inline-flex min-h-10 items-center rounded-lg bg-chartreuse px-4 text-sm font-semibold text-ab-bg"
      >
        Start free
      </Link>
    </div>
  );
}

/** Marketing-site nav only — the authenticated /app section has its own Sidebar (see AppLayout). */
export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // The login/signup forms are the whole page, and /app renders its own Sidebar — no top nav chrome for either.
  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/app')) return null;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="border-b border-ab-line bg-ab-bg font-ab text-ab-text">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-3 sm:px-8">
        <Link href="/" aria-label="Audit Bench Ai home" className="shrink-0">
          <BrandMark />
        </Link>

        <nav aria-label="Main" className="hidden gap-0.5 xl:flex">
          {MARKETING_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center px-3 text-sm whitespace-nowrap ${
                isActive(link.href)
                  ? 'text-white shadow-[inset_0_-2px_0_var(--color-chartreuse)]'
                  : 'text-ab-soft hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden xl:block">
          {!loading && user && <UserActions onLogout={handleLogout} />}
          {!loading && !user && <GuestActions />}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="ml-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-ab-line-2 text-ab-soft xl:hidden"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-ab-line px-4 py-4 sm:px-8 xl:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {MARKETING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`flex min-h-11 items-center text-[15px] ${isActive(link.href) ? 'text-white' : 'text-ab-soft'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-ab-line pt-4">
            {!loading && user && <UserActions onLogout={handleLogout} stacked />}
            {!loading && !user && <GuestActions stacked />}
          </div>
        </div>
      )}
    </header>
  );
}
