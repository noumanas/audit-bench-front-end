'use client';

import { useEffect, useState } from 'react';
import { listAdminUsers, updateUserRole } from '@/lib/api';
import { AdminUser, Role } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

const ROLE_LABEL: Record<Role, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

export function AdminUsersTable() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    listAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleChange = async (userId: string, role: Role) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const updated = await updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const canManageRoles = me?.role === 'super_admin';

  if (loading) return <div className="text-sm text-muted-on-ink">Loading users…</div>;

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-ink-line">
        {users.map((u) => (
          <div key={u.id} className="border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{u.email}</span>
              {u.name && <span className="truncate text-xs text-muted-on-ink">({u.name})</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 rounded bg-ink-line px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-on-ink">
                {u.plan.name}
              </span>
              {canManageRoles && u.id !== me?.id ? (
                <select
                  value={u.role}
                  disabled={updatingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  className="rounded-md border border-ink-line bg-ink px-2 py-1 font-mono text-[11px] text-[#E8ECF4] outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              ) : (
                <span className="shrink-0 rounded border border-ink-line px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-on-ink">
                  {ROLE_LABEL[u.role]}
                  {u.id === me?.id && ' (you)'}
                </span>
              )}
              <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-on-ink">
                Joined {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
