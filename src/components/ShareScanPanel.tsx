'use client';

import { useState } from 'react';
import { shareScan, unshareScan } from '@/lib/api';
import { useSiteOrigin } from '@/lib/useSiteOrigin';

/**
 * "Share this report" panel for a completed scan (see backend
 * PublicScanService.share). Creates a public link anyone can open without an
 * account, with copy / LinkedIn / X buttons, and turns it off again.
 */
export function ShareScanPanel({
  scanId,
  sourceName,
  initialShareId,
  initiallyPublic,
}: {
  scanId: string;
  sourceName: string;
  initialShareId?: string | null;
  initiallyPublic?: boolean;
}) {
  const origin = useSiteOrigin();
  const [shareId, setShareId] = useState(initialShareId ?? null);
  const [isPublic, setIsPublic] = useState(Boolean(initiallyPublic && initialShareId));
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = shareId ? `${origin}/scan/${shareId}` : '';
  const text = `Code health report for ${sourceName}, by Audit Bench Ai`;

  const copy = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const enable = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await shareScan(scanId);
      setShareId(r.shareId);
      setIsPublic(true);
      await copy(`${origin}/scan/${r.shareId}`).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a link.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setError(null);
    try {
      await unshareScan(scanId);
      setIsPublic(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not stop sharing.');
    } finally {
      setBusy(false);
    }
  };

  const linkBtn =
    'shrink-0 rounded-md border border-paper-line bg-paper-card px-3 py-2 text-[13px] font-semibold text-[#1C2128] hover:border-muted-on-paper';

  return (
    <section
      id="share"
      className={`scroll-mt-6 rounded-lg border p-4 break-inside-avoid print:hidden ${
        isPublic ? 'border-cobalt/40 bg-cobalt/5' : 'border-paper-line bg-paper'
      }`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-[#1C2128]">
            {isPublic ? 'This report is shared' : 'Share this report'}
          </h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-on-paper">
            {isPublic
              ? 'Anyone with the link can view it without an account. '
              : 'Create a public link your team, clients or followers can open without an account. '}
            Where secrets are and who wrote the code always stay hidden.
          </p>
        </div>
        {!isPublic && (
          <button
            onClick={enable}
            disabled={busy}
            className="shrink-0 cursor-pointer rounded-md bg-cobalt px-4 py-2 text-[13px] font-bold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Creating link…' : 'Create share link'}
          </button>
        )}
      </div>

      {isPublic && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Public report link"
            className="min-w-[220px] flex-1 rounded-md border border-paper-line bg-paper-card px-3 py-2 font-mono text-[12px] text-[#1C2128] outline-none focus:border-cobalt"
          />
          <button onClick={() => void copy(url)} className={`${linkBtn} cursor-pointer`}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className={linkBtn}
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noreferrer"
            className={linkBtn}
          >
            X
          </a>
          <a href={url} target="_blank" rel="noreferrer" className={linkBtn}>
            Open ↗
          </a>
          <button
            onClick={disable}
            disabled={busy}
            className="shrink-0 cursor-pointer rounded-md px-2 py-2 text-[12px] font-semibold text-muted-on-paper hover:text-critical disabled:opacity-60"
          >
            {busy ? 'Working…' : 'Stop sharing'}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-[12px] text-critical">{error}</p>}
    </section>
  );
}
