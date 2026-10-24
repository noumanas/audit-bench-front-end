'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequireAdmin } from '@/components/RequireAdmin';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { PlanRequestsTable } from '@/components/admin/PlanRequestsTable';
import { WebVitalsTable } from '@/components/admin/WebVitalsTable';
import { RevenueDashboard } from '@/components/admin/RevenueDashboard';
import { GithubAppAdmin } from '@/components/admin/GithubAppAdmin';
import { EmailCampaigns } from '@/components/admin/EmailCampaigns';
import { useAuth } from '@/lib/AuthContext';

type Tab = 'revenue' | 'requests' | 'users' | 'vitals' | 'github-app' | 'emails';

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
  // GitHub sends the browser back to ?tab=github-app after creating the app.
  const fromUrl = useSearchParams().get('tab') === 'github-app' ? 'github-app' : null;
  const [picked, setTab] = useState<Tab | null>(fromUrl);
  const tab: Tab = picked ?? (isSuperAdmin ? 'revenue' : 'requests');

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-xl font-bold text-[#E8ECF4]">Admin</h1>
        <p className="mb-6 text-sm text-muted-on-ink">
          Revenue, plan requests, users and their usage, emails, and site performance.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {isSuperAdmin && (
            <TabButton active={tab === 'revenue'} onClick={() => setTab('revenue')}>
              Revenue
            </TabButton>
          )}
          <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>
            Plan requests
          </TabButton>
          <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
            Users
          </TabButton>
          <TabButton active={tab === 'vitals'} onClick={() => setTab('vitals')}>
            Web Vitals
          </TabButton>
          {isSuperAdmin && (
            <TabButton active={tab === 'github-app'} onClick={() => setTab('github-app')}>
              GitHub App
            </TabButton>
          )}
          {isSuperAdmin && (
            <TabButton active={tab === 'emails'} onClick={() => setTab('emails')}>
              Emails
            </TabButton>
          )}
        </div>

        {tab === 'revenue' && isSuperAdmin && <RevenueDashboard />}
        {tab === 'requests' && <PlanRequestsTable />}
        {tab === 'users' && <AdminUsersTable />}
        {tab === 'vitals' && <WebVitalsTable />}
        {tab === 'github-app' && isSuperAdmin && <GithubAppAdmin />}
        {tab === 'emails' && isSuperAdmin && <EmailCampaigns />}
      </div>
    </RequireAdmin>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-semibold ${
        active ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink'
      }`}
    >
      {children}
    </button>
  );
}
