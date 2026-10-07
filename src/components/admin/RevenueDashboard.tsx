'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelRevenueSubscription,
  deleteRevenuePayment,
  getRevenueOverview,
  listRevenuePayments,
  listRevenueSubscriptions,
  recordRevenuePayment,
  renewRevenueSubscription,
  updateRevenueSubscription,
} from '@/lib/api';
import { PaymentKind, RevenueOverview, RevenuePayment, RevenueSubscription } from '@/lib/types';
import { formatDateTime } from '@/lib/time';
import { MrrMovementsChart, MrrTrendChart, RevenueTable } from './RevenueCharts';
import { downloadCsv, formatMoney, parseMoney, toCsv } from './revenueFormat';

const RANGES = [6, 12, 24] as const;
const KIND_LABEL: Record<PaymentKind, string> = {
  subscription: 'Subscription',
  tdd_engagement: 'TDD engagement',
  other: 'Other',
};
const STATE_STYLE: Record<RevenueSubscription['state'], string> = {
  active: 'border-pass/40 text-pass',
  scheduled: 'border-cobalt/40 text-cobalt',
  expired: 'border-ink-line text-muted-on-ink',
  canceled: 'border-critical/40 text-[#F3B7BF]',
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Super-admin revenue: MRR/ARR and their movements, plan mix, renewals at
 * risk, the subscription ledger (edit price, renew, cancel) and the payments
 * ledger (record, delete, export). Data: backend RevenueService.
 */
export function RevenueDashboard() {
  const [months, setMonths] = useState<(typeof RANGES)[number]>(12);
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [subs, setSubs] = useState<RevenueSubscription[] | null>(null);
  const [payments, setPayments] = useState<RevenuePayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRevenueOverview(months), listRevenueSubscriptions('all'), listRevenuePayments()])
      .then(([o, s, p]) => {
        if (cancelled) return;
        setOverview(o);
        setSubs(s);
        setPayments(p);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Failed to load revenue.'));
    return () => {
      cancelled = true;
    };
  }, [months, reloadKey]);

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const o = overview;
  return (
    <div className="space-y-6">
      <p className="text-[12px] leading-relaxed text-muted-on-ink">
        MRR comes from paid plan terms (approvals, admin plan changes and renewals). Collected revenue comes from the
        payments you record below. Amounts are in US dollars; ARR is MRR × 12.
      </p>

      {error && (
        <div className="rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="MRR" value={o && formatMoney(o.mrrCents)} detail={o && `As of ${formatDateTime(o.asOf)}`} accent />
        <Kpi label="ARR" value={o && formatMoney(o.arrCents)} detail="MRR × 12" accent />
        <Kpi
          label="Paying accounts"
          value={o && o.payingAccounts}
          detail={o && `${formatMoney(o.arpaCents)} average per account`}
        />
        <Kpi
          label="Net new MRR"
          value={
            o && `${o.netNewMrrThisMonthCents >= 0 ? '+' : '−'}${formatMoney(Math.abs(o.netNewMrrThisMonthCents))}`
          }
          detail="This month so far"
          tone={
            o ? (o.netNewMrrThisMonthCents < 0 ? 'bad' : o.netNewMrrThisMonthCents > 0 ? 'good' : undefined) : undefined
          }
        />
        <Kpi
          label="MRR churn"
          value={o && (o.churnRateLastMonthPct === null ? '—' : `${o.churnRateLastMonthPct}%`)}
          detail="Last full month"
          tone={o?.churnRateLastMonthPct ? 'bad' : undefined}
        />
        <Kpi
          label="Collected"
          value={o && formatMoney(o.collectedThisMonthCents)}
          detail={o && `This month · ${formatMoney(o.collectedYtdCents)} this year`}
        />
      </div>

      {/* Charts */}
      <Card
        title="MRR over time"
        action={
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-ink-line p-0.5" role="group" aria-label="Range">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setMonths(r)}
                  aria-pressed={months === r}
                  className={`cursor-pointer rounded px-2.5 py-1 font-mono text-[11px] ${
                    months === r ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:text-[#E8ECF4]'
                  }`}
                >
                  {r}M
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTable((v) => !v)}
              className="cursor-pointer rounded-md border border-ink-line px-2.5 py-1 text-[11px] text-muted-on-ink hover:text-[#E8ECF4]"
            >
              {showTable ? 'View chart' : 'View as table'}
            </button>
          </div>
        }
      >
        {!o ? (
          <div className="h-[200px] animate-pulse rounded bg-ink-line/40" />
        ) : showTable ? (
          <RevenueTable series={o.series} />
        ) : (
          <>
            <MrrTrendChart series={o.series} />
            <h3 className="mt-6 mb-2 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">MRR movements</h3>
            <MrrMovementsChart series={o.series} />
          </>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Plan mix">
          {!o ? (
            <div className="h-24 animate-pulse rounded bg-ink-line/40" />
          ) : o.planMix.length === 0 ? (
            <p className="text-[13px] text-muted-on-ink">No paying accounts right now.</p>
          ) : (
            <ul className="space-y-3">
              {o.planMix.map((p) => (
                <li key={p.plan}>
                  <div className="mb-1 flex items-baseline justify-between text-[13px]">
                    <span className="text-[#E8ECF4]">
                      {p.plan} <span className="text-muted-on-ink">· {p.accounts} accounts</span>
                    </span>
                    <span className="font-mono text-[#E8ECF4]">{formatMoney(p.mrrCents)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
                    <div
                      className="h-full rounded-full bg-[#3987e5]"
                      style={{ width: `${o.mrrCents ? Math.max(2, (p.mrrCents / o.mrrCents) * 100) : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Renewals due in 30 days"
          action={
            o && o.renewals.length > 0 ? (
              <span className="font-mono text-[12px] text-high">{formatMoney(o.renewalsAtRiskCents)} MRR</span>
            ) : undefined
          }
        >
          {!o ? (
            <div className="h-24 animate-pulse rounded bg-ink-line/40" />
          ) : o.renewals.length === 0 ? (
            <p className="text-[13px] text-muted-on-ink">
              Nothing ends in the next 30 days without a renewal lined up.
            </p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {o.renewals.map((r) => (
                <li key={r.subscriptionId} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-[#E8ECF4]">{r.account}</div>
                    <div className="text-[11px] text-muted-on-ink">
                      {r.plan} · {formatMoney(r.amountCents)}/mo · ends {shortDate(r.endsAt)}
                    </div>
                  </div>
                  <span className={`font-mono text-[11px] ${r.daysLeft <= 7 ? 'text-high' : 'text-muted-on-ink'}`}>
                    {r.daysLeft}d
                  </span>
                  <button
                    onClick={() => act(() => renewRevenueSubscription(r.subscriptionId))}
                    className="cursor-pointer rounded-md border border-cobalt px-2.5 py-1 text-[12px] font-bold text-cobalt hover:bg-cobalt hover:text-white"
                  >
                    Renew
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <SubscriptionsCard subs={subs} onAction={act} />
      <PaymentsCard payments={payments} subs={subs} onAction={act} />
    </div>
  );
}

function SubscriptionsCard({
  subs,
  onAction,
}: {
  subs: RevenueSubscription[] | null;
  onAction: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [filter, setFilter] = useState<'current' | 'ended' | 'all'>('current');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (subs ?? []).filter(
      (s) =>
        (filter === 'all' ||
          (filter === 'current'
            ? s.state === 'active' || s.state === 'scheduled'
            : s.state === 'expired' || s.state === 'canceled')) &&
        (!q || `${s.account} ${s.plan.name} ${s.notes ?? ''}`.toLowerCase().includes(q)),
    );
  }, [subs, filter, query]);

  const exportCsv = () =>
    downloadCsv(
      'subscriptions.csv',
      toCsv(
        rows.map((s) => ({
          account: s.account,
          type: s.accountType,
          plan: s.plan.name,
          monthly_usd: (s.amountCents / 100).toFixed(2),
          state: s.state,
          started: s.startedAt.slice(0, 10),
          ends: s.endsAt.slice(0, 10),
          ended: s.endedAt?.slice(0, 10) ?? '',
          source: s.source,
          notes: s.notes ?? '',
        })),
      ),
    );

  return (
    <Card
      title="Subscriptions"
      action={
        <button
          onClick={exportCsv}
          disabled={!rows.length}
          className="cursor-pointer text-[12px] text-cobalt hover:underline disabled:opacity-40"
        >
          Export CSV
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search account, plan or note…"
          aria-label="Search subscriptions"
          className="min-w-[200px] flex-1 rounded-md border border-ink-line bg-ink px-3 py-1.5 text-[13px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
        />
        <div className="flex rounded-md border border-ink-line p-0.5" role="group" aria-label="Filter subscriptions">
          {(
            [
              ['current', 'Current'],
              ['ended', 'Ended'],
              ['all', 'All'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={`cursor-pointer rounded px-2.5 py-1 text-[12px] ${filter === k ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:text-[#E8ECF4]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!subs ? (
        <div className="h-32 animate-pulse rounded bg-ink-line/40" />
      ) : rows.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-muted-on-ink">No subscriptions match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-ink-line font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
                <th className="py-2 pr-3">Account</th>
                <th className="py-2 pr-3">Plan</th>
                <th className="py-2 pr-3 text-right">Monthly</th>
                <th className="py-2 pr-3">Term</th>
                <th className="py-2 pr-3">State</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const live = s.state === 'active' || s.state === 'scheduled';
                return (
                  <tr key={s.id} className="border-b border-ink-line/60 align-top">
                    <td className="py-2 pr-3">
                      <div className="text-[#E8ECF4]">{s.account}</div>
                      <div className="text-[11px] text-muted-on-ink">
                        {s.source}
                        {s.notes && ` · ${s.notes}`}
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-[#E8ECF4]">{s.plan.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {editing === s.id ? (
                        <form
                          className="flex justify-end gap-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const cents = parseMoney(amount);
                            if (cents === null) return;
                            void onAction(() => updateRevenueSubscription(s.id, { amountCents: cents })).then(() =>
                              setEditing(null),
                            );
                          }}
                        >
                          <input
                            autoFocus
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            aria-label="Monthly amount in USD"
                            className="w-24 rounded border border-cobalt bg-ink px-2 py-1 text-right font-mono text-[12px] text-[#E8ECF4] outline-none"
                          />
                          <button
                            type="submit"
                            className="cursor-pointer rounded bg-cobalt px-2 text-[11px] font-bold text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="cursor-pointer px-1 text-[11px] text-muted-on-ink"
                          >
                            ✕
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setEditing(s.id);
                            setAmount((s.amountCents / 100).toFixed(2));
                          }}
                          title="Edit monthly amount"
                          className={`cursor-pointer font-mono hover:underline ${s.amountCents === 0 ? 'text-high' : 'text-[#E8ECF4]'}`}
                        >
                          {s.amountCents === 0 ? 'Set price' : formatMoney(s.amountCents)}
                        </button>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[12px] text-muted-on-ink">
                      {shortDate(s.startedAt)} – {shortDate(s.endedAt ?? s.endsAt)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${STATE_STYLE[s.state]}`}
                      >
                        {s.state}
                      </span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">
                      {live && (
                        <>
                          <button
                            onClick={() => onAction(() => renewRevenueSubscription(s.id))}
                            className="cursor-pointer px-1.5 text-[12px] font-semibold text-cobalt hover:underline"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Stop ${s.account} from renewing? Access continues until ${shortDate(s.endsAt)}.`,
                                )
                              ) {
                                void onAction(() => cancelRevenueSubscription(s.id, false));
                              }
                            }}
                            className="cursor-pointer px-1.5 text-[12px] text-muted-on-ink hover:text-[#E8ECF4]"
                          >
                            Don&apos;t renew
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel ${s.account} now? They move to the Free plan immediately.`)) {
                                void onAction(() => cancelRevenueSubscription(s.id, true));
                              }
                            }}
                            className="cursor-pointer px-1.5 text-[12px] text-[#F3B7BF] hover:underline"
                          >
                            Cancel now
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function PaymentsCard({
  payments,
  subs,
  onAction,
}: {
  payments: RevenuePayment[] | null;
  subs: RevenueSubscription[] | null;
  onAction: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    paidAt: new Date().toISOString().slice(0, 10),
    kind: 'subscription' as PaymentKind,
    subscriptionId: '',
    payerName: '',
    method: 'Bank transfer',
    reference: '',
    notes: '',
  });
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // One entry per account: its most recent subscription.
  const accounts = useMemo(() => {
    const seen = new Map<string, RevenueSubscription>();
    for (const s of subs ?? []) {
      const key = s.userId ?? s.organizationId ?? s.id;
      if (!seen.has(key)) seen.set(key, s);
    }
    return [...seen.values()];
  }, [subs]);

  const cents = parseMoney(form.amount);
  const canSave = cents !== null && cents > 0 && (form.subscriptionId || form.payerName.trim());

  const exportCsv = () =>
    downloadCsv(
      'payments.csv',
      toCsv(
        (payments ?? []).map((p) => ({
          paid_on: p.paidAt.slice(0, 10),
          payer: p.payer,
          kind: KIND_LABEL[p.kind],
          plan: p.plan ?? '',
          amount_usd: (p.amountCents / 100).toFixed(2),
          method: p.method ?? '',
          reference: p.reference ?? '',
          notes: p.notes ?? '',
        })),
      ),
    );

  const input =
    'w-full rounded-md border border-ink-line bg-ink px-2.5 py-1.5 text-[13px] text-[#E8ECF4] outline-none focus:border-cobalt';

  return (
    <Card
      title="Payments received"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={!payments?.length}
            className="cursor-pointer text-[12px] text-cobalt hover:underline disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-[12px] font-bold text-white"
          >
            {open ? 'Close' : 'Record payment'}
          </button>
        </div>
      }
    >
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSave || cents === null) return;
            void onAction(() =>
              recordRevenuePayment({
                amountCents: cents,
                paidAt: new Date(`${form.paidAt}T12:00:00Z`).toISOString(),
                kind: form.kind,
                subscriptionId: form.subscriptionId || undefined,
                payerName: form.subscriptionId ? undefined : form.payerName,
                method: form.method,
                reference: form.reference,
                notes: form.notes,
              }),
            ).then(() => {
              setOpen(false);
              setForm((f) => ({ ...f, amount: '', reference: '', notes: '', payerName: '', subscriptionId: '' }));
            });
          }}
          className="mb-5 grid gap-3 rounded-lg border border-ink-line bg-ink p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="Amount (USD)">
            <input
              value={form.amount}
              onChange={set('amount')}
              placeholder="99.00"
              inputMode="decimal"
              className={`${input} font-mono`}
            />
          </Field>
          <Field label="Date paid">
            <input type="date" value={form.paidAt} onChange={set('paidAt')} className={input} />
          </Field>
          <Field label="Type">
            <select value={form.kind} onChange={set('kind')} className={input}>
              {(Object.keys(KIND_LABEL) as PaymentKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Method">
            <input value={form.method} onChange={set('method')} placeholder="Bank transfer, card…" className={input} />
          </Field>
          <Field label="Account (subscription)">
            <select value={form.subscriptionId} onChange={set('subscriptionId')} className={input}>
              <option value="">— Not tied to an account —</option>
              {accounts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.account} · {s.plan.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Or payer name">
            <input
              value={form.payerName}
              onChange={set('payerName')}
              disabled={Boolean(form.subscriptionId)}
              placeholder="e.g. Acme Capital (TDD)"
              className={`${input} disabled:opacity-40`}
            />
          </Field>
          <Field label="Invoice / reference">
            <input value={form.reference} onChange={set('reference')} placeholder="INV-0042" className={input} />
          </Field>
          <Field label="Notes">
            <input value={form.notes} onChange={set('notes')} className={input} />
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={!canSave}
              className="cursor-pointer rounded-md bg-cobalt px-4 py-1.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save payment
            </button>
            <span className="text-[12px] text-muted-on-ink">
              Pick an account, or type who paid for one-off work such as a TDD engagement.
            </span>
          </div>
        </form>
      )}

      {!payments ? (
        <div className="h-24 animate-pulse rounded bg-ink-line/40" />
      ) : payments.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-muted-on-ink">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-ink-line font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Payer</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Method / ref</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-ink-line/60">
                  <td className="py-2 pr-3 text-muted-on-ink">{shortDate(p.paidAt)}</td>
                  <td className="py-2 pr-3 text-[#E8ECF4]">
                    {p.payer}
                    {p.notes && <div className="text-[11px] text-muted-on-ink">{p.notes}</div>}
                  </td>
                  <td className="py-2 pr-3 text-muted-on-ink">
                    {KIND_LABEL[p.kind]}
                    {p.plan && ` · ${p.plan}`}
                  </td>
                  <td className="py-2 pr-3 text-[12px] text-muted-on-ink">
                    {[p.method, p.reference].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono text-[#E8ECF4]">{formatMoney(p.amountCents)}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete the ${formatMoney(p.amountCents)} payment from ${p.payer}?`)) {
                          void onAction(() => deleteRevenuePayment(p.id));
                        }
                      }}
                      aria-label="Delete payment"
                      className="cursor-pointer px-1 text-[12px] text-muted-on-ink hover:text-[#F3B7BF]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-ink-line bg-ink-soft p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  detail,
  tone,
  accent,
}: {
  label: string;
  value: string | number | null | undefined;
  detail?: string | null;
  tone?: 'good' | 'bad';
  accent?: boolean;
}) {
  const color = tone === 'good' ? 'text-pass' : tone === 'bad' ? 'text-[#F3B7BF]' : 'text-[#E8ECF4]';
  return (
    <div className={`rounded-lg border bg-ink-soft px-3.5 py-3 ${accent ? 'border-cobalt/50' : 'border-ink-line'}`}>
      <div className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">{label}</div>
      {value === undefined || value === null ? (
        <div className="mt-1.5 h-6 w-16 animate-pulse rounded bg-ink-line" />
      ) : (
        <div className={`mt-0.5 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
      )}
      {detail && <div className="mt-0.5 text-[11px] leading-snug text-muted-on-ink">{detail}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] text-muted-on-ink">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
