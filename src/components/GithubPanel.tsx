'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ApiError,
  connectGithub,
  disconnectGithub,
  getGithubStatus,
  listGithubBranches,
  listGithubRepos,
  reviewGithubPr,
  scanGithubRepo,
} from '@/lib/api';
import { GithubRepo, GithubStatus } from '@/lib/types';
import { PasswordInput } from './PasswordInput';

export function GithubPanel({ onScanStarted }: { onScanStarted: (scanId: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [scanningRepo, setScanningRepo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [prFormRepo, setPrFormRepo] = useState<string | null>(null);
  const [prNumber, setPrNumber] = useState('');
  const [reviewingPr, setReviewingPr] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchesByRepo, setBranchesByRepo] = useState<Record<string, string[]>>({});
  const [selectedBranch, setSelectedBranch] = useState<Record<string, string>>({});
  const [loadingBranches, setLoadingBranches] = useState<string | null>(null);

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      setRepos(await listGithubRepos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const loadStatus = async () => {
    setStatusError(null);
    try {
      const s = await getGithubStatus();
      setStatus(s);
      if (s.connected) await loadRepos();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to load GitHub connection status.');
    }
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    try {
      await connectGithub(token);
      setToken('');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await disconnectGithub();
      setStatus({ connected: false, username: null });
      setRepos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect.');
    }
  };

  const loadBranches = async (repo: GithubRepo) => {
    if (branchesByRepo[repo.fullName] || loadingBranches === repo.fullName) return;
    setLoadingBranches(repo.fullName);
    try {
      const branches = await listGithubBranches(repo.owner, repo.name);
      setBranchesByRepo((prev) => ({ ...prev, [repo.fullName]: branches }));
    } catch {
      // Non-critical — the default branch option still works for scanning.
    } finally {
      setLoadingBranches(null);
    }
  };

  const handleScan = async (repo: GithubRepo) => {
    setScanningRepo(repo.fullName);
    setError(null);
    setNeedsUpgrade(false);
    try {
      const ref = selectedBranch[repo.fullName] || repo.defaultBranch;
      const job = await scanGithubRepo(repo.owner, repo.name, ref);
      onScanStarted(job.id);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setNeedsUpgrade(true);
      }
      setError(err instanceof Error ? err.message : 'Failed to start scan.');
    } finally {
      setScanningRepo(null);
    }
  };

  const handleReviewPr = async (repo: GithubRepo) => {
    const pullNumber = Number(prNumber);
    if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
      setError('Enter a valid PR number.');
      return;
    }
    setReviewingPr(repo.fullName);
    setError(null);
    setNeedsUpgrade(false);
    try {
      const job = await reviewGithubPr(repo.owner, repo.name, pullNumber);
      onScanStarted(job.id);
      setPrFormRepo(null);
      setPrNumber('');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setNeedsUpgrade(true);
      }
      setError(err instanceof Error ? err.message : 'Failed to start PR review.');
    } finally {
      setReviewingPr(null);
    }
  };

  if (statusError) {
    return (
      <div className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-xs text-[#F3B7BF]">
        {statusError}{' '}
        <button onClick={loadStatus} className="cursor-pointer font-semibold underline">
          Retry
        </button>
      </div>
    );
  }

  if (!status) {
    return <div className="text-xs text-muted-on-ink">Loading GitHub connection…</div>;
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredRepos = query
    ? repos.filter((r) => `${r.fullName} ${r.description ?? ''}`.toLowerCase().includes(query))
    : repos;

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      {!status.connected ? (
        <form onSubmit={handleConnect}>
          <div className="mb-2 text-sm font-bold text-[#E8ECF4]">Connect GitHub</div>
          <p className="mb-3 text-xs leading-relaxed text-muted-on-ink">
            Paste a Personal Access Token with <code>repo</code> scope (or fine-grained{' '}
            <em>Contents: Read-only</em>). Create one at{' '}
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=audit-bench"
              target="_blank"
              rel="noreferrer"
              className="text-cobalt underline"
            >
              github.com/settings/tokens
            </a>
            .
          </p>
          <div className="flex gap-2">
            <PasswordInput
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_…"
              wrapperClassName="flex-1"
              className="w-full rounded-md border border-ink-line bg-ink px-3 py-2 font-mono text-[13px] text-[#E8ECF4] outline-none"
            />
            <button
              type="submit"
              disabled={connecting}
              className="cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {connecting ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-[#E8ECF4]">
              Connected as <span className="font-bold">@{status.username}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="cursor-pointer text-xs font-medium text-muted-on-ink hover:text-[#E8ECF4]"
            >
              Disconnect
            </button>
          </div>

          {loadingRepos && <div className="text-xs text-muted-on-ink">Loading repositories…</div>}

          {!loadingRepos && repos.length === 0 && (
            <div className="text-xs text-muted-on-ink">No repositories found for this token.</div>
          )}

          {!loadingRepos && repos.length > 0 && (
            <>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repositories…"
                className="mb-2 w-full rounded-md border border-ink-line bg-ink px-3 py-1.5 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink"
              />
              {filteredRepos.length === 0 && (
                <div className="text-xs text-muted-on-ink">No repositories match &ldquo;{searchQuery}&rdquo;.</div>
              )}
              <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="rounded-md border border-ink-line bg-ink px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[13px] text-[#E8ECF4]">
                          {repo.fullName}
                        </span>
                        {repo.private && (
                          <span className="shrink-0 rounded bg-ink-line px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-on-ink uppercase">
                            Private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <div className="truncate text-xs text-muted-on-ink">{repo.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setPrFormRepo(prFormRepo === repo.fullName ? null : repo.fullName)}
                      className="shrink-0 cursor-pointer rounded-md border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink hover:text-[#E8ECF4]"
                    >
                      Review PR
                    </button>
                    <button
                      onClick={() => handleScan(repo)}
                      disabled={scanningRepo !== null}
                      className="shrink-0 cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
                    >
                      {scanningRepo === repo.fullName ? 'Starting…' : 'Scan'}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 border-t border-ink-line pt-2">
                    <label htmlFor={`branch-${repo.id}`} className="text-xs text-muted-on-ink">
                      Branch
                    </label>
                    <select
                      id={`branch-${repo.id}`}
                      value={selectedBranch[repo.fullName] ?? repo.defaultBranch}
                      onFocus={() => loadBranches(repo)}
                      onChange={(e) =>
                        setSelectedBranch((prev) => ({ ...prev, [repo.fullName]: e.target.value }))
                      }
                      className="max-w-[160px] rounded-md border border-ink-line bg-ink-soft px-2 py-1 font-mono text-[12px] text-[#E8ECF4] outline-none"
                    >
                      {(branchesByRepo[repo.fullName] ?? [repo.defaultBranch]).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {loadingBranches === repo.fullName && (
                      <span className="text-xs text-muted-on-ink">Loading branches…</span>
                    )}
                  </div>

                  {prFormRepo === repo.fullName && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-ink-line pt-2">
                      <span className="text-xs text-muted-on-ink">PR #</span>
                      <input
                        type="number"
                        min={1}
                        value={prNumber}
                        onChange={(e) => setPrNumber(e.target.value)}
                        placeholder="42"
                        className="w-20 rounded-md border border-ink-line bg-ink-soft px-2 py-1 font-mono text-[12px] text-[#E8ECF4] outline-none"
                      />
                      <button
                        onClick={() => handleReviewPr(repo)}
                        disabled={reviewingPr !== null}
                        className="cursor-pointer rounded-md bg-cobalt px-3 py-1 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
                      >
                        {reviewingPr === repo.fullName ? 'Starting…' : 'Review'}
                      </button>
                      <span className="text-xs text-muted-on-ink">
                        Scopes the review to the diff, then posts inline comments, a summary, and a commit status
                        check directly on the PR.
                      </span>
                    </div>
                  )}
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
          {error}
          {needsUpgrade && (
            <>
              {' '}
              <Link href="/app/dashboard" className="font-semibold underline">
                Upgrade your plan
              </Link>
              .
            </>
          )}
        </div>
      )}
    </div>
  );
}
