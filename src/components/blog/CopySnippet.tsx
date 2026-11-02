'use client';

import { useState } from 'react';

/** Read-only snippet with a copy button — used for "cite this page" link HTML. */
export function CopySnippet({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the text is still selectable in the box.
    }
  };

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">{label}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-paper-line bg-paper-card px-2.5 py-1 text-xs font-semibold text-[#1C2128] hover:border-cobalt/40 hover:text-cobalt"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-paper-line bg-paper-card p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#1C2128]">
        {value}
      </pre>
    </div>
  );
}
