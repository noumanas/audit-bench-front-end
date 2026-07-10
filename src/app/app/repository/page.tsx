'use client';

import { useState } from 'react';
import Link from 'next/link';
import { startRepositoryScan, ApiError } from '@/lib/api';
import { usePollScan } from '@/lib/usePollScan';
import { RepositoryReport } from '@/components/RepositoryReport';
import { UsageBar } from '@/components/UsageBar';
import { RequireAuth } from '@/components/RequireAuth';
import { GithubPanel } from '@/components/GithubPanel';
import { GitlabPanel } from '@/components/GitlabPanel';

type Source = 'upload' | 'github' | 'gitlab';

export default function RepositoryPage() {
  const [source, setSource] = useState<Source>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [usageRefresh, setUsageRefresh] = useState(0);
  const { scan, error: pollError } = usePollScan(scanId);

  const handleUpload = async () => {
    if (!file) {
      setError('Choose a .zip archive of the repository first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setNeedsUpgrade(false);
    setScanId(null);
    try {
      const job = await startRepositoryScan(file);
      setScanId(job.id);
      setUsageRefresh((n) => n + 1);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
        setNeedsUpgrade(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoteScanStarted = (id: string) => {
    setScanId(id);
    setUsageRefresh((n) => n + 1);
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="mb-1 text-xl font-bold text-[#E8ECF4]">Repository scan</h1>
        <p className="mb-4 text-sm text-muted-on-ink">
          Upload a .zip, scan a full repo from GitHub or GitLab, or review a single pull/merge
          request scoped to just the changed lines. We detect the framework, map the dependency
          graph, flag dead code and duplicates, scan for hardcoded secrets, and run an AI review on
          the most relevant files.
        </p>

        <div className="mb-6">
          <UsageBar refreshKey={usageRefresh} />
        </div>

        <div className="mb-4 flex gap-2">
          <TabButton active={source === 'upload'} onClick={() => setSource('upload')}>
            Upload .zip
          </TabButton>
          <TabButton active={source === 'github'} onClick={() => setSource('github')}>
            From GitHub
          </TabButton>
          <TabButton active={source === 'gitlab'} onClick={() => setSource('gitlab')}>
            From GitLab
          </TabButton>
        </div>

        {source === 'upload' && (
          <div className="mb-6 flex flex-col items-stretch gap-3 rounded-lg border border-ink-line bg-ink-soft p-4 sm:flex-row sm:items-center">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-sm text-muted-on-ink file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-cobalt file:px-3 file:py-1.5 file:text-white"
            />
            <button
              onClick={handleUpload}
              disabled={submitting}
              className="cursor-pointer rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? 'Uploading…' : 'Scan repository'}
            </button>
          </div>
        )}

        {source === 'github' && (
          <div className="mb-6">
            <GithubPanel onScanStarted={handleRemoteScanStarted} />
          </div>
        )}

        {source === 'gitlab' && (
          <div className="mb-6">
            <GitlabPanel onScanStarted={handleRemoteScanStarted} />
          </div>
        )}

        {(error || pollError) && (
          <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error || pollError}
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

        {scan && <RepositoryReport scan={scan} />}
      </div>
    </RequireAuth>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-semibold ${
        active ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink'
      }`}
    >
      {children}
    </button>
  );
}
