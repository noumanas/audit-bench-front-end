'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ApiError,
  connectGithub,
  connectGitlab,
  disconnectGithub,
  disconnectGitlab,
  getGithubStatus,
  getGitlabStatus,
  listGithubBranches,
  listGithubPulls,
  listGithubRepos,
  listGitlabBranches,
  listGitlabMergeRequests,
  listGitlabProjects,
  reviewGithubPr,
  reviewGitlabMr,
  scanGithubRepo,
  scanGitlabProject,
} from '@/lib/api';
import { formatDateTime, timeAgo } from '@/lib/time';
import { PasswordInput } from './PasswordInput';
import { GitBranchIcon, GithubLogoIcon, GitlabLogoIcon } from './icons';

/** Host-neutral shapes so GitHub and GitLab share one UI. */
interface RepoItem {
  key: string;
  fullName: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  url: string;
  scan: (ref: string) => Promise<{ id: string }>;
  review: (number: number) => Promise<{ id: string }>;
  branches: () => Promise<string[]>;
  changes: () => Promise<ChangeItem[]>;
}

interface ChangeItem {
  number: number;
  title: string;
  from: string;
  to: string;
  draft: boolean;
  updatedAt: string;
  url: string;
}

interface HostConfig {
  name: string;
  repoNoun: string;
  repoPlural: string;
  changePlural: string;
  changeNoun: string;
  changeShort: string;
  prefix: string;
  icon: (p: { className?: string }) => React.ReactElement;
  tokenPlaceholder: string;
  tokenHelp: React.ReactNode;
  getStatus: () => Promise<{ connected: boolean; username: string | null }>;
  connect: (token: string) => Promise<unknown>;
  disconnect: () => Promise<void>;
  listRepos: () => Promise<RepoItem[]>;
}

const HOSTS: Record<'github' | 'gitlab', HostConfig> = {
  github: {
    name: 'GitHub',
    repoNoun: 'repository',
    repoPlural: 'repositories',
    changePlural: 'pull requests',
    changeNoun: 'pull request',
    changeShort: 'PR',
    prefix: '#',
    icon: GithubLogoIcon,
    tokenPlaceholder: 'ghp_…',
    tokenHelp: (
      <>
        A classic token with <code>repo</code> scope, or a fine-grained token with <em>Contents: Read-only</em>. To post
        review comments and commit fixes, also allow write access to contents and pull requests.{' '}
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=audit-bench"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cobalt hover:underline"
        >
          Create a GitHub token
        </a>
      </>
    ),
    getStatus: getGithubStatus,
    connect: connectGithub,
    disconnect: disconnectGithub,
    listRepos: async () =>
      (await listGithubRepos()).map((r) => ({
        key: String(r.id),
        fullName: r.fullName,
        description: r.description,
        private: r.private,
        defaultBranch: r.defaultBranch,
        updatedAt: r.updatedAt,
        url: r.htmlUrl,
        scan: (ref) => scanGithubRepo(r.owner, r.name, ref),
        review: (n) => reviewGithubPr(r.owner, r.name, n),
        branches: () => listGithubBranches(r.owner, r.name),
        changes: async () =>
          (await listGithubPulls(r.owner, r.name)).map((p) => ({
            number: p.number,
            title: p.title,
            from: p.headRef,
            to: p.baseRef,
            draft: p.draft,
            updatedAt: p.updatedAt,
            url: p.htmlUrl,
          })),
      })),
  },
  gitlab: {
    name: 'GitLab',
    repoNoun: 'project',
    repoPlural: 'projects',
    changePlural: 'merge requests',
    changeNoun: 'merge request',
    changeShort: 'MR',
    prefix: '!',
    icon: GitlabLogoIcon,
    tokenPlaceholder: 'glpat-…',
    tokenHelp: (
      <>
        A personal access token with <code>read_repository</code> scope (add <code>api</code> to post review comments
        and commit fixes).{' '}
        <a
          href="https://gitlab.com/-/user_settings/personal_access_tokens"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cobalt hover:underline"
        >
          Create a GitLab token
        </a>
      </>
    ),
    getStatus: getGitlabStatus,
    connect: connectGitlab,
    disconnect: disconnectGitlab,
    listRepos: async () =>
      (await listGitlabProjects()).map((p) => ({
        key: String(p.id),
        fullName: p.pathWithNamespace,
        description: p.description,
        private: p.private,
        defaultBranch: p.defaultBranch,
        updatedAt: p.updatedAt,
        url: p.webUrl,
        scan: (ref) => scanGitlabProject(p.id, ref, p.pathWithNamespace),
        review: (n) => reviewGitlabMr(p.id, n, p.pathWithNamespace),
        branches: () => listGitlabBranches(p.id),
        changes: async () =>
          (await listGitlabMergeRequests(p.id)).map((m) => ({
            number: m.iid,
            title: m.title,
            from: m.sourceBranch,
            to: m.targetBranch,
            draft: m.draft,
            updatedAt: m.updatedAt,
            url: m.webUrl,
          })),
      })),
  },
};

type Failure = { message: string; upgrade: boolean };

/** The saved token stopped working (expired or revoked) — see backend common/git-host-errors.ts. */
function isTokenRejected(err: unknown): boolean {
  return err instanceof ApiError && err.scope === 'git_token_rejected';
}

function toFailure(err: unknown, fallback: string): Failure {
  return {
    message: err instanceof Error ? err.message : fallback,
    // 429 = a plan limit was reached, 403 = the plan excludes this — both are fixed by upgrading.
    upgrade: err instanceof ApiError && (err.status === 429 || err.status === 403),
  };
}

export function GitHostPanel({
  host,
  onScanStarted,
}: {
  host: 'github' | 'gitlab';
  onScanStarted: (scanId: string) => void;
}) {
  const cfg = HOSTS[host];
  const [status, setStatus] = useState<{ connected: boolean; username: string | null } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [repos, setRepos] = useState<RepoItem[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [failure, setFailure] = useState<Failure | null>(null);
  const [tokenRejected, setTokenRejected] = useState(false);
  // Stable so RepoDetail's fetch effect doesn't re-run on every render.
  const markTokenRejected = useCallback(() => setTokenRejected(true), []);

  // Plain promise chain (no synchronous setState) so it can run straight from an effect.
  const load = useCallback(
    () =>
      cfg
        .getStatus()
        .then(async (s) => {
          setStatus(s);
          if (s.connected) {
            const list = await cfg.listRepos();
            setRepos(list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
          }
        })
        .catch((err) =>
          isTokenRejected(err)
            ? setTokenRejected(true)
            : setStatusError(err instanceof Error ? err.message : `Couldn't reach ${cfg.name}.`),
        ),
    [cfg],
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (repos ?? []).filter((r) => !q || `${r.fullName} ${r.description ?? ''}`.toLowerCase().includes(q));
  }, [repos, query]);
  const selected = repos?.find((r) => r.key === selectedKey) ?? null;

  if (statusError) {
    return (
      <div className="rounded-lg border border-critical/40 bg-critical/10 p-4 text-[13px] text-[#F3B7BF]">
        {statusError}{' '}
        <button
          onClick={() => {
            setStatusError(null);
            void load();
          }}
          className="cursor-pointer font-semibold underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!status && !tokenRejected) return <PanelSkeleton />;

  // Not connected, or connected with a token GitHub/GitLab now refuses:
  // either way the fix is pasting a token, so show the form (connecting
  // again replaces the saved token).
  if (tokenRejected || !status?.connected) {
    return (
      <ConnectCard
        cfg={cfg}
        expiredFor={tokenRejected ? (status?.username ?? null) : undefined}
        onConnected={() => {
          setTokenRejected(false);
          setFailure(null);
          setSelectedKey(null);
          setRepos(null);
          void load();
        }}
      />
    );
  }

  const Icon = cfg.icon;

  return (
    <div className="shadow-panel overflow-hidden rounded-lg border border-ink-line bg-ink-soft">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-line px-4 py-3">
        <Icon className="h-4 w-4 text-muted-on-ink" />
        <span className="text-sm text-[#E8ECF4]">
          Connected as <span className="font-bold">@{status.username}</span>
        </span>
        {repos && (
          <span className="text-[12px] text-muted-on-ink">
            · {repos.length} {repos.length === 1 ? cfg.repoNoun : cfg.repoPlural}
          </span>
        )}
        <button
          onClick={async () => {
            if (!window.confirm(`Disconnect ${cfg.name}? Your past scans stay; you'll need a token to scan again.`))
              return;
            try {
              await cfg.disconnect();
              setStatus({ connected: false, username: null });
              setRepos(null);
              setSelectedKey(null);
            } catch (err) {
              setFailure(toFailure(err, 'Failed to disconnect.'));
            }
          }}
          className="ml-auto cursor-pointer text-[12px] font-medium text-muted-on-ink hover:text-[#E8ECF4]"
        >
          Disconnect
        </button>
      </div>

      {failure && <FailureNote failure={failure} onDismiss={() => setFailure(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Repository list */}
        <div className={`border-ink-line md:border-r ${selected ? 'hidden md:block' : ''}`}>
          <div className="border-b border-ink-line p-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${cfg.repoPlural}…`}
              aria-label={`Search ${cfg.repoPlural}`}
              className="w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto" role="listbox" aria-label={`${cfg.name} ${cfg.repoPlural}`}>
            {repos === null && <RowSkeleton count={6} />}
            {repos?.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-muted-on-ink">
                No {cfg.repoPlural} found for this token. Check its scopes, or that it belongs to the right account.
              </p>
            )}
            {repos && repos.length > 0 && filtered.length === 0 && (
              <p className="px-4 py-6 text-[13px] text-muted-on-ink">
                No {cfg.repoPlural} match &ldquo;{query}&rdquo;.
              </p>
            )}
            {filtered.map((r) => {
              const active = r.key === selectedKey;
              return (
                <button
                  key={r.key}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setSelectedKey(r.key);
                    setFailure(null);
                  }}
                  className={`block w-full cursor-pointer border-b border-l-2 border-b-ink-line px-4 py-2.5 text-left last:border-b-0 ${
                    active ? 'border-l-cobalt bg-ink-line/60' : 'border-l-transparent hover:bg-ink-line/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-[13px] text-[#E8ECF4]">{r.fullName}</span>
                    {r.private && (
                      <span className="shrink-0 rounded bg-ink-line px-1.5 py-px font-mono text-[9px] font-bold text-muted-on-ink uppercase">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[11px] text-muted-on-ink">
                    <span className="min-w-0 flex-1 truncate">{r.description || 'No description'}</span>
                    <span className="shrink-0" title={formatDateTime(r.updatedAt)}>
                      {timeAgo(r.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected repository */}
        <div className={selected ? '' : 'hidden md:block'}>
          {selected ? (
            <RepoDetail
              key={selected.key}
              repo={selected}
              cfg={cfg}
              onBack={() => setSelectedKey(null)}
              onStarted={onScanStarted}
              onFailure={setFailure}
              onTokenRejected={markTokenRejected}
            />
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
              <GitBranchIcon className="mb-3 h-7 w-7 text-muted-on-ink" />
              <p className="text-sm font-semibold text-[#E8ECF4]">Pick a {cfg.repoNoun}</p>
              <p className="mt-1 max-w-[34ch] text-[12px] text-muted-on-ink">
                Scan a whole branch, or review one open {cfg.changeNoun} with comments posted back on {cfg.name}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RepoDetail({
  repo,
  cfg,
  onBack,
  onStarted,
  onFailure,
  onTokenRejected,
}: {
  repo: RepoItem;
  cfg: HostConfig;
  onBack: () => void;
  onStarted: (id: string) => void;
  onFailure: (f: Failure | null) => void;
  onTokenRejected: () => void;
}) {
  const [branches, setBranches] = useState<string[] | null>(null);
  const [branch, setBranch] = useState(repo.defaultBranch);
  const [changes, setChanges] = useState<ChangeItem[] | null>(null);
  const [changesError, setChangesError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo
      .branches()
      .then((b) => !cancelled && setBranches(b.length ? b : [repo.defaultBranch]))
      .catch(() => !cancelled && setBranches([repo.defaultBranch]));
    repo
      .changes()
      .then((c) => !cancelled && setChanges(c))
      .catch((err) => {
        if (cancelled) return;
        if (isTokenRejected(err)) onTokenRejected();
        else setChangesError(err instanceof Error ? err.message : `Couldn't load ${cfg.changePlural}.`);
      });
    return () => {
      cancelled = true;
    };
  }, [repo, cfg.changePlural, onTokenRejected]);

  const start = async (key: string, fn: () => Promise<{ id: string }>) => {
    setStarting(key);
    onFailure(null);
    try {
      const job = await fn();
      onStarted(job.id);
    } catch (err) {
      if (isTokenRejected(err)) onTokenRejected();
      else onFailure(toFailure(err, 'Failed to start.'));
    } finally {
      setStarting(null);
    }
  };

  const openChanges = changes?.filter((c) => !c.draft) ?? [];
  const drafts = changes?.filter((c) => c.draft) ?? [];

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-3 cursor-pointer text-[12px] text-cobalt hover:underline md:hidden">
        ← All {cfg.repoPlural}
      </button>

      <div className="mb-4 flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-mono text-[15px] font-bold text-[#E8ECF4]">{repo.fullName}</h3>
          {repo.description && <p className="mt-0.5 text-[12px] text-muted-on-ink">{repo.description}</p>}
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[12px] text-muted-on-ink hover:text-[#E8ECF4]"
        >
          Open on {cfg.name} ↗
        </a>
      </div>

      <section className="mb-4 rounded-lg border border-ink-line bg-ink p-4">
        <h4 className="text-sm font-bold text-[#E8ECF4]">Scan the full {cfg.repoNoun}</h4>
        <p className="mt-0.5 mb-3 text-[12px] text-muted-on-ink">
          Secrets, vulnerable dependencies, licenses, dead code and duplicates, plus an AI review of the riskiest files.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] text-muted-on-ink">
            Branch
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={branches === null}
              className="max-w-[220px] rounded-md border border-ink-line bg-ink-soft px-2.5 py-1.5 font-mono text-[12px] text-[#E8ECF4] outline-none focus:border-cobalt disabled:opacity-60"
            >
              {(branches ?? [repo.defaultBranch]).map((b) => (
                <option key={b} value={b}>
                  {b}
                  {b === repo.defaultBranch ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => start('scan', () => repo.scan(branch))}
            disabled={starting !== null}
            className="ml-auto cursor-pointer rounded-md bg-cobalt px-4 py-1.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {starting === 'scan' ? 'Starting…' : `Scan ${branch}`}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-ink-line bg-ink p-4">
        <h4 className="text-sm font-bold text-[#E8ECF4]">
          Review a {cfg.changeNoun}
          {changes && changes.length > 0 && (
            <span className="ml-2 rounded-full bg-ink-line px-1.5 py-0.5 font-mono text-[10px] text-muted-on-ink">
              {changes.length} open
            </span>
          )}
        </h4>
        <p className="mt-0.5 mb-3 text-[12px] text-muted-on-ink">
          Reviews only the changed lines, then posts inline comments, a summary and a pass/fail status check on the{' '}
          {cfg.changeShort}.
        </p>

        {changes === null && !changesError && <RowSkeleton count={2} />}
        {changesError && <p className="text-[12px] text-[#F3B7BF]">{changesError}</p>}
        {changes?.length === 0 && (
          <p className="text-[12px] text-muted-on-ink">
            No open {cfg.changePlural} on this {cfg.repoNoun}.
          </p>
        )}

        {changes && changes.length > 0 && (
          <ul className="divide-y divide-ink-line overflow-hidden rounded-md border border-ink-line">
            {[...openChanges, ...drafts].map((c) => (
              <li key={c.number} className="flex items-center gap-3 bg-ink-soft px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-mono text-[12px] text-muted-on-ink">
                      {cfg.prefix}
                      {c.number}
                    </span>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-[13px] font-semibold text-[#E8ECF4] hover:underline"
                      title={c.title}
                    >
                      {c.title}
                    </a>
                    {c.draft && (
                      <span className="shrink-0 rounded border border-ink-line px-1.5 py-px font-mono text-[9px] text-muted-on-ink uppercase">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-on-ink">
                    {c.from} → {c.to} · <span title={formatDateTime(c.updatedAt)}>updated {timeAgo(c.updatedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => start(`review-${c.number}`, () => repo.review(c.number))}
                  disabled={starting !== null}
                  className="shrink-0 cursor-pointer rounded-md border border-cobalt px-3 py-1 text-[12px] font-bold text-cobalt hover:bg-cobalt hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  {starting === `review-${c.number}` ? 'Starting…' : 'Review'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ConnectCard({
  cfg,
  onConnected,
  expiredFor,
}: {
  cfg: HostConfig;
  onConnected: () => void;
  /** Set when the saved token was rejected: the username it belonged to (null if unknown). */
  expiredFor?: string | null;
}) {
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = cfg.icon;

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setConnecting(true);
        setError(null);
        try {
          await cfg.connect(token.trim());
          setToken('');
          onConnected();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to connect.');
        } finally {
          setConnecting(false);
        }
      }}
      className="shadow-panel rounded-lg border border-ink-line bg-ink-soft p-5"
    >
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#E8ECF4]" />
        <h3 className="text-base font-bold text-[#E8ECF4]">
          {expiredFor !== undefined ? `Reconnect ${cfg.name}` : `Connect ${cfg.name}`}
        </h3>
      </div>
      {expiredFor !== undefined && (
        <div className="mb-4 rounded-md border border-high/40 bg-high/10 px-3.5 py-2.5 text-[13px] text-[#F0CE9A]">
          {cfg.name} rejected the saved token{expiredFor ? ` for @${expiredFor}` : ''}. It has expired or been revoked.
          Create a new token and paste it below; it replaces the old one. Your past scans are kept.
        </div>
      )}
      <p className="mb-4 max-w-[70ch] text-[13px] leading-relaxed text-muted-on-ink">
        Paste a personal access token to list your {cfg.repoPlural}, scan any branch and review {cfg.changePlural}.
        Tokens are stored encrypted, and the code is never run.
      </p>
      <div className="flex flex-wrap gap-2">
        <PasswordInput
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={cfg.tokenPlaceholder}
          aria-label={`${cfg.name} personal access token`}
          wrapperClassName="min-w-[240px] flex-1"
          className="w-full rounded-md border border-ink-line bg-ink px-3 py-2 font-mono text-[13px] text-[#E8ECF4] outline-none focus:border-cobalt"
        />
        <button
          type="submit"
          disabled={connecting || !token.trim()}
          className="cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {connecting ? 'Connecting…' : expiredFor !== undefined ? 'Save new token' : `Connect ${cfg.name}`}
        </button>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-on-ink">{cfg.tokenHelp}</p>
      {error && (
        <div className="mt-3 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-[12px] text-[#F3B7BF]">
          {error}
        </div>
      )}
    </form>
  );
}

function FailureNote({ failure, onDismiss }: { failure: Failure; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 border-b border-critical/30 bg-critical/10 px-4 py-2.5 text-[13px] text-[#F3B7BF]">
      <span className="flex-1">
        {failure.message}
        {failure.upgrade && (
          <>
            {' '}
            <Link href="/app/dashboard?tab=plan" className="font-semibold underline">
              See plans
            </Link>
          </>
        )}
      </span>
      <button onClick={onDismiss} aria-label="Dismiss" className="cursor-pointer text-[#F3B7BF] hover:text-white">
        ×
      </button>
    </div>
  );
}

function RowSkeleton({ count }: { count: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-b border-ink-line px-4 py-3 last:border-b-0">
          <div className="mb-1.5 h-3 w-1/2 animate-pulse rounded bg-ink-line" />
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-ink-line" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div
      className="h-[320px] animate-pulse rounded-lg border border-ink-line bg-ink-soft"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
