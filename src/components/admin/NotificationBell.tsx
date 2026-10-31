'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getAdminNotifications, markAdminNotificationsSeen } from '@/lib/api';
import { AdminNotifications, ActivityLog } from '@/lib/types';
import { ACTIVITY_META, activityDetail, flag, locationLabel, methodLabel } from './activityDisplay';
import { timeAgo } from '@/lib/time';

const POLL_MS = 60_000;

/**
 * New sign-ups and plan requests since this admin last opened the bell
 * (backend: GET /admin/notifications). Polls while the tab is visible and
 * mirrors the unread count into the page title so it shows in a background tab.
 */
export function NotificationBell({ onNavigate }: { onNavigate: (tab: 'requests' | 'activity') => void }) {
  const [data, setData] = useState<AdminNotifications | null>(null);
  const [open, setOpen] = useState(false);
  // Captured when the panel opens, so items stay highlighted as "new" while it's open.
  const [seenBefore, setSeenBefore] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    getAdminNotifications()
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const unread = data?.unreadCount ?? 0;

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\) /, '');
    document.title = unread ? `(${unread > 99 ? '99+' : unread}) ${base}` : base;
    return () => {
      document.title = document.title.replace(/^\(\d+\+?\) /, '');
    };
  }, [unread]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setSeenBefore(data ? new Date(data.seenAt).getTime() : null);
    setOpen(true);
    if (unread) {
      setData((d) => (d ? { ...d, unreadCount: 0 } : d));
      markAdminNotificationsSeen().catch(() => {});
    }
  };

  const go = (log: ActivityLog) => {
    setOpen(false);
    onNavigate(log.type === 'plan_requested' ? 'requests' : 'activity');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} new` : 'Notifications'}
        aria-expanded={open}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-ink-line bg-ink-soft text-muted-on-ink transition-colors hover:text-[#E8ECF4]"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-critical px-1 font-mono text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="shadow-panel fade-up absolute right-0 z-40 mt-2 w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-xl border border-ink-line bg-ink-soft">
          <div className="flex items-center justify-between border-b border-ink-line px-4 py-3">
            <span className="text-sm font-bold text-[#E8ECF4]">Notifications</span>
            <span className="font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">Sign-ups · plan requests</span>
          </div>
          {!data || data.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-muted-on-ink">
              Nothing yet — new sign-ups and plan requests show up here.
            </p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto">
              {data.items.map((log) => {
                const isNew = seenBefore != null && new Date(log.createdAt).getTime() > seenBefore;
                const meta = ACTIVITY_META[log.type];
                const where = locationLabel(log);
                const detail = activityDetail(log);
                return (
                  <li key={log.id}>
                    <button
                      onClick={() => go(log)}
                      className={`flex w-full cursor-pointer gap-3 border-b border-ink-line/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-ink/50 ${
                        isNew ? 'bg-cobalt/[0.07]' : ''
                      }`}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] text-[#E8ECF4]">
                          <strong className="font-semibold">{log.user?.name || log.email}</strong>{' '}
                          <span className="text-muted-on-ink">
                            {log.type === 'signup'
                              ? `signed up${log.method ? ` with ${methodLabel(log.method)}` : ''}`
                              : 'requested a plan'}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-on-ink">
                          {[detail, where && `${flag(log.countryCode)} ${where}`].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-on-ink">{timeAgo(log.createdAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onNavigate('activity');
            }}
            className="w-full cursor-pointer border-t border-ink-line px-4 py-2.5 text-center text-xs font-semibold text-cobalt hover:bg-ink/50"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}
