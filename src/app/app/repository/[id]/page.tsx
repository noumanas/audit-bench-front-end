'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePollScan } from '@/lib/usePollScan';
import { RepositoryReport } from '@/components/RepositoryReport';
import { RequireAuth } from '@/components/RequireAuth';

export default function RepositoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scan, error, loading } = usePollScan(id);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/app/dashboard" className="mb-4 inline-block text-sm text-cobalt">
          ← Back to dashboard
        </Link>

        {error && (
          <div className="mb-6 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error}
          </div>
        )}

        {loading && !scan && <div className="text-sm text-muted-on-ink">Loading…</div>}

        {scan && <RepositoryReport scan={scan} />}
      </div>
    </RequireAuth>
  );
}
