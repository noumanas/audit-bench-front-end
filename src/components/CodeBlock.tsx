'use client';

import { useState } from 'react';

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-ink-line bg-ink">
      {label && (
        <div className="flex items-center justify-between border-b border-ink-line px-4 py-2">
          <span className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{label}</span>
          <button
            onClick={handleCopy}
            className="cursor-pointer text-xs font-semibold text-muted-on-ink hover:text-[#E8ECF4]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <div className="relative">
        {!label && (
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 cursor-pointer rounded-md border border-ink-line bg-ink-soft px-2.5 py-1 text-xs font-semibold text-muted-on-ink hover:text-[#E8ECF4]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed whitespace-pre text-[#E8ECF4]">
          {code}
        </pre>
      </div>
    </div>
  );
}
