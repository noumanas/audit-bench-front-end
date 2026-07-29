'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getUsage } from '@/lib/api';
import { Usage } from '@/lib/types';
import { Logo } from './Logo';
import {
  ArrowRightIcon,
  ChevronRightIcon,
  FileIcon,
  GithubLogoIcon,
  GitBranchIcon,
  GitlabLogoIcon,
  GridIcon,
  LayersIcon,
  PlugIcon,
  SettingsIcon,
  ShieldIcon,
  UploadCloudIcon,
  UsersIcon,
} from './icons';

const NAV_GROUPS = [
  {
    label: 'Dashboard',
    links: [
      {
        href: '/app/dashboard',
        label: 'Dashboard',
        icon: GridIcon,
        // Mirrors the tabs on the dashboard page itself (see TABS in
        // app/app/dashboard/page.tsx) — same four views, just reachable
        // directly from the sidebar via ?tab=.
        children: [
          { href: '/app/dashboard?tab=overview', label: 'Overview', icon: GridIcon },
          { href: '/app/dashboard?tab=analytics', label: 'Analytics', icon: LayersIcon },
          { href: '/app/dashboard?tab=audits', label: 'Audits', icon: FileIcon },
          { href: '/app/dashboard?tab=scans', label: 'Repo scans', icon: GitBranchIcon },
        ],
      },
    ],
  },
  {
    label: 'Review',
    links: [
      { href: '/app', label: 'Audit', icon: ShieldIcon },
      {
        href: '/app/repository',
        label: 'Repository scan',
        icon: GitBranchIcon,
        // Mirrors the source tabs on the repository page itself (see TABS in
        // app/app/repository/page.tsx) — same four sources, just reachable
        // directly from the sidebar via ?source=.
        children: [
          { href: '/app/repository?source=upload', label: 'Upload .zip', icon: UploadCloudIcon },
          { href: '/app/repository?source=github', label: 'From GitHub', icon: GithubLogoIcon },
          { href: '/app/repository?source=gitlab', label: 'From GitLab', icon: GitlabLogoIcon },
          { href: '/app/repository?source=integrations', label: 'Integrations', icon: PlugIcon },
        ],
      },
    ],
  },
  {
    label: 'Team',
    links: [{ href: '/app/team', label: 'Team', icon: UsersIcon }],
  },
];

const ADMIN_GROUP = {
  label: 'Admin',
  links: [{ href: '/app/admin', label: 'Admin', icon: SettingsIcon }],
};

function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/app" onClick={onClick} className="transition-opacity hover:opacity-80">
      <Logo size="md" />
    </Link>
  );
}

type NavLink = {
  href: string;
  label: string;
  icon: (props: { className?: string }) => React.ReactElement;
  children?: { href: string; label: string; icon: (props: { className?: string }) => React.ReactElement }[];
};

function NavItem({
  link,
  pathname,
  onNavigate,
}: {
  link: NavLink;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(pathname, link.href);
  const [expanded, setExpanded] = useState(active);
  const Icon = link.icon;

  if (!link.children?.length) {
    return (
      <Link
        href={link.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {link.label}
      </Link>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center rounded-md text-sm font-medium transition-colors ${
          active ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]'
        }`}
      >
        <Link href={link.href} onClick={onNavigate} className="flex flex-1 items-center gap-3 px-3 py-2">
          <Icon className="h-4 w-4 shrink-0" />
          {link.label}
        </Link>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? `Collapse ${link.label}` : `Expand ${link.label}`}
          aria-expanded={expanded}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
        >
          <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>
      {expanded && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-ink-line pl-3">
          {link.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-on-ink transition-colors hover:bg-ink-line hover:text-[#E8ECF4]"
              >
                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
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
  const groups = isAdmin ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;
  return (
    <nav className="flex flex-col gap-5 px-3">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="mb-1.5 px-3 font-mono text-[10px] font-bold tracking-wide text-muted-on-ink/70 uppercase">
            {group.label}
          </div>
          <div className="flex flex-col gap-1">
            {group.links.map((link) => (
              <NavItem key={link.href} link={link} pathname={pathname} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function CreditsMeter() {
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    getUsage()
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage) return null;

  if (usage.monthlyLimit == null) {
    return (
      <div className="px-4 pt-3 pb-3 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
        Unlimited audits this month
      </div>
    );
  }

  const remaining = Math.max(0, usage.monthlyLimit - usage.monthlyUsed);
  const pct = Math.max(4, Math.min(100, Math.round((remaining / usage.monthlyLimit) * 100)));
  const low = remaining <= usage.monthlyLimit * 0.15;

  return (
    <div className="px-4 pt-3 pb-3">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-line">
        <div className={`h-full rounded-full ${low ? 'bg-critical' : 'bg-cobalt'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
        {remaining} audit{remaining === 1 ? '' : 's'} remaining
      </div>
    </div>
  );
}

function PlanRow({ planName }: { planName: string }) {
  return (
    <Link
      href="/app/dashboard"
      className="flex items-center justify-between border-t border-ink-line px-4 py-3 text-sm font-semibold text-[#E8ECF4] hover:bg-ink-line"
    >
      {planName}
      <ArrowRightIcon className="h-4 w-4 text-muted-on-ink" />
    </Link>
  );
}

function UserFooter({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="border-t border-ink-line p-4">
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
            <div className="mt-auto">
              {user && <PlanRow planName={user.plan.name} />}
              <CreditsMeter />
              <UserFooter onLogout={handleLogout} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop persistent sidebar — sticky + viewport-height so it stays put
          while <main> scrolls independently, instead of growing with the page. */}
      <aside className="hidden shrink-0 flex-col border-r border-ink-line bg-ink-soft md:sticky md:top-0 md:flex md:h-screen md:w-64 md:overflow-y-auto">
        <div className="px-4 py-5">
          <Wordmark />
        </div>
        <NavLinks isAdmin={isAdmin} pathname={pathname} />
        <div className="mt-auto">
          {user && <PlanRow planName={user.plan.name} />}
          <CreditsMeter />
          <UserFooter onLogout={handleLogout} />
        </div>
      </aside>
    </>
  );
}
