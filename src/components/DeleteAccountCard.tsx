'use client';

import { useState } from 'react';
import { deleteMyAccount } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

/** Danger zone: delete the account and every scan, report, rule and token tied to it. */
export function DeleteAccountCard() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;
  const matches = email.trim().toLowerCase() === user.email.toLowerCase();

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteMyAccount(email);
      logout();
      window.location.assign('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the account.');
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 rounded-lg border border-critical/40 bg-ink-soft p-5">
      <h2 className="text-sm font-bold text-[#E8ECF4]">Delete account</h2>
      <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-on-ink">
        Permanently deletes your account and everything tied to it: scans and their reports, audits, review rules,
        feedback, connected GitHub, GitLab and Bitbucket tokens, and GitHub App links. If you own a team with no other
        members, the team is deleted too. This can&apos;t be undone.
      </p>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 cursor-pointer rounded-md border border-critical/60 px-3.5 py-1.5 text-[13px] font-bold text-[#F3B7BF] hover:bg-critical/10"
        >
          Delete my account…
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="min-w-[16rem] flex-1">
            <span className="sr-only">Type your email to confirm</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`Type ${user.email} to confirm`}
              autoComplete="off"
              className="w-full rounded-md border border-ink-line bg-ink px-3 py-1.5 text-[13px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-critical"
            />
          </label>
          <button
            onClick={() => void remove()}
            disabled={!matches || busy}
            className="cursor-pointer rounded-md bg-critical px-3.5 py-1.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete everything'}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer text-[13px] text-muted-on-ink hover:text-[#E8ECF4]"
          >
            Cancel
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-[#F3B7BF]">
          {error}
        </p>
      )}
    </section>
  );
}
