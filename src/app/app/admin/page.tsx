'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequireAdmin } from '@/components/RequireAdmin';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { PlanRequestsTable } from '@/components/admin/PlanRequestsTable';
import { WebVitalsTable } from '@/components/admin/WebVitalsTable';
import { RevenueDashboard } from '@/components/admin/RevenueDashboard';
import { GithubAppAdmin } from '@/components/admin/GithubAppAdmin';
import { EmailCampaigns } from '@/components/admin/EmailCampaigns';
import { ActivityLogPanel } from '@/components/admin/ActivityLogPanel';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { getAdminActivitySummary } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

type Tab = 'revenue' | 'activity' | 'requests' | 'users' | 'emails' | 'github-app' | 'vitals';

// Icon paths share the 24px stroke style of components/icons.tsx.
const TABS: { id: Tab; label: string; superOnly?: boolean; icon: string }[] = [
  { id: 'revenue', label: 'Revenue', superOnly: true, icon: 'M4 19V9m6 10V5m6 14v-7m4 7H3' },
  { id: 'activity', label: 'Activity', icon: 'M3 12h4l3-7 4 14 3-7h4' },
  { id: 'requests', label: 'Plan requests', icon: 'M5 4h14v16l-7-3-7 3V4zm4 5h6m-6 4h4' },
  { id: 'users', label: 'Users', icon: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8' },
  { id: 'emails', label: 'Emails', superOnly: true, icon: 'M3 6h18v12H3zM3 7l9 6 9-6' },
  { id: 'github-app', label: 'GitHub App', superOnly: true, icon: 'M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0a9 9 0 0 1-9 9' },
  { id: 'vitals', label: 'Web Vitals', icon: 'M12 3a9 9 0 1 0 9 9M12 12l5-5' },
];

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageInner />
    </Suspense>
  );
}

function AdminPageInner() {
  const { user } = useAuth();
  // Revenue, the GitHub App and Emails are super-admin only (the API enforces this too).
  const isSuperAdmin = user?.role === 'super_admin';
  const visibleTabs = TABS.filter((t) => !t.superOnly || isSuperAdmin);
  // Deep links: GitHub returns to ?tab=github-app; notification emails link to ?tab=activity.
  const requested = useSearchParams().get('tab');
  const fromUrl = TABS.some((t) => t.id === requested) ? (requested as Tab) : null;
  const [picked, setTab] = useState<Tab | null>(fromUrl);
  const fallback: Tab = isSuperAdmin ? 'revenue' : 'activity';
  const tab: Tab = picked && visibleTabs.some((t) => t.id === picked) ? picked : fallback;

  const [pending, setPending] = useState<number | null>(null);
  useEffect(() => {
    getAdminActivitySummary()
      .then((s) => setPending(s.pendingRequests))
      .catch(() => {});
  }, [tab]);

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt uppercase">
                {isSuperAdmin ? 'Super admin' : 'Admin'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#E8ECF4]">Admin console</h1>
            <p className="mt-1 text-sm text-muted-on-ink">
              Sign-ups, sign-ins and plan requests as they happen — plus users, revenue and site health.
            </p>
          </div>
          <NotificationBell onNavigate={setTab} />
        </header>

        <nav
          aria-label="Admin sections"
          className="sticky top-0 z-30 -mx-4 mb-6 overflow-x-auto border-b border-ink-line bg-ink/90 px-4 backdrop-blur sm:-mx-6 sm:px-6"
        >
          <div className="flex min-w-max gap-1">
            {visibleTabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex cursor-pointer items-center gap-2 px-3 py-3 text-sm font-semibold transition-colors ${
                    active ? 'text-[#E8ECF4]' : 'text-muted-on-ink hover:text-[#E8ECF4]'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={t.icon} />
                  </svg>
                  {t.label}
                  {t.id === 'requests' && pending ? (
                    <span className="rounded-full bg-high/20 px-1.5 font-mono text-[10px] font-bold text-[#F0CE9A]">
                      {pending}
                    </span>
                  ) : null}
                  {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-cobalt" />}
                </button>
              );
            })}
          </div>
        </nav>

        {tab === 'revenue' && isSuperAdmin && <RevenueDashboard />}
        {tab === 'activity' && <ActivityLogPanel />}
        {tab === 'requests' && <PlanRequestsTable />}
        {tab === 'users' && <AdminUsersTable />}
        {tab === 'vitals' && <WebVitalsTable />}
        {tab === 'github-app' && isSuperAdmin && <GithubAppAdmin />}
        {tab === 'emails' && isSuperAdmin && <EmailCampaigns />}
      </div>
    </RequireAdmin>
  );
}
