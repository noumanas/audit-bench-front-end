'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { User } from '@/lib/types';

const MARKETING_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
];

const APP_LINKS = [
  { href: '/app', label: 'Audit' },
  { href: '/app/repository', label: 'Repository scan' },
  { href: '/app/dashboard', label: 'Dashboard' },
];

function UserActions({
  isAppSection,
  user,
  onLogout,
  stacked,
}: {
  isAppSection: boolean;
  user: User;
  onLogout: () => void;
  stacked?: boolean;
}) {
  const wrap = stacked ? 'flex flex-col items-start gap-3' : 'flex items-center gap-3';

  if (isAppSection) {
    return (
      <div className={wrap}>
        <span className="rounded-full border border-ink-line px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase">
          {user.plan.name}
        </span>
        <span className="text-sm text-muted-on-ink">{user.email}</span>
        <button
          onClick={onLogout}
          className="cursor-pointer text-sm font-medium text-muted-on-ink hover:text-[#E8ECF4]"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <Link
        href="/app"
        className="rounded-md bg-cobalt px-3 py-1.5 text-sm font-bold text-white"
      >
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

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // The login/signup forms are the whole page — no nav chrome needed there.
  if (pathname === '/login' || pathname === '/signup') return null;

  const isAppSection = pathname.startsWith('/app');
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const links = isAppSection
    ? isAdmin
      ? [...APP_LINKS, { href: '/app/admin', label: 'Admin' }]
      : APP_LINKS
    : MARKETING_LINKS;

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
          {links.map((link) => {
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
          {!loading && user && (
            <UserActions isAppSection={isAppSection} user={user} onLogout={handleLogout} />
          )}
          {!loading && !user && !isAppSection && <GuestActions />}
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
            {links.map((link) => {
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

          {(user || (!loading && !isAppSection)) && (
            <div className="border-t border-ink-line pt-4">
              {!loading && user && (
                <UserActions isAppSection={isAppSection} user={user} onLogout={handleLogout} stacked />
              )}
              {!loading && !user && !isAppSection && <GuestActions stacked />}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
