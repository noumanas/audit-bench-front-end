'use client';

import { useCallback, useEffect, useState } from 'react';
import { checkEmailCampaign, getEmailCampaigns, previewEmailCampaign, sendEmailCampaign } from '@/lib/api';
import { formatDateTime, timeAgo } from '@/lib/time';
import type { EmailCampaignKey, EmailCampaignRecipients, EmailCampaignsStatus, EmailCampaignStatus } from '@/lib/types';

const CAMPAIGNS: { key: EmailCampaignKey; title: string; description: string; envVar: string }[] = [
  {
    key: 'upgrade',
    title: 'Weekly upgrade email',
    description:
      "Free-plan users on a personal account who haven't unsubscribed. Nobody gets it twice within 6 days, even if you send it again.",
    envVar: 'UPGRADE_EMAILS_ENABLED',
  },
  {
    key: 'inactivity',
    title: 'Inactivity reminder',
    description:
      "Users with no sign-in, audit or scan for 7 days who haven't unsubscribed. Each user gets it once until they come back and go quiet again.",
    envVar: 'INACTIVITY_EMAILS_ENABLED',
  },
];

// While a send is running the cards poll for progress at this interval.
const POLL_MS = 3000;

/**
 * Super admin: the recurring emails (see the backend's src/email). Check who'd
 * get one, send yourself a preview, or send it to everyone eligible now
 * instead of waiting for the schedule. Test-domain accounts (example.com,
 * .local, …) are always skipped by the server.
 */
export function EmailCampaigns() {
  const [status, setStatus] = useState<EmailCampaignsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    getEmailCampaigns()
      .then((s) => {
        setStatus(s);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the email status.'));
  }, []);

  useEffect(refresh, [refresh]);

  const anyRunning = status ? Object.values(status).some((s) => s.running) : false;
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [anyRunning, refresh]);

  return (
    <div className="max-w-3xl space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-[13px] text-[#F3B7BF]"
        >
          {error}
        </p>
      )}
      {!status
        ? CAMPAIGNS.map((c) => <div key={c.key} className="h-44 animate-pulse rounded-lg bg-ink-soft" />)
        : CAMPAIGNS.map((c) => (
            <CampaignCard key={c.key} campaign={c} status={status[c.key]} onChanged={refresh} />
          ))}
      <p className="text-[12px] leading-relaxed text-muted-on-ink">
        Welcome, team invite and plan approved/rejected emails are sent automatically when those things happen, so
        they have no controls here.
      </p>
    </div>
  );
}

function CampaignCard({
  campaign,
  status,
  onChanged,
}: {
  campaign: (typeof CAMPAIGNS)[number];
  status: EmailCampaignStatus;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState<'check' | 'preview' | 'send' | null>(null);
  const [recipients, setRecipients] = useState<EmailCampaignRecipients | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const act = async (kind: 'check' | 'preview' | 'send', fn: () => Promise<void>) => {
    setBusy(kind);
    setNotice(null);
    try {
      await fn();
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setBusy(null);
    }
  };

  const check = () =>
    act('check', async () => {
      setRecipients(await checkEmailCampaign(campaign.key));
    });

  const preview = () =>
    act('preview', async () => {
      const { sentTo } = await previewEmailCampaign(campaign.key);
      setNotice({ kind: 'ok', text: `Preview sent to ${sentTo}.` });
    });

  const send = () =>
    act('send', async () => {
      // Always confirm against a fresh count, not one checked minutes ago.
      const fresh = await checkEmailCampaign(campaign.key);
      setRecipients(fresh);
      // The recipients list below already says "Nobody would get this right now."
      if (fresh.eligible === 0) return;
      const who = fresh.eligible === 1 ? '1 user' : `${fresh.eligible} users`;
      if (!window.confirm(`Send "${campaign.title}" to ${who} now? This can't be undone.`)) return;
      const { eligible } = await sendEmailCampaign(campaign.key);
      setNotice({ kind: 'ok', text: `Sending to ${eligible === 1 ? '1 user' : `${eligible} users`}…` });
      onChanged();
    });

  const run = status.lastRun;
  const disabled = busy !== null || status.running;

  return (
    <section className="rounded-lg border border-ink-line bg-ink-soft p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#E8ECF4]">{campaign.title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-on-ink">{campaign.description}</p>
        </div>
        <span
          title={
            status.enabled
              ? `Sends automatically: ${status.schedule}`
              : `Set ${campaign.envVar}="true" on the server to send automatically`
          }
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            status.enabled ? 'bg-pass/15 text-pass' : 'border border-ink-line text-muted-on-ink'
          }`}
        >
          {status.enabled ? `Automatic · ${status.schedule}` : 'Automatic sending off'}
        </span>
      </div>

      {run && (
        <div className="mt-4 rounded-md border border-ink-line bg-ink px-3.5 py-2.5 text-[13px]">
          {run.finishedAt === null ? (
            <>
              <p className="font-semibold text-[#E8ECF4]">
                Sending… {run.sent + run.failed} of {run.eligible}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-line">
                <div
                  className="h-full rounded-full bg-cobalt transition-[width] duration-500"
                  style={{ width: `${run.eligible ? ((run.sent + run.failed) / run.eligible) * 100 : 0}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-muted-on-ink">
              Last run{' '}
              <span className="text-[#E8ECF4]" title={formatDateTime(run.finishedAt)}>
                {timeAgo(run.finishedAt)}
              </span>{' '}
              ({run.trigger === 'manual' ? 'sent from here' : 'scheduled'}):{' '}
              <span className="font-semibold text-pass">{run.sent} sent</span>
              {run.failed > 0 && <span className="font-semibold text-[#F3B7BF]"> · {run.failed} failed</span>}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => void check()}
          disabled={disabled}
          className="cursor-pointer rounded-md border border-ink-line px-3.5 py-1.5 text-sm font-semibold text-[#E8ECF4] hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'check' ? 'Checking…' : 'Check recipients'}
        </button>
        <button
          onClick={() => void preview()}
          disabled={disabled}
          className="cursor-pointer rounded-md border border-ink-line px-3.5 py-1.5 text-sm font-semibold text-[#E8ECF4] hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'preview' ? 'Sending preview…' : 'Send me a preview'}
        </button>
        <button
          onClick={() => void send()}
          disabled={disabled}
          className="cursor-pointer rounded-md bg-cobalt px-3.5 py-1.5 text-sm font-bold text-white hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.running ? 'Sending…' : busy === 'send' ? 'Starting…' : 'Send now'}
        </button>
      </div>

      {notice && (
        <p
          role={notice.kind === 'error' ? 'alert' : 'status'}
          className={`mt-3 text-[13px] ${notice.kind === 'error' ? 'text-[#F3B7BF]' : 'text-pass'}`}
        >
          {notice.text}
        </p>
      )}

      {recipients && (
        <div className="mt-4">
          <p className="text-[13px] text-[#E8ECF4]">
            {recipients.eligible === 0
              ? 'Nobody would get this right now.'
              : `${recipients.eligible} ${recipients.eligible === 1 ? 'user' : 'users'} would get this right now:`}
          </p>
          {recipients.eligible > 0 && (
            <ul className="mt-2 max-h-56 overflow-y-auto rounded-md border border-ink-line bg-ink px-3.5 py-2 text-[13px]">
              {recipients.recipients.map((r) => {
                const email = typeof r === 'string' ? r : r.email;
                return (
                  <li key={email} className="flex justify-between gap-3 py-1">
                    <span className="truncate font-mono text-[#E8ECF4]">{email}</span>
                    {typeof r !== 'string' && (
                      <span className="shrink-0 text-muted-on-ink">{r.daysInactive} days inactive</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
