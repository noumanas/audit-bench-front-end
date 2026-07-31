'use client';

import { useEffect, useState } from 'react';
import { getWebVitalsSummary } from '@/lib/api';
import { WebVitalMetricSummary } from '@/lib/types';

// Google's published Core Web Vitals "good" thresholds — used only to
// choose a display unit (ms vs. unitless) and aren't re-derived here; the
// rating breakdown itself already comes straight from the browser's own
// web-vitals library classification, not recomputed client-side.
const UNIT: Record<string, string> = {
  CLS: '',
  FCP: 'ms',
  FID: 'ms',
  INP: 'ms',
  LCP: 'ms',
  TTFB: 'ms',
};

function formatValue(name: string, value: number): string {
  if (UNIT[name] === 'ms') return `${Math.round(value)} ms`;
  return value.toFixed(3);
}

const DAY_OPTIONS = [1, 7, 30];

export function WebVitalsTable() {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<WebVitalMetricSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getWebVitalsSummary(days)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load Web Vitals.'))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-on-ink">Window:</span>
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold ${
              days === d ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading && <div className="text-sm text-muted-on-ink">Loading…</div>}
      {error && <div className="text-sm text-critical">{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div className="text-sm text-muted-on-ink">No Web Vitals reported in this window yet.</div>
      )}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-ink-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-line bg-ink-soft text-xs text-muted-on-ink uppercase">
                <th className="px-4 py-2.5 font-semibold">Metric</th>
                <th className="px-4 py-2.5 font-semibold">p75</th>
                <th className="px-4 py-2.5 font-semibold">Samples</th>
                <th className="px-4 py-2.5 font-semibold">Good / Needs work / Poor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-ink-line last:border-b-0">
                  <td className="px-4 py-2.5 font-mono font-bold text-[#E8ECF4]">{r.name}</td>
                  <td className="px-4 py-2.5 tabular-nums text-[#E8ECF4]">{formatValue(r.name, r.p75)}</td>
                  <td className="px-4 py-2.5 tabular-nums text-muted-on-ink">{r.count}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-ink-line">
                      <div className="bg-pass" style={{ width: `${r.goodPct}%` }} />
                      <div className="bg-high" style={{ width: `${r.needsImprovementPct}%` }} />
                      <div className="bg-critical" style={{ width: `${r.poorPct}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-on-ink">
                      {r.goodPct}% / {r.needsImprovementPct}% / {r.poorPct}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
