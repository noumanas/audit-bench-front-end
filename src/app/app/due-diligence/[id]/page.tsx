'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePollScan } from '@/lib/usePollScan';
import { DueDiligenceReport } from '@/components/DueDiligenceReport';
import { RequireAuth } from '@/components/RequireAuth';

export default function DueDiligenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scan, error, loading } = usePollScan(id);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10 print:px-0 print:py-0">
        <Link href="/app/due-diligence" className="mb-4 inline-block text-sm text-cobalt print:hidden">
          ← Back to due diligence reports
        </Link>

        {error && (
          <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error}
          </div>
        )}

        {loading && !scan && <div className="text-sm text-muted-on-ink">Loading…</div>}

        {scan && scan.status !== 'completed' && (
          <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3 text-sm text-muted-on-ink">
            This scan is still {scan.status} — a due diligence report needs a completed scan to work from.
          </div>
        )}

        {scan && scan.status === 'completed' && <DueDiligenceReport scan={scan} />}
      </div>
    </RequireAuth>
  );
}
