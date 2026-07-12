'use client';

import { useEffect, useState } from 'react';
import { listAdminUsers, listPlans, updateUserRole, updateUserStatus, updateUserProfile } from '@/lib/api';
import { AdminUser, Plan, Role } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

const ROLE_LABEL: Record<Role, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

export function AdminUsersTable() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPlanId, setEditPlanId] = useState('');

  const load = () => {
    setLoading(true);
    listAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

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

  const handleStatusToggle = async (u: AdminUser) => {
    setUpdatingId(u.id);
    setError(null);
    try {
      const updated = await updateUserStatus(u.id, !u.isActive);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setEditName(u.name ?? '');
    setEditPlanId(u.plan.id);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPlanId('');
  };

  const handleSaveEdit = async (userId: string) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const updated = await updateUserProfile(userId, { name: editName.trim(), planId: editPlanId });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
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
        {users.map((u) => {
          const isSelf = u.id === me?.id;
          const isEditing = editingId === u.id;
          const busy = updatingId === u.id;

          return (
            <div key={u.id} className="border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0">
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.isActive ? 'bg-pass' : 'bg-critical'}`}
                  title={u.isActive ? 'Active' : 'Suspended'}
                />
                <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{u.email}</span>
                {u.name && !isEditing && <span className="truncate text-xs text-muted-on-ink">({u.name})</span>}
                {!u.isActive && (
                  <span className="shrink-0 rounded bg-critical/15 px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-critical uppercase">
                    Suspended
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-2 py-1 text-xs text-[#E8ECF4] outline-none"
                  />
                  <select
                    value={editPlanId}
                    onChange={(e) => setEditPlanId(e.target.value)}
                    className="rounded-md border border-ink-line bg-ink px-2 py-1 font-mono text-[11px] text-[#E8ECF4] outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSaveEdit(u.id)}
                    disabled={busy}
                    className="shrink-0 cursor-pointer rounded-md bg-cobalt px-3 py-1 text-xs font-bold whitespace-nowrap text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="shrink-0 cursor-pointer text-xs font-medium whitespace-nowrap text-muted-on-ink hover:text-[#E8ECF4]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 rounded bg-ink-line px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-on-ink">
                    {u.plan.name}
                  </span>
                  {canManageRoles && !isSelf ? (
                    <select
                      value={u.role}
                      disabled={busy}
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
                      {isSelf && ' (you)'}
                    </span>
                  )}

                  <button
                    onClick={() => startEdit(u)}
                    className="shrink-0 cursor-pointer rounded-md border border-ink-line px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-muted-on-ink hover:border-cobalt hover:text-[#E8ECF4]"
                  >
                    Edit
                  </button>

                  {canManageRoles && !isSelf && (
                    <button
                      onClick={() => handleStatusToggle(u)}
                      disabled={busy}
                      className={`shrink-0 cursor-pointer rounded-md border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap disabled:cursor-wait disabled:opacity-70 ${
                        u.isActive
                          ? 'border-critical/40 text-critical hover:bg-critical/10'
                          : 'border-pass/40 text-pass hover:bg-pass/10'
                      }`}
                    >
                      {busy ? 'Working…' : u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}

                  <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-on-ink">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
