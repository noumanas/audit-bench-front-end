'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startPublicScan } from '@/lib/api';
import { GithubLogoIcon } from './icons';

const EXAMPLES = ['expressjs/express', 'pallets/flask', 'axios/axios'];

/**
 * The no-sign-up entry point: paste a public GitHub repo, get a shareable
 * report. Used on the home page and on /scan.
 */
export function PublicScanForm({
  tone = 'ink',
  showExamples = true,
}: {
  tone?: 'ink' | 'paper';
  showExamples?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paper = tone === 'paper';

  const submit = async (value: string) => {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { shareId } = await startPublicScan(value.trim());
      router.push(`/scan/${shareId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the scan. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(url);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label className="relative flex-1">
          <span className="sr-only">Public GitHub repository URL</span>
          <GithubLogoIcon
            className={`pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 ${paper ? 'text-muted-on-paper' : 'text-muted-on-ink'}`}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            autoComplete="off"
            spellCheck={false}
            className={`w-full rounded-lg border py-3 pr-3 pl-10 font-mono text-sm outline-none focus:border-cobalt ${
              paper
                ? 'border-paper-line bg-paper-card text-[#1C2128] placeholder:text-muted-on-paper'
                : 'border-ink-line bg-ink-soft text-[#E8ECF4] placeholder:text-muted-on-ink'
            }`}
          />
        </label>
        <button
          type="submit"
          disabled={busy || !url.trim()}
          className="cursor-pointer rounded-lg bg-cobalt px-5 py-3 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Starting scan…' : 'Scan free'}
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-[13px] text-[#F3B7BF]"
        >
          {error}
        </p>
      )}
      {showExamples && (
        <p className={`mt-2.5 text-[12px] ${paper ? 'text-muted-on-paper' : 'text-muted-on-ink'}`}>
          No sign-up. Public repos only. Try{' '}
          {EXAMPLES.map((ex, i) => (
            <span key={ex}>
              {i > 0 && ', '}
              <button
                type="button"
                onClick={() => {
                  setUrl(`https://github.com/${ex}`);
                  void submit(ex);
                }}
                disabled={busy}
                className="cursor-pointer font-mono text-cobalt hover:underline disabled:opacity-50"
              >
                {ex}
              </button>
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}
