'use client';

import { useState } from 'react';
import { RequireAdmin } from '@/components/RequireAdmin';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { PlanRequestsTable } from '@/components/admin/PlanRequestsTable';

type Tab = 'requests' | 'users';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('requests');

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-1 text-xl font-bold text-[#E8ECF4]">Admin</h1>
        <p className="mb-6 text-sm text-muted-on-ink">Review plan requests and manage users.</p>

        <div className="mb-6 flex gap-2">
          <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>
            Plan requests
          </TabButton>
          <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
            Users
          </TabButton>
        </div>

        {tab === 'requests' ? <PlanRequestsTable /> : <AdminUsersTable />}
      </div>
    </RequireAdmin>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
