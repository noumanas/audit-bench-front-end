'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { getInvitePreview, acceptOrganizationInvite, ApiError } from '@/lib/api';
import { InvitePreview } from '@/lib/types';
import { setPendingInvite } from '@/lib/pendingInvite';

const STATUS_COPY: Record<Exclude<InvitePreview['status'], 'pending'>, string> = {
  accepted: 'This invite has already been accepted.',
  revoked: 'This invite has been revoked by the organization.',
  expired: 'This invite has expired — ask whoever invited you to send a new one.',
};

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    getInvitePreview(token)
      .then(setPreview)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'This invite link is not valid.'));
  }, [token]);

  useEffect(() => {
    if (authLoading || !preview || preview.status !== 'pending') return;
    if (!user) setPendingInvite(token);
  }, [authLoading, preview, user, token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      await acceptOrganizationInvite(token);
      await refreshUser();
      setAccepted(true);
      setTimeout(() => router.push('/app/team'), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to accept invite.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6 py-12">
      <div className="shadow-panel w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-7 text-center">
        {!preview && !error && <p className="text-sm text-muted-on-ink">Loading invite…</p>}

        {error && (
          <>
            <h1 className="mb-2 text-lg font-bold text-[#E8ECF4]">Invite not found</h1>
            <p className="mb-5 text-sm text-muted-on-ink">{error}</p>
            <Link href="/" className="inline-block rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white">
              Back home
            </Link>
          </>
        )}

        {preview && !error && preview.status !== 'pending' && (
          <>
            <h1 className="mb-2 text-lg font-bold text-[#E8ECF4]">{preview.organizationName}</h1>
            <p className="text-sm text-muted-on-ink">{STATUS_COPY[preview.status]}</p>
          </>
        )}

        {preview && !error && preview.status === 'pending' && (
          <>
            <div className="mb-5 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt uppercase">
                Team invite
              </span>
            </div>
            <h1 className="mb-1 text-xl font-bold tracking-tight text-[#E8ECF4]">{preview.organizationName}</h1>
            <p className="mb-6 text-sm leading-relaxed text-muted-on-ink">
              <strong className="text-[#E8ECF4]">{preview.invitedBy}</strong> invited{' '}
              <strong className="text-[#E8ECF4]">{preview.email}</strong> to join as{' '}
              {preview.role === 'admin' ? 'an admin' : 'a member'}.
            </p>

            {error && (
              <div className="mb-4 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
                {error}
              </div>
            )}

            {accepted ? (
              <p className="text-sm font-semibold text-pass">You&apos;re in — redirecting to your team…</p>
            ) : authLoading ? (
              <p className="text-sm text-muted-on-ink">One moment…</p>
            ) : user ? (
              user.email.toLowerCase() === preview.email.toLowerCase() ? (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full cursor-pointer rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-70"
                >
                  {accepting ? 'Joining…' : `Accept & join ${preview.organizationName}`}
                </button>
              ) : (
                <p className="text-sm text-muted-on-ink">
                  You&apos;re logged in as <strong className="text-[#E8ECF4]">{user.email}</strong>, but this invite
                  was sent to <strong className="text-[#E8ECF4]">{preview.email}</strong>. Log out and sign in with
                  that account to accept it.
                </p>
              )
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href={`/signup?email=${encodeURIComponent(preview.email)}`}
                  className="w-full rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-px"
                >
                  Create an account
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-lg border border-ink-line px-4 py-2.5 text-sm font-bold text-[#E8ECF4]"
                >
                  Log in
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
