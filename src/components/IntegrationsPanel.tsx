'use client';

import { useEffect, useState } from 'react';
import {
  API_URL,
  createWebhookConfig,
  deleteWebhookConfig,
  getBadgeToken,
  listWebhookConfigs,
  rotateBadgeToken,
} from '@/lib/api';
import { WebhookConfig, WebhookProvider } from '@/lib/types';

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 cursor-pointer rounded-md border border-ink-line px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-muted-on-ink hover:text-[#E8ECF4]"
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}

function BadgeSection() {
  const [token, setToken] = useState<string | null>(null);
  const [repo, setRepo] = useState('');
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    getBadgeToken()
      .then((r) => setToken(r.badgeToken))
      .finally(() => setLoading(false));
  }, []);

  const handleRotate = async () => {
    if (!confirm('Rotate your badge token? The old badge URL will stop working.')) return;
    setRotating(true);
    try {
      const r = await rotateBadgeToken();
      setToken(r.badgeToken);
    } finally {
      setRotating(false);
    }
  };

  const badgeApiUrl = token
    ? `${API_URL}/badge/${token}/verdict${repo.trim() ? `?repo=${encodeURIComponent(repo.trim())}` : ''}`
    : '';
  const imageUrl = badgeApiUrl ? `https://img.shields.io/endpoint?url=${encodeURIComponent(badgeApiUrl)}` : '';
  const markdown = imageUrl ? `[![audit/bench](${imageUrl})](${API_URL})` : '';

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      <h3 className="mb-1 text-sm font-bold text-[#E8ECF4]">README score badge</h3>
      <p className="mb-3 text-xs text-muted-on-ink">
        Shows the verdict of your most recent completed scan. Drop the markdown into your repo's README.
      </p>

      {loading ? (
        <div className="text-xs text-muted-on-ink">Loading…</div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="Optional: scope to owner/repo"
              className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-2.5 py-1.5 text-xs text-[#E8ECF4] outline-none placeholder:text-muted-on-ink/60"
            />
            {imageUrl && <img src={imageUrl} alt="audit/bench badge preview" className="h-5" />}
          </div>

          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-ink-line bg-ink px-2.5 py-1.5 font-mono text-[11px] text-muted-on-ink">
              {markdown}
            </code>
            <CopyButton value={markdown} />
          </div>

          <button
            onClick={handleRotate}
            disabled={rotating}
            className="cursor-pointer text-xs font-medium text-muted-on-ink hover:text-[#E8ECF4] disabled:cursor-wait"
          >
            {rotating ? 'Rotating…' : 'Rotate badge token'}
          </button>
        </div>
      )}
    </div>
  );
}

const PROVIDER_LABEL: Record<WebhookProvider, string> = { github: 'GitHub', gitlab: 'GitLab' };

function WebhookSection() {
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<WebhookProvider>('github');
  const [repoIdentifier, setRepoIdentifier] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<WebhookConfig | null>(null);

  const load = () => {
    setLoading(true);
    listWebhookConfigs()
      .then(setConfigs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load webhooks.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!repoIdentifier.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await createWebhookConfig(provider, repoIdentifier.trim());
      setConfigs((prev) => [created, ...prev]);
      setJustCreated(created);
      setRepoIdentifier('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create webhook.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this webhook config? Replies to @auditbench mentions will stop.')) return;
    await deleteWebhookConfig(id);
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    if (justCreated?.id === id) setJustCreated(null);
  };

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft p-4">
      <h3 className="mb-1 text-sm font-bold text-[#E8ECF4]">Conversational PR/MR chat</h3>
      <p className="mb-3 text-xs text-muted-on-ink">
        Mention <code className="rounded bg-ink px-1 py-0.5 font-mono text-[11px]">@auditbench</code> in a PR or MR
        comment and it'll reply in-thread, using the diff as context.
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
          {error}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as WebhookProvider)}
          className="rounded-md border border-ink-line bg-ink px-2 py-1.5 text-xs text-[#E8ECF4] outline-none"
        >
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
        </select>
        <input
          value={repoIdentifier}
          onChange={(e) => setRepoIdentifier(e.target.value)}
          placeholder={provider === 'github' ? 'owner/repo' : 'GitLab project ID'}
          className="min-w-0 flex-1 rounded-md border border-ink-line bg-ink px-2.5 py-1.5 text-xs text-[#E8ECF4] outline-none placeholder:text-muted-on-ink/60"
        />
        <button
          onClick={handleCreate}
          disabled={creating || !repoIdentifier.trim()}
          className="cursor-pointer rounded-md bg-cobalt px-3 py-1.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-70"
        >
          {creating ? 'Adding…' : 'Add'}
        </button>
      </div>

      {justCreated && (
        <div className="mb-3 rounded-lg border border-cobalt/40 bg-cobalt/10 p-3 text-xs text-muted-on-ink">
          <p className="mb-2 font-semibold text-[#E8ECF4]">
            Webhook created for {justCreated.repoIdentifier} — set this up in{' '}
            {PROVIDER_LABEL[justCreated.provider]} now (the secret below is only shown here):
          </p>
          <SetupInstructions config={justCreated} />
        </div>
      )}

      {loading ? (
        <div className="text-xs text-muted-on-ink">Loading…</div>
      ) : configs.length === 0 ? (
        <div className="rounded-lg border border-ink-line bg-ink px-3 py-2.5 text-xs text-muted-on-ink">
          No webhooks configured yet.
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map((c) => (
            <div key={c.id} className="rounded-lg border border-ink-line bg-ink p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 rounded bg-ink-line px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-muted-on-ink uppercase">
                  {c.provider}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-[#E8ECF4]">{c.repoIdentifier}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 cursor-pointer text-xs font-medium whitespace-nowrap text-critical hover:underline"
                >
                  Remove
                </button>
              </div>
              {justCreated?.id !== c.id && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-on-ink hover:text-[#E8ECF4]">
                    Setup instructions
                  </summary>
                  <div className="mt-2">
                    <SetupInstructions config={c} />
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetupInstructions({ config }: { config: WebhookConfig }) {
  const url = `${API_URL}/webhooks/${config.provider}`;
  return (
    <div className="space-y-2 text-xs">
      <Row label="Payload URL" value={url} />
      <Row label="Secret" value={config.secret} />
      <p className="text-muted-on-ink">
        {config.provider === 'github' ? (
          <>
            In your repo → Settings → Webhooks → Add webhook. Content type{' '}
            <code className="rounded bg-ink-line px-1 py-0.5 font-mono">application/json</code>, paste the secret
            above, and select just the <strong>Issue comments</strong> event.
          </>
        ) : (
          <>
            In your project → Settings → Webhooks. Paste the URL and secret token above, and enable only the{' '}
            <strong>Comments</strong> trigger.
          </>
        )}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-muted-on-ink">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded-md border border-ink-line bg-ink px-2 py-1 font-mono text-[11px] text-[#E8ECF4]">
        {value}
      </code>
      <CopyButton value={value} />
    </div>
  );
}

export function IntegrationsPanel() {
  return (
    <div className="space-y-4">
      <BadgeSection />
      <WebhookSection />
    </div>
  );
}
