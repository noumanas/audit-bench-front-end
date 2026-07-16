'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ApiError,
  connectGitlab,
  disconnectGitlab,
  getGitlabStatus,
  listGitlabBranches,
  listGitlabMergeRequests,
  listGitlabProjects,
  reviewGitlabMr,
  scanGitlabProject,
} from '@/lib/api';
import { GitlabMergeRequest, GitlabProject, GitlabStatus } from '@/lib/types';
import { PasswordInput } from './PasswordInput';

export function GitlabPanel({ onScanStarted }: { onScanStarted: (scanId: string) => void }) {
  const [status, setStatus] = useState<GitlabStatus | null>(null);
  const [projects, setProjects] = useState<GitlabProject[]>([]);
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [scanningProject, setScanningProject] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [mrFormProject, setMrFormProject] = useState<number | null>(null);
  const [mrIid, setMrIid] = useState('');
  const [reviewingMr, setReviewingMr] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchesByProject, setBranchesByProject] = useState<Record<number, string[]>>({});
  const [selectedBranch, setSelectedBranch] = useState<Record<number, string>>({});
  const [loadingBranches, setLoadingBranches] = useState<number | null>(null);
  const [mrsByProject, setMrsByProject] = useState<Record<number, GitlabMergeRequest[]>>({});
  const [loadingMrs, setLoadingMrs] = useState<number | null>(null);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      setProjects(await listGitlabProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadStatus = async () => {
    setStatusError(null);
    try {
      const s = await getGitlabStatus();
      setStatus(s);
      if (s.connected) await loadProjects();
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to load GitLab connection status.');
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
      await connectGitlab(token);
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
      await disconnectGitlab();
      setStatus({ connected: false, username: null });
      setProjects([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect.');
    }
  };

  const loadBranches = async (project: GitlabProject) => {
    if (branchesByProject[project.id] || loadingBranches === project.id) return;
    setLoadingBranches(project.id);
    try {
      const branches = await listGitlabBranches(project.id);
      setBranchesByProject((prev) => ({ ...prev, [project.id]: branches }));
    } catch {
      // Non-critical — the default branch option still works for scanning.
    } finally {
      setLoadingBranches(null);
    }
  };

  const loadMrs = async (project: GitlabProject) => {
    if (mrsByProject[project.id] || loadingMrs === project.id) return;
    setLoadingMrs(project.id);
    try {
      const mrs = await listGitlabMergeRequests(project.id);
      setMrsByProject((prev) => ({ ...prev, [project.id]: mrs }));
      if (mrs.length > 0) setMrIid((prev) => prev || String(mrs[0].iid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load merge requests.');
    } finally {
      setLoadingMrs(null);
    }
  };

  const handleScan = async (project: GitlabProject) => {
    setScanningProject(project.id);
    setError(null);
    setNeedsUpgrade(false);
    try {
      const ref = selectedBranch[project.id] || project.defaultBranch;
      const job = await scanGitlabProject(project.id, ref, project.pathWithNamespace);
      onScanStarted(job.id);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setNeedsUpgrade(true);
      }
      setError(err instanceof Error ? err.message : 'Failed to start scan.');
    } finally {
      setScanningProject(null);
    }
  };

  const handleReviewMr = async (project: GitlabProject) => {
    const iid = Number(mrIid);
    if (!Number.isInteger(iid) || iid <= 0) {
      setError('Enter a valid MR IID.');
      return;
    }
    setReviewingMr(project.id);
    setError(null);
    setNeedsUpgrade(false);
    try {
      const job = await reviewGitlabMr(project.id, iid, project.pathWithNamespace);
      onScanStarted(job.id);
      setMrFormProject(null);
      setMrIid('');
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setNeedsUpgrade(true);
      }
      setError(err instanceof Error ? err.message : 'Failed to start MR review.');
    } finally {
      setReviewingMr(null);
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
    return <div className="text-xs text-muted-on-ink">Loading GitLab connection…</div>;
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredProjects = query
    ? projects.filter((p) => `${p.pathWithNamespace} ${p.description ?? ''}`.toLowerCase().includes(query))
    : projects;

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      {!status.connected ? (
        <form onSubmit={handleConnect}>
          <div className="mb-2 text-sm font-bold text-[#E8ECF4]">Connect GitLab</div>
          <p className="mb-3 text-xs leading-relaxed text-muted-on-ink">
            Paste a Personal Access Token with <code>read_repository</code> scope. Create one at{' '}
            <a
              href="https://gitlab.com/-/user_settings/personal_access_tokens"
              target="_blank"
              rel="noreferrer"
              className="text-cobalt underline"
            >
              gitlab.com/-/user_settings/personal_access_tokens
            </a>
            .
          </p>
          <div className="flex gap-2">
            <PasswordInput
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="glpat-…"
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

          {loadingProjects && <div className="text-xs text-muted-on-ink">Loading projects…</div>}

          {!loadingProjects && projects.length === 0 && (
            <div className="text-xs text-muted-on-ink">No projects found for this token.</div>
          )}

          {!loadingProjects && projects.length > 0 && (
            <>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects…"
                className="mb-2 w-full rounded-md border border-ink-line bg-ink px-3 py-1.5 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink"
              />
              {filteredProjects.length === 0 && (
                <div className="text-xs text-muted-on-ink">No projects match &ldquo;{searchQuery}&rdquo;.</div>
              )}
              <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {filteredProjects.map((project) => (
                <div key={project.id} className="rounded-md border border-ink-line bg-ink px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[13px] text-[#E8ECF4]">
                          {project.pathWithNamespace}
                        </span>
                        {project.private && (
                          <span className="shrink-0 rounded bg-ink-line px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-on-ink uppercase">
                            Private
                          </span>
                        )}
                      </div>
                      {project.description && (
                        <div className="truncate text-xs text-muted-on-ink">{project.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const opening = mrFormProject !== project.id;
                        setMrFormProject(opening ? project.id : null);
                        if (opening) {
                          setMrIid('');
                          loadMrs(project);
                        }
                      }}
                      className="shrink-0 cursor-pointer rounded-md border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink hover:text-[#E8ECF4]"
                    >
                      Review MR
                    </button>
                    <button
                      onClick={() => handleScan(project)}
                      disabled={scanningProject !== null}
                      className="shrink-0 cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
                    >
                      {scanningProject === project.id ? 'Starting…' : 'Scan'}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2 border-t border-ink-line pt-2">
                    <label htmlFor={`branch-${project.id}`} className="text-xs text-muted-on-ink">
                      Branch
                    </label>
                    <select
                      id={`branch-${project.id}`}
                      value={selectedBranch[project.id] ?? project.defaultBranch}
                      onFocus={() => loadBranches(project)}
                      onChange={(e) =>
                        setSelectedBranch((prev) => ({ ...prev, [project.id]: e.target.value }))
                      }
                      className="max-w-[160px] rounded-md border border-ink-line bg-ink-soft px-2 py-1 font-mono text-[12px] text-[#E8ECF4] outline-none"
                    >
                      {(branchesByProject[project.id] ?? [project.defaultBranch]).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {loadingBranches === project.id && (
                      <span className="text-xs text-muted-on-ink">Loading branches…</span>
                    )}
                  </div>

                  {mrFormProject === project.id && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-ink-line pt-2">
                      {loadingMrs === project.id && (
                        <span className="text-xs text-muted-on-ink">Loading open merge requests…</span>
                      )}
                      {loadingMrs !== project.id && (mrsByProject[project.id]?.length ?? 0) === 0 && (
                        <span className="text-xs text-muted-on-ink">No open merge requests on this project.</span>
                      )}
                      {loadingMrs !== project.id && (mrsByProject[project.id]?.length ?? 0) > 0 && (
                        <>
                          <select
                            value={mrIid}
                            onChange={(e) => setMrIid(e.target.value)}
                            className="max-w-[260px] rounded-md border border-ink-line bg-ink-soft px-2 py-1 font-mono text-[12px] text-[#E8ECF4] outline-none"
                          >
                            {mrsByProject[project.id].map((mr) => (
                              <option key={mr.iid} value={mr.iid}>
                                !{mr.iid} {mr.title} ({mr.sourceBranch} → {mr.targetBranch}){mr.draft ? ' [draft]' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleReviewMr(project)}
                            disabled={reviewingMr !== null}
                            className="cursor-pointer rounded-md bg-cobalt px-3 py-1 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
                          >
                            {reviewingMr === project.id ? 'Starting…' : 'Review'}
                          </button>
                          <span className="text-xs text-muted-on-ink">
                            Scopes the review to the diff, then posts inline discussions, a summary note, and a
                            commit status check directly on the MR.
                          </span>
                        </>
                      )}
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
