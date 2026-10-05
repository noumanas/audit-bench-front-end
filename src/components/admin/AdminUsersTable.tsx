'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminUsageSummary, listAdminUsers, listPlans } from '@/lib/api';
import { AdminUsageSummary, AdminUser, Plan, Role } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { formatDateTime, timeAgo } from '@/lib/time';
import { ChevronRightIcon } from '@/components/icons';
import { AdminUserDrawer } from './AdminUserDrawer';
import { UsageMeter, compactNumber, isAtLimit } from './usageDisplay';

const ROLE_LABEL: Record<Role, string> = { user: 'User', admin: 'Admin', super_admin: 'Super Admin' };
const PAGE_SIZE = 20;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type StatusFilter = 'all' | 'active' | 'suspended' | 'at_limit' | 'expiring';
type SortKey = 'last_active' | 'ai_usage' | 'newest' | 'email';

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'at_limit', label: 'At a limit' },
  { key: 'expiring', label: 'Plan ends ≤ 7 days' },
];

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'last_active', label: 'Last active' },
  { key: 'ai_usage', label: 'Most AI usage' },
  { key: 'newest', label: 'Newest' },
  { key: 'email', label: 'Email A–Z' },
];

function time(iso: string | null | undefined): number {
  return iso ? new Date(iso).getTime() : 0;
}

export function AdminUsersTable() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [summary, setSummary] = useState<AdminUsageSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('last_active');
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  // Snapshot of "now" so filters that depend on time stay pure during render.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([listAdminUsers(), listPlans(), getAdminUsageSummary()])
      .then(([u, p, s]) => {
        setUsers(u);
        setPlans(p);
        setSummary(s);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'))
      .finally(() => setLoaded(true));
  }, []);

  // Mutation responses carry account fields only; keep the usage already loaded.
  const applyPatch = useCallback((patch: Partial<AdminUser> & { id: string }) => {
    setUsers((prev) => prev.map((u) => (u.id === patch.id ? { ...u, ...patch } : u)));
  }, []);

  const atLimitCount = useMemo(() => users.filter((u) => isAtLimit(u.quota)).length, [users]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (q && !`${u.email} ${u.name ?? ''} ${u.organization?.name ?? ''}`.toLowerCase().includes(q)) return false;
      if (planFilter !== 'all' && (u.effectivePlan ?? u.plan).slug !== planFilter) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (status === 'active' && !u.isActive) return false;
      if (status === 'suspended' && u.isActive) return false;
      if (status === 'at_limit' && !isAtLimit(u.quota)) return false;
      if (status === 'expiring') {
        const t = time(u.planExpiresAt);
        if (!t || u.planExpired || t - now > WEEK_MS) return false;
      }
      return true;
    });
    const by: Record<SortKey, (a: AdminUser, b: AdminUser) => number> = {
      last_active: (a, b) => time(b.lastActiveAt ?? b.lastLoginAt) - time(a.lastActiveAt ?? a.lastLoginAt),
      ai_usage: (a, b) => (b.month?.aiRuns ?? 0) - (a.month?.aiRuns ?? 0),
      newest: (a, b) => time(b.createdAt) - time(a.createdAt),
      email: (a, b) => a.email.localeCompare(b.email),
    };
    return filtered.sort(by[sort]);
  }, [users, query, planFilter, roleFilter, status, sort, now]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const pageRows = visible.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const filtering = query !== '' || planFilter !== 'all' || roleFilter !== 'all' || status !== 'all';
  const openUser = users.find((u) => u.id === openId) ?? null;
  const canManageRoles = me?.role === 'super_admin';

  const resetPage =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(0);
    };

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          label="Users"
          value={summary?.totalUsers}
          detail={summary && `+${summary.newThisMonth} this month · ${summary.suspended} suspended`}
        />
        <Kpi
          label="Active · 7 days"
          value={summary?.activeUsers7d}
          detail={summary && `${summary.activeUsers30d} in the last 30 days`}
        />
        <Kpi label="AI runs this month" value={summary?.aiRunsMonth} detail="Audits + scans that called a model" />
        <Kpi
          label="Tokens this month"
          value={summary ? compactNumber(summary.inputTokensMonth + summary.outputTokensMonth) : undefined}
          detail={
            summary && `${compactNumber(summary.inputTokensMonth)} in · ${compactNumber(summary.outputTokensMonth)} out`
          }
        />
        <Kpi
          label="At a limit"
          value={loaded ? atLimitCount : undefined}
          detail="Blocked from new AI runs"
          tone={atLimitCount > 0 ? 'critical' : undefined}
          onClick={atLimitCount > 0 ? () => resetPage(setStatus)('at_limit') : undefined}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => resetPage(setQuery)(e.target.value)}
          placeholder="Search email, name or team…"
          aria-label="Search users"
          className="min-w-[220px] flex-1 rounded-md border border-ink-line bg-ink-soft px-3 py-2 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
        />
        <Select label="Plan" value={planFilter} onChange={resetPage(setPlanFilter)}>
          <option value="all">All plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select label="Role" value={roleFilter} onChange={(v) => resetPage(setRoleFilter)(v as 'all' | Role)}>
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        <Select label="Sort" value={sort} onChange={(v) => setSort(v as SortKey)}>
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              Sort: {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => resetPage(setStatus)(f.key)}
            aria-pressed={status === f.key}
            className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-medium ${
              status === f.key
                ? 'border-cobalt bg-cobalt text-white'
                : 'border-ink-line text-muted-on-ink hover:text-[#E8ECF4]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-line">
        <table className="w-full table-fixed border-collapse text-left text-[13px]">
          <colgroup>
            <col />
            <col className="w-[120px]" />
            <col className="hidden w-[210px] md:table-column" />
            <col className="w-[96px]" />
            <col className="w-[28px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink-line bg-ink-line/40 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
              <th className="px-4 py-2.5 font-semibold">User</th>
              <th className="px-2 py-2.5 font-semibold">Plan</th>
              <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Usage this month</th>
              <th className="px-2 py-2.5 font-semibold">Last active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!loaded &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-b border-ink-line bg-ink-soft">
                  <td colSpan={5} className="px-4 py-3.5">
                    <div className="mb-2 h-3 w-1/3 animate-pulse rounded bg-ink-line" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-ink-line" />
                  </td>
                </tr>
              ))}

            {loaded && pageRows.length === 0 && (
              <tr className="bg-ink-soft">
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-on-ink">
                  {users.length === 0 ? 'No users yet.' : 'No users match these filters.'}
                  {filtering && (
                    <button
                      onClick={() => {
                        setQuery('');
                        setPlanFilter('all');
                        setRoleFilter('all');
                        setStatus('all');
                        setPage(0);
                      }}
                      className="ml-2 cursor-pointer font-bold text-cobalt hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            )}

            {pageRows.map((u) => {
              const plan = u.effectivePlan ?? u.plan;
              const limited = isAtLimit(u.quota);
              const lastActive = u.lastActiveAt ?? null;
              return (
                <tr
                  key={u.id}
                  onClick={() => setOpenId(u.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpenId(u.id))}
                  tabIndex={0}
                  aria-label={`Open ${u.email}`}
                  className="group cursor-pointer border-b border-ink-line bg-ink-soft last:border-b-0 hover:bg-ink-line/40 focus:bg-ink-line/40 focus:outline-none"
                >
                  <td className="px-4 py-2.5 align-top">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${u.isActive ? 'bg-pass' : 'bg-critical'}`}
                        title={u.isActive ? 'Active' : 'Suspended'}
                      />
                      <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{u.email}</span>
                      {u.id === me?.id && <span className="shrink-0 text-[11px] text-muted-on-ink">(you)</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 pl-3.5 text-[11px] text-muted-on-ink">
                      {u.name && <span className="truncate">{u.name}</span>}
                      {u.role !== 'user' && (
                        <span className="rounded border border-ink-line px-1.5 py-px font-mono text-[10px]">
                          {ROLE_LABEL[u.role]}
                        </span>
                      )}
                      {u.organization && (
                        <span
                          className="rounded bg-ink-line px-1.5 py-px font-mono text-[10px]"
                          title="Team member — limits are the team's shared pool"
                        >
                          {u.organization.name}
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="rounded bg-critical/15 px-1.5 py-px font-mono text-[10px] font-bold text-critical uppercase">
                          Suspended
                        </span>
                      )}
                      {limited && (
                        <span className="rounded bg-critical/15 px-1.5 py-px font-mono text-[10px] font-bold text-critical uppercase">
                          At limit
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-2 py-2.5 align-top">
                    <span className="rounded bg-ink-line px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-[#E8ECF4]">
                      {plan.name}
                    </span>
                    {u.planExpired ? (
                      <div className="mt-1 text-[10px] text-critical">{u.plan.name} expired</div>
                    ) : (
                      u.planExpiresAt && (
                        <div className="mt-1 text-[10px] text-muted-on-ink" title={formatDateTime(u.planExpiresAt)}>
                          until{' '}
                          {new Date(u.planExpiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )
                    )}
                  </td>

                  <td className="hidden px-2 py-2.5 align-top md:table-cell">
                    {u.quota ? (
                      <div className="space-y-1.5">
                        <UsageMeter compact label="AI runs" used={u.quota.monthlyUsed} limit={u.quota.monthlyLimit} />
                        <UsageMeter
                          compact
                          label="Repo scans"
                          used={u.quota.repoScansUsed}
                          limit={u.quota.repoScanLimit}
                        />
                        {u.month && u.month.inputTokens + u.month.outputTokens > 0 && (
                          <div className="text-[10px] text-muted-on-ink">
                            {compactNumber(u.month.inputTokens + u.month.outputTokens)} tokens
                            {u.quota.scope === 'organization' && ` · ${u.month.aiRuns} own of team pool`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-on-ink">—</span>
                    )}
                  </td>

                  <td className="px-2 py-2.5 align-top text-xs text-muted-on-ink">
                    <span title={lastActive ? formatDateTime(lastActive) : undefined}>
                      {lastActive ? timeAgo(lastActive) : 'No activity'}
                    </span>
                    <div
                      className="mt-0.5 text-[10px]"
                      title={u.lastLoginAt ? formatDateTime(u.lastLoginAt) : undefined}
                    >
                      Login {u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'never'}
                    </div>
                  </td>

                  <td className="py-2.5 pr-2 align-middle">
                    <ChevronRightIcon className="h-4 w-4 text-muted-on-ink opacity-40 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loaded && visible.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted-on-ink">
          <span>
            {filtering ? `${visible.length} of ${users.length} users` : `${users.length} users`}
            {pages > 1 && ` · page ${current + 1} of ${pages}`}
          </span>
          {pages > 1 && (
            <div className="flex gap-1">
              <PageButton disabled={current === 0} onClick={() => setPage(current - 1)}>
                Previous
              </PageButton>
              <PageButton disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                Next
              </PageButton>
            </div>
          )}
        </div>
      )}

      {openUser && (
        <AdminUserDrawer
          key={openUser.id}
          user={openUser}
          plans={plans}
          canManageRoles={canManageRoles}
          isSelf={openUser.id === me?.id}
          onClose={() => setOpenId(null)}
          onChanged={applyPatch}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  tone,
  onClick,
}: {
  label: string;
  value: number | string | undefined;
  detail?: string | null;
  tone?: 'critical';
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">{label}</div>
      {value === undefined ? (
        <div className="mt-1.5 h-6 w-12 animate-pulse rounded bg-ink-line" />
      ) : (
        <div
          className={`mt-0.5 text-2xl font-bold tabular-nums ${tone === 'critical' ? 'text-critical' : 'text-[#E8ECF4]'}`}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      )}
      {detail && <div className="mt-0.5 text-[11px] leading-snug text-muted-on-ink">{detail}</div>}
    </>
  );
  const cls = 'rounded-lg border border-ink-line bg-ink-soft px-3.5 py-3 text-left';
  return onClick ? (
    <button onClick={onClick} className={`${cls} cursor-pointer hover:border-cobalt`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-ink-line bg-ink-soft px-2.5 py-2 text-[13px] text-[#E8ECF4] outline-none focus:border-cobalt"
    >
      {children}
    </select>
  );
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-md border border-ink-line px-3 py-1 text-[12px] text-[#E8ECF4] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
