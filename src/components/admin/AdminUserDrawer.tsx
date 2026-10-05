'use client';

import { useEffect, useState } from 'react';
import { getAdminUserUsage, renewUserPlan, updateUserProfile, updateUserRole, updateUserStatus } from '@/lib/api';
import { AdminUser, AdminUserUsageDetail, Plan, Role } from '@/lib/types';
import { formatDateTime, timeAgo } from '@/lib/time';
import { VerdictBadge } from '@/components/VerdictBadge';
import { UsageMeter, compactNumber } from './usageDisplay';

const ROLE_LABEL: Record<Role, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };

/**
 * Slide-over with everything about one user: plan and term, quota meters,
 * a 30-day activity chart, token totals, recent runs and account actions.
 * Changes are reported back through onChanged so the list row updates
 * without a full reload.
 */
export function AdminUserDrawer({
  user,
  plans,
  canManageRoles,
  isSelf,
  onClose,
  onChanged,
}: {
  user: AdminUser;
  plans: Plan[];
  canManageRoles: boolean;
  isSelf: boolean;
  onClose: () => void;
  onChanged: (patch: Partial<AdminUser> & { id: string }) => void;
}) {
  const [detail, setDetail] = useState<AdminUserUsageDetail | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [name, setName] = useState(user.name ?? '');
  const [planId, setPlanId] = useState(user.plan.id);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAdminUserUsage(user.id)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setLoadedFor(user.id);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Failed to load usage.'));
    return () => {
      cancelled = true;
    };
  }, [user.id, reloadTick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      setReloadTick((t) => t + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = () =>
    run('profile', async () => {
      const updated = await updateUserProfile(user.id, { name: name.trim(), planId });
      onChanged({ ...updated, effectivePlan: updated.plan, planExpired: false });
    });
  const renew = () =>
    run('renew', async () => {
      const r = await renewUserPlan(user.id);
      onChanged({
        id: user.id,
        planExpiresAt: r.planExpiresAt,
        plan: r.plan,
        effectivePlan: r.plan,
        planExpired: false,
      });
    });
  const changeRole = (role: Role) =>
    run('role', async () => {
      const updated = await updateUserRole(user.id, role);
      onChanged(updated);
    });
  const toggleStatus = () =>
    run('status', async () => {
      const updated = await updateUserStatus(user.id, !user.isActive);
      onChanged(updated);
    });

  const loading = loadedFor !== user.id;
  const dirty = name.trim() !== (user.name ?? '') || planId !== user.plan.id;
  const isPaid = user.plan.slug !== 'free';
  const expires = user.planExpiresAt ? new Date(user.planExpiresAt) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`User ${user.email}`}
    >
      <button className="absolute inset-0 cursor-default bg-black/50" aria-label="Close" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-ink-line bg-ink shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-ink-line bg-ink-soft px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${user.isActive ? 'bg-pass' : 'bg-critical'}`} />
              <h2 className="truncate font-mono text-sm font-bold text-[#E8ECF4]">{user.email}</h2>
            </div>
            <p className="mt-0.5 truncate pl-4 text-[12px] text-muted-on-ink">
              {user.name || 'No name'} · {ROLE_LABEL[user.role]}
              {isSelf && ' (you)'}
              {user.organization && ` · ${user.organization.name}${user.orgRole ? ` (${user.orgRole})` : ''}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md border border-ink-line px-2.5 py-1 text-xs text-muted-on-ink hover:text-[#E8ECF4]"
          >
            Close
          </button>
        </header>

        <div className="space-y-6 px-5 py-5">
          {error && (
            <div className="rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
              {error}
            </div>
          )}

          <Section title="Plan">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-base font-bold text-[#E8ECF4]">{user.effectivePlan?.name ?? user.plan.name}</span>
              {user.planExpired && (
                <span className="rounded bg-critical/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-critical uppercase">
                  {user.plan.name} expired
                </span>
              )}
              {expires && !user.planExpired && (
                <span className="text-[12px] text-muted-on-ink" title={formatDateTime(user.planExpiresAt!)}>
                  Until {expires.toLocaleDateString(undefined, { dateStyle: 'medium' })} ({timeAgo(user.planExpiresAt!)}
                  )
                </span>
              )}
              {isPaid && (
                <button
                  onClick={renew}
                  disabled={busy !== null}
                  className="ml-auto cursor-pointer rounded-md border border-cobalt px-2.5 py-1 text-[12px] font-bold text-cobalt disabled:opacity-50"
                >
                  {busy === 'renew' ? 'Renewing…' : 'Renew +30 days'}
                </button>
              )}
            </div>
            {user.organization && (
              <p className="mt-1 text-[11px] text-muted-on-ink">
                Limits come from the team plan of {user.organization.name}; usage below is the team&apos;s shared pool.
              </p>
            )}
          </Section>

          <Section title="Usage">
            {loading || !detail ? (
              <div className="h-24 animate-pulse rounded-lg bg-ink-soft" />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <UsageMeter label="AI runs today" used={detail.quota.dailyUsed} limit={detail.quota.dailyLimit} />
                  <UsageMeter
                    label="AI runs this month"
                    used={detail.quota.monthlyUsed}
                    limit={detail.quota.monthlyLimit}
                  />
                  <UsageMeter
                    label="AI repo scans"
                    used={detail.quota.repoScansUsed}
                    limit={detail.quota.repoScanLimit}
                  />
                </div>
                <ActivityChart daily={detail.daily} />
                <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat label="Audits (all time)" value={detail.totals.audits.toLocaleString()} />
                  <Stat label="Scans (all time)" value={detail.totals.scans.toLocaleString()} />
                  <Stat
                    label="Input tokens"
                    value={compactNumber(detail.totals.inputTokens)}
                    title={detail.totals.inputTokens.toLocaleString()}
                  />
                  <Stat
                    label="Output tokens"
                    value={compactNumber(detail.totals.outputTokens)}
                    title={detail.totals.outputTokens.toLocaleString()}
                  />
                </dl>
              </>
            )}
          </Section>

          <Section title="Recent activity">
            {loading || !detail ? (
              <div className="h-20 animate-pulse rounded-lg bg-ink-soft" />
            ) : detail.recent.length === 0 ? (
              <p className="text-[13px] text-muted-on-ink">No audits or scans yet.</p>
            ) : (
              <ul className="divide-y divide-ink-line overflow-hidden rounded-lg border border-ink-line">
                {detail.recent.map((r) => (
                  <li key={`${r.kind}:${r.id}`} className="flex items-center gap-3 bg-ink-soft px-3.5 py-2.5">
                    <span className="w-10 shrink-0 font-mono text-[10px] text-muted-on-ink uppercase">{r.kind}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[12px] text-[#E8ECF4]">{r.label}</div>
                      <div className="text-[11px] text-muted-on-ink">
                        {r.usedAi ? `AI · ${r.provider}${r.tokens > 0 ? ` · ${compactNumber(r.tokens)} tokens` : ''}` : 'Local checks only'}
                      </div>
                    </div>
                    {r.verdict && r.status === 'completed' ? (
                      <VerdictBadge verdict={r.verdict} />
                    ) : (
                      <span className="font-mono text-[10px] text-muted-on-ink uppercase">{r.status}</span>
                    )}
                    <span
                      className="w-20 shrink-0 text-right text-[11px] text-muted-on-ink"
                      title={formatDateTime(r.createdAt)}
                    >
                      {timeAgo(r.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Account">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <Info
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              />
              <Info
                label="Last login"
                value={user.lastLoginAt ? timeAgo(user.lastLoginAt) : 'Never'}
                title={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : undefined}
              />
              <Info label="Last active" value={user.lastActiveAt ? timeAgo(user.lastActiveAt) : 'No activity'} />
              <Info
                label="Git hosts"
                value={
                  [
                    user.githubUsername && `GitHub @${user.githubUsername}`,
                    user.gitlabUsername && `GitLab @${user.gitlabUsername}`,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Not connected'
                }
              />
            </dl>
            {detail && detail.planRequests.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
                  Plan requests
                </div>
                <ul className="space-y-1 text-[12px] text-muted-on-ink">
                  {detail.planRequests.map((r) => (
                    <li key={r.id}>
                      <span className="text-[#E8ECF4]">{r.requestedPlan.name}</span> · {r.status} ·{' '}
                      {timeAgo(r.createdAt)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          <Section title="Edit">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] text-muted-on-ink">
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 text-sm text-[#E8ECF4] outline-none focus:border-cobalt"
                />
              </label>
              <label className="text-[12px] text-muted-on-ink">
                Personal plan
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 text-sm text-[#E8ECF4] outline-none focus:border-cobalt"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-on-ink">Setting a paid plan starts a new 30-day term.</p>
            <button
              onClick={saveProfile}
              disabled={!dirty || busy !== null}
              className="mt-3 cursor-pointer rounded-md bg-cobalt px-3.5 py-1.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy === 'profile' ? 'Saving…' : 'Save changes'}
            </button>
          </Section>

          {canManageRoles && !isSelf && (
            <Section title="Access">
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-[12px] text-muted-on-ink">
                  Role
                  <select
                    value={user.role}
                    disabled={busy !== null}
                    onChange={(e) => changeRole(e.target.value as Role)}
                    className="mt-1 block rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 text-sm text-[#E8ECF4] outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </label>
                <button
                  onClick={() => {
                    if (
                      !user.isActive ||
                      window.confirm(`Suspend ${user.email}? They'll be signed out and blocked until reactivated.`)
                    ) {
                      void toggleStatus();
                    }
                  }}
                  disabled={busy !== null}
                  className={`cursor-pointer rounded-md border px-3.5 py-1.5 text-sm font-bold disabled:opacity-50 ${
                    user.isActive
                      ? 'border-critical/40 text-critical hover:bg-critical/10'
                      : 'border-pass/40 text-pass hover:bg-pass/10'
                  }`}
                >
                  {busy === 'status' ? 'Working…' : user.isActive ? 'Suspend account' : 'Reactivate account'}
                </button>
              </div>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-3 py-2" title={title}>
      <dd className="font-mono text-base font-bold text-[#E8ECF4] tabular-nums">{value}</dd>
      <dt className="text-[10px] text-muted-on-ink">{label}</dt>
    </div>
  );
}

function Info({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div title={title}>
      <dt className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">{label}</dt>
      <dd className="text-[#E8ECF4]">{value}</dd>
    </div>
  );
}

/** 30 daily bars: total runs, with the AI-using share in cobalt. */
function ActivityChart({ daily }: { daily: AdminUserUsageDetail['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.audits + d.scans));
  const runs = daily.reduce((s, d) => s + d.audits + d.scans, 0);
  const ai = daily.reduce((s, d) => s + d.aiRuns, 0);
  const tokens = daily.reduce((s, d) => s + d.tokens, 0);
  const w = 480;
  const h = 72;
  const bw = w / daily.length;
  return (
    <div className="mt-3 rounded-lg border border-ink-line bg-ink-soft p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-[11px] text-muted-on-ink">
        <span className="font-mono tracking-wide uppercase">Last 30 days</span>
        <span>
          {runs} runs · <span className="text-cobalt">{ai} used AI</span> · {compactNumber(tokens)} tokens
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[72px] w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${runs} runs in the last 30 days, ${ai} used AI`}
      >
        {daily.map((d, i) => {
          const total = d.audits + d.scans;
          const th = (total / max) * (h - 4);
          const ah = (d.aiRuns / max) * (h - 4);
          return (
            <g key={d.date}>
              <title>{`${d.date}: ${total} runs, ${d.aiRuns} with AI, ${d.tokens.toLocaleString()} tokens`}</title>
              <rect x={i * bw + 1} y={h - th} width={bw - 2} height={th} rx="1.5" fill="#2A3242" />
              <rect x={i * bw + 1} y={h - ah} width={bw - 2} height={ah} rx="1.5" fill="#2B5BE3" />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-on-ink">
        <span>{daily[0]?.date.slice(5)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}
