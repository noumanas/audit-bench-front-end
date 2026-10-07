'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { startRepositoryScan, ApiError } from '@/lib/api';
import { usePollScan } from '@/lib/usePollScan';
import { RepositoryReport } from '@/components/RepositoryReport';
import { UsageStrip } from '@/components/UsageStrip';
import { RequireAuth } from '@/components/RequireAuth';
import { GitHostPanel } from '@/components/GitHostPanel';
import { IntegrationsPanel } from '@/components/IntegrationsPanel';
import { PageHeader } from '@/components/PageHeader';
import { GithubLogoIcon, GitlabLogoIcon, PlugIcon, UploadCloudIcon } from '@/components/icons';

type Source = 'github' | 'gitlab' | 'upload' | 'integrations';

const SOURCES: Array<{
  key: Source;
  label: string;
  icon: (p: { className?: string }) => React.ReactElement;
  hint: string;
}> = [
  { key: 'github', label: 'GitHub', icon: GithubLogoIcon, hint: 'Scan a branch or review a pull request' },
  { key: 'gitlab', label: 'GitLab', icon: GitlabLogoIcon, hint: 'Scan a branch or review a merge request' },
  { key: 'upload', label: 'Upload .zip', icon: UploadCloudIcon, hint: 'Any codebase, no git host needed' },
  { key: 'integrations', label: 'Integrations', icon: PlugIcon, hint: 'Webhooks, CI and README badge' },
];

function isSource(value: string | null): value is Source {
  return SOURCES.some((s) => s.key === value);
}

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function RepositoryPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <RepositoryPageInner />
      </Suspense>
    </RequireAuth>
  );
}

function RepositoryPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get('source');
  // The URL decides the source, so sidebar links, Back and shared links agree.
  // GitHub is the default: it's the most common way in.
  const source: Source = isSource(requested) ? requested : 'github';

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [usageRefresh, setUsageRefresh] = useState(0);
  const { scan, error: pollError } = usePollScan(scanId);
  const reportRef = useRef<HTMLDivElement>(null);

  // Bring the new report into view as soon as it exists, so starting a scan
  // from far down a repository list doesn't look like nothing happened.
  useEffect(() => {
    if (scanId) reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scanId]);

  const scanStarted = (id: string) => {
    setScanId(id);
    setUsageRefresh((n) => n + 1);
  };

  const handleUpload = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setNeedsUpgrade(false);
    try {
      const job = await startRepositoryScan(file);
      scanStarted(job.id);
    } catch (err) {
      setNeedsUpgrade(err instanceof ApiError && (err.status === 429 || err.status === 403));
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const acceptFile = (picked: File | undefined) => {
    if (!picked) return;
    if (!picked.name.toLowerCase().endsWith('.zip')) {
      setError('Only .zip archives are supported. Zip the project folder and try again.');
      return;
    }
    setError(null);
    setFile(picked);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        kicker="Repository scan"
        title="Scan a codebase"
        description="Scan a whole repository, or review one pull/merge request scoped to its changed lines. Free local checks run on every file; AI reviews only the risky code."
      />

      <UsageStrip planHref="/app/dashboard?tab=plan" refreshKey={usageRefresh} />

      <nav role="tablist" aria-label="Where is the code?" className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          const active = source === s.key;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={active}
              onClick={() => router.push(`${pathname}?source=${s.key}`, { scroll: false })}
              className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                active ? 'border-cobalt bg-cobalt/10' : 'border-ink-line bg-ink-soft hover:border-muted-on-ink'
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-cobalt' : 'text-muted-on-ink'}`} />
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${active ? 'text-[#E8ECF4]' : 'text-[#C9CED8]'}`}>
                  {s.label}
                </span>
                <span className="block text-[11px] leading-snug text-muted-on-ink">{s.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mb-8">
        {source === 'github' && <GitHostPanel host="github" onScanStarted={scanStarted} />}
        {source === 'gitlab' && <GitHostPanel host="gitlab" onScanStarted={scanStarted} />}
        {source === 'integrations' && <IntegrationsPanel />}

        {source === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={`shadow-panel rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? 'border-cobalt bg-cobalt/10' : 'border-ink-line bg-ink-soft'
            }`}
          >
            <UploadCloudIcon className={`mx-auto mb-3 h-9 w-9 ${dragging ? 'text-cobalt' : 'text-muted-on-ink'}`} />
            {file ? (
              <div className="mb-4 inline-flex items-center gap-3 rounded-md border border-ink-line bg-ink px-3 py-2">
                <span className="font-mono text-sm text-[#E8ECF4]">{file.name}</span>
                <span className="text-[12px] text-muted-on-ink">{formatBytes(file.size)}</span>
                <button
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                  className="cursor-pointer text-muted-on-ink hover:text-[#E8ECF4]"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <p className="mb-1 text-sm text-[#E8ECF4]">
                  Drop a .zip of the project here, or{' '}
                  <label className="cursor-pointer font-semibold text-cobalt hover:underline">
                    choose a file
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => acceptFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="mb-4 text-[12px] text-muted-on-ink">
                  Include the lockfile (package-lock.json, requirements.txt) so dependencies can be checked. Leave out
                  node_modules and build folders.
                </p>
              </>
            )}
            <div>
              <button
                onClick={handleUpload}
                disabled={submitting || !file}
                className="cursor-pointer rounded-lg bg-cobalt px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? 'Uploading…' : 'Scan this archive'}
              </button>
            </div>
          </div>
        )}
      </div>

      {(error || pollError) && (
        <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
          {error || pollError}
          {needsUpgrade && (
            <>
              {' '}
              <Link href="/app/dashboard?tab=plan" className="font-semibold underline">
                See plans
              </Link>
            </>
          )}
        </div>
      )}

      <div ref={reportRef} className="scroll-mt-6">
        {scan && <RepositoryReport scan={scan} />}
      </div>
    </div>
  );
}
