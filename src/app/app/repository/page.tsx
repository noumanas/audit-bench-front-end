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
import { IntegrationsPanel } from '@/components/IntegrationsPanel';
import { PageHeader } from '@/components/PageHeader';
import { GitBranchIcon, PlugIcon, UploadCloudIcon } from '@/components/icons';

type Source = 'upload' | 'github' | 'gitlab' | 'integrations';

const TABS: { key: Source; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: 'Upload .zip', icon: <UploadCloudIcon className="h-4 w-4" /> },
  { key: 'github', label: 'From GitHub', icon: <GitBranchIcon className="h-4 w-4" /> },
  { key: 'gitlab', label: 'From GitLab', icon: <GitBranchIcon className="h-4 w-4" /> },
  { key: 'integrations', label: 'Integrations', icon: <PlugIcon className="h-4 w-4" /> },
];

export default function RepositoryPage() {
  const [source, setSource] = useState<Source>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
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

  const acceptDroppedFile = (dropped: File | undefined) => {
    if (!dropped) return;
    if (!dropped.name.toLowerCase().endsWith('.zip')) {
      setError('Only .zip archives are supported.');
      return;
    }
    setError(null);
    setFile(dropped);
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <PageHeader
          kicker="Ingest"
          title="Repository scan"
          description="Upload a .zip, scan a full repo from GitHub or GitLab, or review a single pull/merge request scoped to just the changed lines. We map the dependency graph, flag dead code and duplicates, scan for secrets, and run an AI review on the files that matter."
        />

        <div className="mb-6">
          <UsageBar refreshKey={usageRefresh} />
        </div>

        <div className="shadow-panel mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-ink-line bg-ink-soft p-1">
          {TABS.map((tab) => (
            <TabButton key={tab.key} active={source === tab.key} onClick={() => setSource(tab.key)}>
              {tab.icon}
              {tab.label}
            </TabButton>
          ))}
        </div>

        {source === 'upload' && (
          <div className="mb-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptDroppedFile(e.dataTransfer.files?.[0]);
              }}
              className={`shadow-panel rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragging ? 'border-cobalt bg-cobalt/10' : 'border-ink-line bg-ink-soft'
              }`}
            >
              <UploadCloudIcon
                className={`mx-auto mb-3 h-9 w-9 ${dragging ? 'text-cobalt' : 'text-muted-on-ink'}`}
              />
              {file ? (
                <p className="mb-3 font-mono text-sm text-[#E8ECF4]">{file.name}</p>
              ) : (
                <p className="mb-3 text-sm text-muted-on-ink">
                  Drag a .zip archive here, or{' '}
                  <label className="cursor-pointer font-semibold text-cobalt hover:underline">
                    browse
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => acceptDroppedFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </p>
              )}
              <button
                onClick={handleUpload}
                disabled={submitting || !file}
                className="cursor-pointer rounded-lg bg-cobalt px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? 'Uploading…' : 'Scan repository'}
              </button>
            </div>
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

        {source === 'integrations' && (
          <div className="mb-6">
            <IntegrationsPanel />
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
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? 'bg-cobalt text-white' : 'text-muted-on-ink hover:bg-ink-line hover:text-[#E8ECF4]'
      }`}
    >
      {children}
    </button>
  );
}
