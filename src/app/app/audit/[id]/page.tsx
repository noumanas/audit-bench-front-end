'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAudit, setAuditFindingStatus } from '@/lib/api';
import { Audit, FindingStatus } from '@/lib/types';
import { AuditReport } from '@/components/AuditReport';
import { RequireAuth } from '@/components/RequireAuth';
import { auditToMarkdown } from '@/lib/auditExport';
import { formatDateTime, timeAgo } from '@/lib/time';

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getAudit(id)
      .then(setAudit)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load audit.'));
  }, [id]);

  const handleStatusChange = async (index: number, status: FindingStatus) => {
    if (!audit) return;
    setUpdatingIndex(index);
    // Show the new status straight away; roll back if the save fails.
    const previous = audit;
    setAudit({ ...audit, findingStatuses: { ...(audit.findingStatuses ?? {}), [index]: status } });
    try {
      setAudit(await setAuditFindingStatus(id, index, status));
    } catch (err) {
      setAudit(previous);
      setError(err instanceof Error ? err.message : 'Failed to update finding status.');
    } finally {
      setUpdatingIndex(null);
    }
  };

  const copyMarkdown = async () => {
    if (!audit) return;
    await navigator.clipboard.writeText(auditToMarkdown(audit));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const name = audit && audit.filename !== 'untitled' ? audit.filename : 'Pasted code';

  return (
    <RequireAuth>
      <div className="print-exact min-h-[calc(100vh-60px)] bg-paper px-6 py-8 print:min-h-0 print:p-0">
        <div className="mx-auto max-w-4xl">
          <Link href="/app/dashboard?tab=audits" className="mb-4 inline-block text-sm text-cobalt print:hidden">
            ← All audits
          </Link>

          {error && (
            <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-critical">
              {error}
            </div>
          )}

          {!audit && !error && (
            <div aria-busy="true" aria-label="Loading report">
              <div className="mb-3 h-6 w-1/3 animate-pulse rounded bg-paper-line" />
              <div className="mb-4 h-28 animate-pulse rounded-lg bg-paper-line" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-2.5 h-14 animate-pulse rounded-lg bg-paper-line" />
              ))}
            </div>
          )}

          {audit && (
            <>
              <header className="mb-5 flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 font-mono text-[12px] tracking-wide text-muted-on-paper uppercase">
                    Code review report
                  </div>
                  <h1
                    className={`truncate font-mono text-xl font-bold text-[#1C2128] ${name === 'Pasted code' ? 'italic' : ''}`}
                  >
                    {name}
                  </h1>
                  <p className="mt-1 text-[12px] text-muted-on-paper">
                    {[audit.language, `${audit.codeSize.toLocaleString()} characters`, `AI: ${audit.provider}`]
                      .filter(Boolean)
                      .join(' · ')}{' '}
                    · <span title={formatDateTime(audit.createdAt)}>{timeAgo(audit.createdAt)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 whitespace-nowrap print:hidden">
                  <button
                    onClick={copyMarkdown}
                    className="cursor-pointer rounded-md border border-paper-line bg-paper-card px-3 py-1.5 text-[13px] font-semibold text-[#1C2128] hover:border-muted-on-paper"
                  >
                    {copied ? 'Copied' : 'Copy as Markdown'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="cursor-pointer rounded-md border border-paper-line bg-paper-card px-3 py-1.5 text-[13px] font-semibold text-[#1C2128] hover:border-muted-on-paper"
                  >
                    Print / PDF
                  </button>
                  <Link href="/app" className="rounded-md bg-cobalt px-3 py-1.5 text-[13px] font-bold text-white">
                    New audit
                  </Link>
                </div>
              </header>
              <AuditReport audit={audit} onStatusChange={handleStatusChange} updatingIndex={updatingIndex} />
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
