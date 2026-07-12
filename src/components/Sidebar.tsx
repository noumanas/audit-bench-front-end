'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { GitBranchIcon, GridIcon, SettingsIcon, ShieldIcon, UsersIcon } from './icons';

const NAV_LINKS = [
  { href: '/app', label: 'Audit', icon: ShieldIcon },
  { href: '/app/repository', label: 'Repository scan', icon: GitBranchIcon },
  { href: '/app/dashboard', label: 'Dashboard', icon: GridIcon },
  { href: '/app/team', label: 'Team', icon: UsersIcon },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/app"
      onClick={onClick}
      className="font-mono text-base font-bold tracking-tight text-[#E8ECF4]"
    >
      audit<span className="text-cobalt">/</span>bench
    </Link>
  );
}

function NavLinks({
  isAdmin,
  pathname,
  onNavigate,
}: {
  isAdmin: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const links = isAdmin ? [...NAV_LINKS, { href: '/app/admin', label: 'Admin', icon: SettingsIcon }] : NAV_LINKS;
  return (
    <nav className="flex flex-col gap-1 px-3">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'bg-cobalt/15 text-cobalt' : 'text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="mt-auto border-t border-ink-line p-4">
      <span className="mb-2 inline-block rounded-full border border-ink-line px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-cobalt uppercase">
        {user.plan.name}
      </span>
      {user.organization && (
        <div className="mb-2 truncate text-xs font-semibold text-[#E8ECF4]">{user.organization.name}</div>
      )}
      <div className="mb-2 truncate text-xs text-muted-on-ink">{user.email}</div>
      <button
        onClick={onLogout}
        className="cursor-pointer text-xs font-semibold text-muted-on-ink hover:text-[#E8ECF4]"
      >
        Log out
      </button>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <>
      {/* Mobile top bar — the persistent sidebar below is desktop-only */}
      <div className="flex items-center justify-between border-b border-ink-line px-4 py-3 md:hidden">
        <Wordmark />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-ink-line text-lg text-muted-on-ink"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="fade-up relative flex h-full w-72 flex-col bg-ink-soft">
            <div className="flex items-center justify-between px-4 py-4">
              <Wordmark onClick={() => setOpen(false)} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer text-lg text-muted-on-ink hover:text-[#E8ECF4]"
              >
                ✕
              </button>
            </div>
            <NavLinks isAdmin={isAdmin} pathname={pathname} onNavigate={() => setOpen(false)} />
            <UserFooter onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop persistent sidebar */}
      <aside className="hidden shrink-0 flex-col border-r border-ink-line bg-ink-soft md:flex md:w-64">
        <div className="px-4 py-5">
          <Wordmark />
        </div>
        <NavLinks isAdmin={isAdmin} pathname={pathname} />
        <UserFooter onLogout={handleLogout} />
      </aside>
    </>
  );
}
