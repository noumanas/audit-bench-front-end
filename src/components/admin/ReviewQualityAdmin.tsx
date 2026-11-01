'use client';

import { useEffect, useState } from 'react';
import { getAdminReviewQuality } from '@/lib/api';
import type { ReviewQuality } from '@/lib/types';
import { ReviewQualityPanel } from '@/components/ReviewQualityPanel';

const WINDOWS = [30, 90, 180] as const;

/** Review usefulness across every team (backend GET /admin/review-quality). */
export function ReviewQualityAdmin() {
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(90);
  const [result, setResult] = useState<{ days: number; data: ReviewQuality } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminReviewQuality(days)
      .then((data) => {
        if (cancelled) return;
        setResult({ days, data });
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Could not load review quality.'));
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-on-ink">
          Whether reviews are useful, across every team: findings accepted rather than dismissed, how often a recheck
          withdrew a finding a developer disputed, repeats held back, and what each review costs in tokens.
        </p>
        <div className="flex gap-1.5" role="group" aria-label="Time window">
          {WINDOWS.map((w) => (
            <button
              key={w}
              onClick={() => setDays(w)}
              aria-pressed={days === w}
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold ${
                days === w ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink hover:text-[#E8ECF4]'
              }`}
            >
              {w} days
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-[13px] text-[#F3B7BF]">{error}</p>}
      {result?.days === days ? (
        <ReviewQualityPanel data={result.data} scope="all" />
      ) : (
        !error && <div className="h-40 animate-pulse rounded-lg bg-ink-soft" />
      )}
    </div>
  );
}
