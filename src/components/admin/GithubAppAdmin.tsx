'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getGithubAppManifest, getGithubAppStatus } from '@/lib/api';
import type { GithubAppStatus } from '@/lib/types';

/**
 * Super admin: create the Audit Bench Ai GitHub App in one click with
 * GitHub's app-manifest flow. GitHub creates the app, then sends the
 * browser back to the API, which stores its credentials (encrypted) — no
 * environment variables to copy.
 */
export function GithubAppAdmin() {
  const outcome = useSearchParams().get('githubApp');
  const [status, setStatus] = useState<GithubAppStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [org, setOrg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getGithubAppStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load the GitHub App status.'));
  }, []);

  const orgValue = org.trim();
  // A GitHub organization login: letters, digits and single hyphens.
  const orgInvalid = orgValue !== '' && !/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(orgValue);

  const create = async () => {
    if (orgInvalid) return;
    setBusy(true);
    setError(null);
    // If the browser blocks the form (a security policy), say so instead of waiting forever.
    const onBlocked = (e: SecurityPolicyViolationEvent) => {
      if (e.violatedDirective.startsWith('form-action')) {
        setError(
          "Your browser blocked the form to GitHub (the site's security policy). Deploy the latest frontend and try again.",
        );
        setBusy(false);
      }
    };
    document.addEventListener('securitypolicyviolation', onBlocked, { once: true });
    try {
      const { action, manifest } = await getGithubAppManifest(org);
      // GitHub's manifest flow is a form POST to github.com.
      const form = document.createElement('form');
      form.method = 'post';
      form.action = action;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'manifest';
      input.value = manifest;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start creating the app.');
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {outcome === 'created' && (
        <p role="status" className="rounded-lg border border-pass/30 bg-pass/10 px-4 py-3 text-[13px] text-pass">
          The GitHub App was created and its credentials are stored. Users can now install it from Repository scan.
        </p>
      )}
      {outcome === 'error' && (
        <p
          role="alert"
          className="rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-[13px] text-[#F3B7BF]"
        >
          GitHub didn&apos;t finish creating the app (or the link expired). Please try again.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-[13px] text-[#F3B7BF]"
        >
          {error}
        </p>
      )}

      {!status ? (
        <div className="h-32 animate-pulse rounded-lg bg-ink-soft" />
      ) : status.configured ? (
        <section className="rounded-lg border border-ink-line bg-ink-soft p-5">
          <h2 className="text-base font-bold text-[#E8ECF4]">{status.name ?? 'Audit Bench Ai'} is set up</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
            <Fact label="Comments post as" value={status.botLogin ? `@${status.botLogin}` : '—'} mono />
            <Fact label="App slug" value={status.slug ?? '—'} mono />
          </dl>
          <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
            {status.htmlUrl && (
              <a
                href={status.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cobalt hover:underline"
              >
                Public app page ↗
              </a>
            )}
            {status.slug && (
              <a
                href={`https://github.com/settings/apps/${status.slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cobalt hover:underline"
              >
                App settings on GitHub (logo, description) ↗
              </a>
            )}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-muted-on-ink">
            Upload the Audit Bench Ai logo in the app settings so it shows next to every review. Users install the app
            from Repository scan → GitHub.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-ink-line bg-ink-soft p-5">
          <h2 className="text-base font-bold text-[#E8ECF4]">Create the Audit Bench Ai GitHub App</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-on-ink">
            One click creates the app on GitHub with the least access it needs (read code, write pull request reviews
            and comments, write checks for the pass/fail verdict) and events (pull requests, review comments,
            conversation comments, check re-runs). GitHub then sends you back here and the credentials are stored,
            encrypted. Its bot posts reviews as <span className="font-mono">audit-bench-ai[bot]</span> (from the app
            name, which GitHub lets you change on the next screen).
          </p>
          <label className="mt-4 block text-[12px] text-muted-on-ink">
            The GitHub organization that will own the app: its login, as in github.com/<strong>your-org</strong>. Leave
            empty to create it on your personal account. This isn&apos;t the bot&apos;s name; GitHub names the bot from
            the app name on the next screen.
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="organization login, e.g. auditbenchai"
              aria-invalid={orgInvalid}
              className="mt-1.5 block w-full max-w-sm rounded-md border border-ink-line bg-ink px-3 py-2 font-mono text-[13px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
            />
          </label>
          {orgInvalid && (
            <p role="alert" className="mt-1.5 text-[12px] text-[#F3B7BF]">
              That isn&apos;t a GitHub organization login: use only letters, numbers and hyphens, like{' '}
              <span className="font-mono">auditbenchai</span>. Leave it empty for your personal account.
            </p>
          )}
          <button
            onClick={() => void create()}
            disabled={busy || orgInvalid}
            className="mt-4 cursor-pointer rounded-md bg-cobalt px-4 py-2 text-sm font-bold text-white hover:bg-cobalt-dark disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Opening GitHub…' : 'Create the GitHub App'}
          </button>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] text-muted-on-ink">{label}</dt>
      <dd className={`text-[#E8ECF4] ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
