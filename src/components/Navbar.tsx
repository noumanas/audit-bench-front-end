'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

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

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const isAppSection = pathname.startsWith('/app');
  const links = isAppSection ? APP_LINKS : MARKETING_LINKS;

  return (
    <header className="flex items-center gap-4 border-b border-ink-line px-6 py-4">
      <Link href="/" className="font-mono text-lg font-bold tracking-tight text-[#E8ECF4]">
        audit<span className="text-cobalt">/</span>bench
      </Link>
      <nav className="flex flex-1 gap-4">
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

      {isAppSection && !loading && user && (
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-ink-line px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-cobalt uppercase">
            {user.plan.name}
          </span>
          <span className="text-sm text-muted-on-ink">{user.email}</span>
          <button
            onClick={logout}
            className="cursor-pointer text-sm font-medium text-muted-on-ink hover:text-[#E8ECF4]"
          >
            Log out
          </button>
        </div>
      )}

      {!isAppSection && !loading && user && (
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="rounded-md bg-cobalt px-3 py-1.5 text-sm font-bold text-white"
          >
            Go to app
          </Link>
          <button
            onClick={logout}
            className="cursor-pointer text-sm font-medium text-muted-on-ink hover:text-[#E8ECF4]"
          >
            Log out
          </button>
        </div>
      )}

      {!isAppSection && !loading && !user && (
        <div className="flex items-center gap-3">
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
      )}
    </header>
  );
}
