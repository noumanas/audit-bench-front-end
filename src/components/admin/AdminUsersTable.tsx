'use client';

import { useEffect, useState } from 'react';
import { listAdminUsers, listPlans, updateUserRole, updateUserStatus, updateUserProfile } from '@/lib/api';
import { AdminUser, Plan, Role } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';

const ROLE_LABEL: Record<Role, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

function formatLastLogin(iso: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return `Today, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

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

      <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
        <span className="rounded-full bg-ink-line px-2 py-0.5 tabular-nums">{users.length}</span>
        {users.length === 1 ? 'user' : 'users'}
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-line">
        <table className="w-full border-collapse text-left text-[13px] table-fixed">
          <colgroup>
            <col className="w-auto" />
            <col className="w-[132px]" />
            <col className="w-[92px]" />
            <col className="w-[126px]" />
            <col className="w-[168px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink-line bg-ink-line/40 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
              <th className="px-4 py-2.5 font-semibold">User</th>
              <th className="px-2 py-2.5 font-semibold">Plan / role</th>
              <th className="px-2 py-2.5 text-center font-semibold" title="Audits run · repository scans run">
                Activity
              </th>
              <th className="px-2 py-2.5 font-semibold">Last login</th>
              <th className="px-3 py-2.5 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === me?.id;
              const isEditing = editingId === u.id;
              const busy = updatingId === u.id;

              return (
                <tr key={u.id} className="border-b border-ink-line bg-ink-soft last:border-b-0 hover:bg-ink-line/30">
                  <td className="px-4 py-2.5 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.isActive ? 'bg-pass' : 'bg-critical'}`}
                        title={u.isActive ? 'Active' : 'Suspended'}
                      />
                      <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{u.email}</span>
                    </div>
                    {isEditing ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="mt-1.5 w-full min-w-0 rounded-md border border-ink-line bg-ink px-2 py-1 text-xs text-[#E8ECF4] outline-none"
                      />
                    ) : (
                      <div className="mt-0.5 flex items-center gap-1.5 pl-3.5">
                        {u.name && <span className="truncate text-xs text-muted-on-ink">{u.name}</span>}
                        {!u.isActive && (
                          <span className="shrink-0 rounded bg-critical/15 px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-critical uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-1 pl-3.5 text-[11px] whitespace-nowrap text-muted-on-ink">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-top">
                    <div className="flex flex-col items-start gap-1">
                      {isEditing ? (
                        <select
                          value={editPlanId}
                          onChange={(e) => setEditPlanId(e.target.value)}
                          className="w-full max-w-[110px] rounded-md border border-ink-line bg-ink px-1.5 py-1 font-mono text-[10px] text-[#E8ECF4] outline-none"
                        >
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded bg-ink-line px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted-on-ink">
                          {u.plan.name}
                        </span>
                      )}
                      {u.planExpiresAt && (
                        <span
                          className="font-mono text-[10px] whitespace-nowrap text-muted-on-ink"
                          title="Paid plans switch back to Free on this date unless renewed (approve again or set the plan again)"
                        >
                          until {new Date(u.planExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}

                      {canManageRoles && !isSelf ? (
                        <select
                          value={u.role}
                          disabled={busy}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="w-full max-w-[110px] rounded-md border border-ink-line bg-ink px-1.5 py-1 font-mono text-[10px] text-[#E8ECF4] outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className="rounded border border-ink-line px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted-on-ink">
                          {ROLE_LABEL[u.role]}
                          {isSelf && ' (you)'}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-top">
                    <div className="flex justify-center gap-3">
                      <div className="text-center">
                        <div className="font-mono text-[15px] font-bold tabular-nums text-[#E8ECF4]">
                          {u._count.audits}
                        </div>
                        <div className="font-mono text-[9px] tracking-wide text-muted-on-ink uppercase">Audits</div>
                      </div>
                      <div className="w-px shrink-0 bg-ink-line" />
                      <div className="text-center">
                        <div className="font-mono text-[15px] font-bold tabular-nums text-[#E8ECF4]">
                          {u._count.scanJobs}
                        </div>
                        <div className="font-mono text-[9px] tracking-wide text-muted-on-ink uppercase">Scans</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-top text-xs whitespace-nowrap text-muted-on-ink">
                    {formatLastLogin(u.lastLoginAt)}
                  </td>

                  <td className="px-3 py-2.5 align-top">
                    {isEditing ? (
                      <div className="flex flex-col items-start gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(u.id)}
                          disabled={busy}
                          className="w-full shrink-0 cursor-pointer rounded-md bg-cobalt px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-white disabled:cursor-wait disabled:opacity-70"
                        >
                          {busy ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="shrink-0 cursor-pointer text-[11px] font-medium whitespace-nowrap text-muted-on-ink hover:text-[#E8ECF4]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1.5">
                        <button
                          onClick={() => startEdit(u)}
                          className="w-full shrink-0 cursor-pointer rounded-md border border-ink-line px-2.5 py-1 text-left font-mono text-[10px] whitespace-nowrap text-muted-on-ink hover:border-cobalt hover:text-[#E8ECF4]"
                        >
                          Edit
                        </button>

                        {canManageRoles && !isSelf && (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            disabled={busy}
                            className={`w-full shrink-0 cursor-pointer rounded-md border px-2.5 py-1 text-left font-mono text-[10px] whitespace-nowrap disabled:cursor-wait disabled:opacity-70 ${
                              u.isActive
                                ? 'border-critical/40 text-critical hover:bg-critical/10'
                                : 'border-pass/40 text-pass hover:bg-pass/10'
                            }`}
                          >
                            {busy ? 'Working…' : u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
