'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Logo } from './Logo';

// Kept to three links, per the brand landing design. Every other marketing
// page (About, Features, Pricing, CLI, …) is linked from the footer instead.
const MARKETING_LINKS = [
  { href: '/#review', label: 'The review' },
  { href: '/#workflow', label: 'How it works' },
  { href: '/docs', label: 'Docs', arrow: true },
];

/** Marketing-site nav only — the authenticated /app section has its own Sidebar (see AppLayout). */
export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // The login/signup forms are the whole page, and /app renders its own Sidebar — no top nav chrome for either.
  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname.startsWith('/app')) return null;

  return (
    <header className="mx-auto flex h-[79px] w-full max-w-[1600px] items-center justify-between gap-4 px-[18px] sm:px-7 md:h-24 md:gap-8 lg:px-12">
      <Link href="/" aria-label="Audit Bench Ai home" className="flex min-h-11 items-center">
        <Logo size="sm" />
      </Link>

      <nav className="hidden gap-9 text-[15px] text-[#cfcfcf] md:flex">
        {MARKETING_LINKS.map((link) => {
          const active = link.href === '/docs' && pathname.startsWith('/docs');
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`hover:text-white hover:underline hover:underline-offset-[5px] ${active ? 'text-white underline underline-offset-[5px]' : ''}`}
            >
              {link.label}
              {link.arrow && <span aria-hidden="true"> ↗</span>}
            </Link>
          );
        })}
      </nav>

      {/* Reserve the button's space while auth loads so the header doesn't shift. */}
      <div className="flex min-w-[150px] justify-end">
        {!loading && (
          <Link
            href={user ? '/app' : '/signup'}
            className="btn-brand min-h-[43px] gap-5 px-[18px] text-[13px] md:gap-[30px] md:text-sm"
          >
            {user ? 'Go to app' : 'Get started'} <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
    </header>
  );
}
