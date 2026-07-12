'use client';

import { useEffect, useState } from 'react';
import {
  getMyOrganization,
  createOrganization,
  inviteToOrganization,
  revokeOrganizationInvite,
  updateOrganizationMemberRole,
  removeOrganizationMember,
  leaveOrganization,
  deleteOrganization,
} from '@/lib/api';
import { OrganizationDetail, OrgRole } from '@/lib/types';
import { RequireAuth } from '@/components/RequireAuth';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/AuthContext';
import { UsersIcon } from '@/components/icons';

const ROLE_LABEL: Record<OrgRole, string> = { owner: 'Owner', admin: 'Admin', member: 'Member' };

function CreateOrgCard({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createOrganization(name.trim());
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shadow-panel mx-auto max-w-lg rounded-lg border border-ink-line bg-ink-soft p-6">
      <div className="mb-2 flex items-center gap-2 text-cobalt">
        <UsersIcon className="h-5 w-5" />
        <h2 className="text-lg font-bold text-[#E8ECF4]">Create an organization</h2>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-muted-on-ink">
        Bring your team into one shared workspace — everyone&apos;s audits, repo scans, and analytics become
        visible to the whole org, and you all draw from one pooled plan instead of separate personal quotas.
        Anything you&apos;ve already run stays personal and isn&apos;t pulled in.
      </p>
      {error && (
        <div className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Organization name"
          maxLength={80}
          className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none focus:border-cobalt"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="shrink-0 cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </form>
    </div>
  );
}

function InviteForm({ onInvited }: { onInvited: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    setLastInviteUrl(null);
    try {
      const invite = await inviteToOrganization(email.trim(), role);
      setEmail('');
      setLastInviteUrl(invite.inviteUrl);
      onInvited();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-ink-line bg-ink-soft p-4">
      <h3 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
        Invite a teammate
      </h3>
      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teammate@company.com"
          className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none focus:border-cobalt"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as OrgRole)}
          className="rounded-md border border-ink-line bg-ink px-2.5 py-2 font-mono text-[12px] text-[#E8ECF4] outline-none"
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="shrink-0 cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send invite'}
        </button>
      </form>
      {lastInviteUrl && (
        <div className="mt-3 rounded-md border border-cobalt/40 bg-cobalt/10 px-3 py-2 text-[12px] text-[#B9CCF7]">
          Invite created.{' '}
          <button
            onClick={() => navigator.clipboard.writeText(lastInviteUrl)}
            className="cursor-pointer font-bold underline"
          >
            Copy invite link
          </button>{' '}
          — works whether or not email delivery is set up on this server.
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { user, refreshUser } = useAuth();
  const [org, setOrg] = useState<OrganizationDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    getMyOrganization()
      .then(setOrg)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load your organization.'));
  };

  useEffect(load, []);

  const handleCreated = async () => {
    await refreshUser();
    load();
  };

  const canManage = org?.myRole === 'owner' || org?.myRole === 'admin';
  const isOwner = org?.myRole === 'owner';

  const handleRevoke = async (inviteId: string) => {
    setBusyId(inviteId);
    setError(null);
    try {
      await revokeOrganizationInvite(inviteId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (memberId: string, role: OrgRole) => {
    setBusyId(memberId);
    setError(null);
    try {
      await updateOrganizationMemberRole(memberId, role);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member from the organization? They keep their own account, just lose team access.')) {
      return;
    }
    setBusyId(memberId);
    setError(null);
    try {
      await removeOrganizationMember(memberId);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member.');
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this organization? You'll go back to your own personal plan and workspace.")) return;
    try {
      await leaveOrganization();
      await refreshUser();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave organization.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this organization? This cannot be undone.')) return;
    try {
      await deleteOrganization();
      await refreshUser();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization.');
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10">
        {org === undefined && !error && <p className="text-sm text-muted-on-ink">Loading…</p>}

        {error && org === undefined && (
          <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error}
          </div>
        )}

        {org === null && (
          <>
            <PageHeader
              kicker="Team"
              title="You're flying solo"
              description="Create an organization to start sharing audits, scans, and a plan with your team."
            />
            <CreateOrgCard onCreated={handleCreated} />
          </>
        )}

        {org && (
          <>
            <PageHeader
              kicker="Team"
              title={org.name}
              description={`${org.members.length} member${org.members.length === 1 ? '' : 's'} on the ${org.plan.name} plan — shared workspace and quota for everyone here.`}
            />

            {error && (
              <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
                {error}
              </div>
            )}

            {canManage && <InviteForm onInvited={load} />}

            <div className="mb-8">
              <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
                Members
              </h2>
              <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
                {org.members.map((m) => {
                  const isSelf = m.id === user?.id;
                  const busy = busyId === m.id;
                  return (
                    <div
                      key={m.id}
                      className="flex flex-wrap items-center gap-2 border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0"
                    >
                      <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{m.email}</span>
                      {m.name && <span className="truncate text-xs text-muted-on-ink">({m.name})</span>}
                      {isOwner && !isSelf && m.orgRole !== 'owner' ? (
                        <select
                          value={m.orgRole}
                          disabled={busy}
                          onChange={(e) => handleRoleChange(m.id, e.target.value as OrgRole)}
                          className="rounded-md border border-ink-line bg-ink px-2 py-1 font-mono text-[11px] text-[#E8ECF4] outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="shrink-0 rounded border border-ink-line px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-on-ink">
                          {ROLE_LABEL[m.orgRole]}
                          {isSelf && ' (you)'}
                        </span>
                      )}

                      {canManage && !isSelf && m.orgRole !== 'owner' && (
                        <button
                          onClick={() => handleRemove(m.id)}
                          disabled={busy}
                          className="shrink-0 cursor-pointer rounded-md border border-critical/40 px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-critical hover:bg-critical/10 disabled:cursor-wait disabled:opacity-70"
                        >
                          {busy ? 'Working…' : 'Remove'}
                        </button>
                      )}

                      <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-on-ink">
                        Joined {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {canManage && org.invites.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
                  Pending invites
                </h2>
                <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line">
                  {org.invites.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-wrap items-center gap-2 border-b border-ink-line bg-ink-soft px-4 py-3 last:border-b-0"
                    >
                      <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{inv.email}</span>
                      <span className="shrink-0 rounded border border-ink-line px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-on-ink">
                        {ROLE_LABEL[inv.role]}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(inv.inviteUrl)}
                        className="shrink-0 cursor-pointer font-mono text-[11px] whitespace-nowrap text-cobalt hover:underline"
                      >
                        Copy link
                      </button>
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        disabled={busyId === inv.id}
                        className="shrink-0 cursor-pointer rounded-md border border-critical/40 px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-critical hover:bg-critical/10 disabled:cursor-wait disabled:opacity-70"
                      >
                        Revoke
                      </button>
                      <span className="ml-auto shrink-0 text-xs whitespace-nowrap text-muted-on-ink">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 border-t border-ink-line pt-6">
              {!isOwner && (
                <button
                  onClick={handleLeave}
                  className="cursor-pointer text-sm font-semibold text-critical hover:underline"
                >
                  Leave organization
                </button>
              )}
              {isOwner && org.members.length === 1 && (
                <button
                  onClick={handleDelete}
                  className="cursor-pointer text-sm font-semibold text-critical hover:underline"
                >
                  Delete organization
                </button>
              )}
              {isOwner && org.members.length > 1 && (
                <span className="text-xs text-muted-on-ink">
                  Remove the other members before you can delete this organization.
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </RequireAuth>
  );
}
