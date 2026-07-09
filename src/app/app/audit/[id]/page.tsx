'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAudit } from '@/lib/api';
import { Audit } from '@/lib/types';
import { AuditReport } from '@/components/AuditReport';
import { RequireAuth } from '@/components/RequireAuth';

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAudit(id)
      .then(setAudit)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load audit.'));
  }, [id]);

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-60px)] bg-paper px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <Link href="/app/dashboard" className="mb-4 inline-block text-sm text-cobalt">
            ← Back to dashboard
          </Link>

          {error && (
            <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-critical">
              {error}
            </div>
          )}

          {audit && (
            <>
              <div className="mb-1 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
                Findings report
              </div>
              <h1 className="mb-5 font-mono text-lg font-bold text-[#1C2128]">{audit.filename}</h1>
              <AuditReport audit={audit} />
            </>
          )}

          {!audit && !error && <div className="text-sm text-muted-on-paper">Loading…</div>}
        </div>
      </div>
    </RequireAuth>
  );
}
