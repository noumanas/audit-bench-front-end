'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  claimGithubInstallation,
  getGithubAppInstallUrl,
  getGithubAppStatus,
  unlinkGithubInstallation,
  updateGithubInstallation,
} from '@/lib/api';
import type { GithubAppStatus, GithubInstallation } from '@/lib/types';
import { GithubLogoIcon } from './icons';

type Notice = { tone: 'good' | 'bad'; text: string } | null;

/**
 * The recommended way to connect GitHub: install the Audit Bench Ai GitHub
 * App. Every pull request on the chosen repositories is then reviewed
 * automatically and answered as the app's bot, with no token or webhook to
 * set up. Hidden until the app exists (see Admin → GitHub App).
 */
export function GithubAppCard() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [status, setStatus] = useState<GithubAppStatus | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const handled = useRef(false);

  // Runs once: load status, and finish what GitHub's redirect asked for.
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const outcome = params.get('githubApp');
    const claimId = Number(params.get('installation'));
    const clearParams = () => router.replace(`${pathname}?source=github`, { scroll: false });

    const load =
      outcome === 'claim' && claimId > 0
        ? claimGithubInstallation(claimId)
            .then((s) => {
              setNotice({ tone: 'good', text: 'GitHub App linked. New pull requests will be reviewed automatically.' });
              return s;
            })
            .catch((err) => {
              setNotice({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not link the installation.' });
              return getGithubAppStatus();
            })
        : getGithubAppStatus().then((s) => {
            if (outcome === 'installed') {
              setNotice({
                tone: 'good',
                text: 'GitHub App installed. New pull requests will be reviewed automatically.',
              });
            } else if (outcome === 'error') {
              setNotice({ tone: 'bad', text: 'Something went wrong finishing the install. Please try again.' });
            }
            return s;
          });
    load
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => {
        if (outcome) clearParams();
      });
  }, [params, pathname, router]);

  const install = useCallback(async () => {
    setBusy('install');
    try {
      const { url } = await getGithubAppInstallUrl();
      window.location.assign(url);
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof Error ? err.message : 'Could not start the install.' });
      setBusy(null);
    }
  }, []);

  const act = async (key: string, fn: () => Promise<GithubAppStatus>) => {
    setBusy(key);
    try {
      setStatus(await fn());
    } catch (err) {
      setNotice({ tone: 'bad', text: err instanceof Error ? err.message : 'That did not work. Please try again.' });
    } finally {
      setBusy(null);
    }
  };

  if (!status?.configured) return null;
  const bot = status.botLogin ? `@${status.botLogin}` : 'the Audit Bench Ai bot';

  return (
    <section className="mb-4 overflow-hidden rounded-lg border border-cobalt/40 bg-ink-soft">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5">
        <GithubLogoIcon className="h-5 w-5 shrink-0 text-[#E8ECF4]" />
        <div className="min-w-[14rem] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#E8ECF4]">Audit Bench Ai GitHub App</h3>
            <span className="rounded-full bg-cobalt/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cobalt uppercase">
              Recommended
            </span>
          </div>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-on-ink">
            Install once and every pull request is reviewed automatically by <span className="font-mono">{bot}</span>:
            inline comments, merge risk and pre-merge checks, plus answers when someone replies. No tokens or webhooks.
          </p>
        </div>
        <button
          onClick={() => void install()}
          disabled={busy !== null}
          className="cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold whitespace-nowrap text-white hover:bg-cobalt-dark disabled:cursor-wait disabled:opacity-60"
        >
          {busy === 'install'
            ? 'Opening GitHub…'
            : status.installations.length
              ? 'Add another account'
              : 'Install on GitHub'}
        </button>
      </div>

      {notice && (
        <p
          role={notice.tone === 'bad' ? 'alert' : 'status'}
          className={`border-t border-ink-line px-4 py-2.5 text-[13px] ${notice.tone === 'good' ? 'text-pass' : 'text-[#F3B7BF]'}`}
        >
          {notice.text}
        </p>
      )}

      {status.installations.length > 0 && (
        <ul className="divide-y divide-ink-line border-t border-ink-line">
          {status.installations.map((inst) => (
            <InstallationRow
              key={inst.id}
              inst={inst}
              busy={busy}
              onToggle={() => void act(`toggle-${inst.id}`, () => updateGithubInstallation(inst.id, !inst.autoReview))}
              onUnlink={() => {
                if (
                  window.confirm(
                    `Stop reviewing @${inst.accountLogin}'s pull requests on this account? To remove the app from GitHub too, uninstall it there.`,
                  )
                ) {
                  void act(`unlink-${inst.id}`, () => unlinkGithubInstallation(inst.id));
                }
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function InstallationRow({
  inst,
  busy,
  onToggle,
  onUnlink,
}: {
  inst: GithubInstallation;
  busy: string | null;
  onToggle: () => void;
  onUnlink: () => void;
}) {
  const manageUrl =
    inst.accountType === 'Organization'
      ? `https://github.com/organizations/${inst.accountLogin}/settings/installations/${inst.id}`
      : `https://github.com/settings/installations/${inst.id}`;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
      <div className="min-w-[14rem] flex-1">
        <span className="font-mono text-[13px] text-[#E8ECF4]">@{inst.accountLogin}</span>
        <span className="ml-2 text-[11px] text-muted-on-ink">
          {inst.accountType === 'Organization' ? 'Organization' : 'Personal account'} ·{' '}
          {inst.repositorySelection === 'all' ? 'all repositories' : 'selected repositories'}
          {inst.suspended && <span className="text-[#F3B7BF]"> · suspended on GitHub</span>}
        </span>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-on-ink">
        <input
          type="checkbox"
          checked={inst.autoReview}
          onChange={onToggle}
          disabled={busy !== null}
          className="h-3.5 w-3.5 accent-cobalt"
        />
        Review new pull requests automatically
      </label>
      <a href={manageUrl} target="_blank" rel="noreferrer" className="text-[12px] text-cobalt hover:underline">
        Choose repositories ↗
      </a>
      <button
        onClick={onUnlink}
        disabled={busy !== null}
        className="cursor-pointer text-[12px] text-muted-on-ink hover:text-[#F3B7BF] disabled:opacity-50"
      >
        Unlink
      </button>
    </li>
  );
}
