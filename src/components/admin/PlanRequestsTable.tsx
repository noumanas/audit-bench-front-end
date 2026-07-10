'use client';

import { useEffect, useState } from 'react';
import { listAdminPlanRequests, approvePlanRequest, rejectPlanRequest } from '@/lib/api';
import { PlanRequest, PlanRequestStatus } from '@/lib/types';

const STATUS_STYLE: Record<PlanRequestStatus, string> = {
  pending: 'bg-high',
  approved: 'bg-pass',
  rejected: 'bg-critical',
};

const FILTERS: { label: string; value: PlanRequestStatus | 'all' }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

export function PlanRequestsTable() {
  const [filter, setFilter] = useState<PlanRequestStatus | 'all'>('pending');
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = () => {
    setLoading(true);
    listAdminPlanRequests(filter === 'all' ? undefined : filter)
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plan requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleApprove = async (id: string) => {
    setActingId(id);
    setError(null);
    try {
      await approvePlanRequest(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request.');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActingId(id);
    setError(null);
    try {
      await rejectPlanRequest(id, note.trim() || undefined);
      setRejectingId(null);
      setNote('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request.');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold ${
              filter === f.value ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-muted-on-ink">Loading…</div>}

      {!loading && requests.length === 0 && (
        <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3 text-sm text-muted-on-ink">
          No {filter === 'all' ? '' : filter} plan requests.
        </div>
      )}

      <div className="space-y-2">
        {requests.map((r) => (
          <div key={r.id} className="rounded-lg border border-ink-line bg-ink-soft p-3.5">
            <div className="mb-1.5 flex items-center gap-2">
              <span
                className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-white uppercase ${STATUS_STYLE[r.status]}`}
              >
                {r.status}
              </span>
              <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{r.user?.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-on-ink">
              <span>
                Requested <strong className="text-[#E8ECF4]">{r.requestedPlan.name}</strong>
              </span>
              <span className="ml-auto shrink-0 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</span>
            </div>
            {r.reviewedBy && (
              <div className="mt-1 text-xs text-muted-on-ink">
                Reviewed by {r.reviewedBy.email}
                {r.reviewedAt && ` · ${new Date(r.reviewedAt).toLocaleString()}`}
                {r.note && ` — "${r.note}"`}
              </div>
            )}

            {r.status === 'pending' && (
              <div className="mt-2.5 border-t border-ink-line pt-2.5">
                {rejectingId === r.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional reason…"
                      className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-2 py-1 text-xs text-[#E8ECF4] outline-none"
                    />
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={actingId === r.id}
                      className="shrink-0 cursor-pointer rounded-md bg-critical px-3 py-1 text-xs font-bold whitespace-nowrap text-white disabled:cursor-wait disabled:opacity-70"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setNote('');
                      }}
                      className="shrink-0 cursor-pointer text-xs font-medium whitespace-nowrap text-muted-on-ink hover:text-[#E8ECF4]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actingId !== null}
                      className="cursor-pointer rounded-md bg-pass px-3 py-1.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
                    >
                      {actingId === r.id ? 'Approving…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectingId(r.id)}
                      disabled={actingId !== null}
                      className="cursor-pointer rounded-md border border-critical/40 px-3 py-1.5 text-xs font-bold text-critical disabled:cursor-wait disabled:opacity-70"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
