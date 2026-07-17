'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const MARKETING_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/services', label: 'Services' },
  { href: '/cli', label: 'CLI' },
  { href: '/pricing', label: 'Pricing' },
];

function UserActions({ onLogout, stacked }: { onLogout: () => void; stacked?: boolean }) {
  const wrap = stacked ? 'flex flex-col items-start gap-3' : 'flex items-center gap-3';
  return (
    <div className={wrap}>
      <Link href="/app" className="rounded-md bg-cobalt px-3 py-1.5 text-sm font-bold text-white">
        Go to app
      </Link>
      <button
        onClick={onLogout}
        className="cursor-pointer text-sm font-medium text-muted-on-ink hover:text-[#E8ECF4]"
      >
        Log out
      </button>
    </div>
  );
}

function GuestActions({ stacked }: { stacked?: boolean }) {
  const wrap = stacked ? 'flex flex-col items-start gap-3' : 'flex items-center gap-3';
  return (
    <div className={wrap}>
      <Link href="/login" className="text-sm font-medium text-muted-on-ink hover:text-[#E8ECF4]">
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-md bg-cobalt px-3 py-1.5 text-sm font-bold text-white"
      >
        Sign up
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

  return (
    <header className="border-b border-ink-line px-4 py-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight text-[#E8ECF4]">
          audit<span className="text-cobalt">/</span>bench
        </Link>

        <nav className="hidden flex-1 gap-4 md:flex">
          {MARKETING_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${active ? 'text-cobalt' : 'text-muted-on-ink hover:text-[#E8ECF4]'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden md:ml-0 md:block">
          {!loading && user && <UserActions onLogout={handleLogout} />}
          {!loading && !user && <GuestActions />}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-ink-line text-lg text-muted-on-ink md:hidden"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="mt-4 flex flex-col gap-4 border-t border-ink-line pt-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {MARKETING_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium ${active ? 'text-cobalt' : 'text-muted-on-ink hover:text-[#E8ECF4]'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-ink-line pt-4">
            {!loading && user && <UserActions onLogout={handleLogout} stacked />}
            {!loading && !user && <GuestActions stacked />}
          </div>
        </div>
      )}
    </header>
  );
}
