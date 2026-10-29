'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteAdminUser } from '@/lib/api';
import { TrashIcon } from '@/components/icons';

/**
 * Confirms deleting a user: typing their email is required, so a stray
 * click on the trash icon can't remove the wrong account.
 */
export function DeleteUserDialog({
  user,
  onClose,
  onDeleted,
}: {
  user: { id: string; email: string };
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim().toLowerCase() === user.email.toLowerCase();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const submit = async () => {
    if (!matches || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAdminUser(user.id, typed.trim());
      onDeleted(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete the user.');
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-ink-line bg-ink-soft p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-critical/15 text-critical">
            <TrashIcon className="h-4 w-4" />
          </span>
          <h2 id="delete-user-title" className="text-base font-bold text-[#E8ECF4]">
            Delete this user?
          </h2>
        </div>
        <p id="delete-user-desc" className="mb-4 text-sm leading-relaxed text-muted-on-ink">
          <span className="font-mono text-[#E8ECF4]">{user.email}</span>
          {
            ' and all their audits, scans, reports, rules and connected tokens will be permanently deleted. Payment records are kept. This can’t be undone.'
          }
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="mb-1.5 block text-[13px] text-muted-on-ink" htmlFor="delete-user-confirm">
            Type <span className="font-mono text-[#E8ECF4]">{user.email}</span> to confirm
          </label>
          <input
            id="delete-user-confirm"
            ref={inputRef}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="mb-3 w-full rounded-md border border-ink-line bg-ink px-3 py-2 font-mono text-[13px] text-[#E8ECF4] outline-none focus:border-critical"
          />
          {error && (
            <div className="mb-3 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-[12px] text-[#F3B7BF]">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="min-h-10 cursor-pointer rounded-md border border-ink-line px-4 text-sm font-medium text-[#E8ECF4] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!matches || busy}
              className="min-h-10 cursor-pointer rounded-md bg-critical px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Deleting…' : 'Delete user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
