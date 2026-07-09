'use client';

import { useMemo, useState } from 'react';
import { TrendPoint } from '@/lib/types';
import { formatShortDate, pickTickIndices, useChartWidth } from './useChartWidth';

const SERIES = [
  { key: 'security' as const, label: 'Security', color: '#3987e5' },
  { key: 'performance' as const, label: 'Performance', color: '#199e70' },
  { key: 'technicalDebt' as const, label: 'Technical debt', color: '#9085e9' },
];

const HEIGHT = 220;
const PAD = { top: 20, right: 78, bottom: 26, left: 30 };
const SURFACE = '#1a2130';

function buildPath(points: TrendPoint[], key: (typeof SERIES)[number]['key'], x: (i: number) => number, y: (v: number) => number) {
  const segments: string[] = [];
  let current = '';
  points.forEach((p, i) => {
    const v = p[key];
    if (v === null) {
      if (current) segments.push(current);
      current = '';
      return;
    }
    current += `${current ? 'L' : 'M'}${x(i)},${y(v)} `;
  });
  if (current) segments.push(current);
  return segments.join(' ');
}

export function ScoreTrendChart({ points }: { points: TrendPoint[] }) {
  const [containerRef, width] = useChartWidth(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / 100) * plotH;

  const hasData = points.some((p) => p.security !== null || p.performance !== null || p.technicalDebt !== null);
  const tickIdx = useMemo(() => pickTickIndices(points.length, Math.min(6, points.length)), [points.length]);

  type LastValue = (typeof SERIES)[number] & { index: number; value: number };
  const lastValues: LastValue[] = SERIES.map((s) => {
    for (let i = points.length - 1; i >= 0; i--) {
      const v = points[i][s.key];
      if (v !== null) return { ...s, index: i, value: v };
    }
    return null;
  }).filter((v): v is LastValue => v !== null);

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = points.length <= 1 ? 0 : relX / rect.width;
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.max(0, Math.min(points.length - 1, idx)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-4">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-[11px] text-muted-on-ink">
            <span className="inline-block h-[2px] w-3.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      <div ref={containerRef} className="relative w-full">
        {!hasData ? (
          <div
            className="flex items-center justify-center text-sm text-muted-on-ink"
            style={{ height: HEIGHT }}
          >
            No scored activity in this window yet.
          </div>
        ) : (
          <>
            <svg width={width} height={HEIGHT} className="block overflow-visible">
              {[0, 50, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={width - PAD.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="#2a3242"
                    strokeWidth={1}
                  />
                  <text x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" className="fill-muted-on-ink" fontSize={10}>
                    {tick}
                  </text>
                </g>
              ))}

              {tickIdx.map((i) => (
                <text
                  key={i}
                  x={x(i)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-muted-on-ink"
                  fontSize={10}
                >
                  {formatShortDate(points[i].date)}
                </text>
              ))}

              {SERIES.map((s) => (
                <path key={s.key} d={buildPath(points, s.key, x, y)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              ))}

              {lastValues.map((s) => (
                <g key={s.key}>
                  <circle cx={x(s.index)} cy={y(s.value)} r={4} fill={s.color} stroke={SURFACE} strokeWidth={2} />
                  <text x={x(s.index) + 8} y={y(s.value)} dominantBaseline="middle" fontSize={11} fontWeight={600} fill={s.color}>
                    {s.value}
                  </text>
                </g>
              ))}

              {hoverIndex !== null && (
                <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={PAD.top} y2={PAD.top + plotH} stroke="#8b96ab" strokeWidth={1} strokeDasharray="2,3" />
              )}

              <rect
                x={PAD.left}
                y={PAD.top}
                width={plotW}
                height={plotH}
                fill="transparent"
                onPointerMove={handlePointerMove}
                onPointerLeave={() => setHoverIndex(null)}
              />
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute top-2 rounded-md border border-ink-line bg-ink px-3 py-2 text-[11px] shadow-lg"
                style={{
                  left: Math.min(Math.max(x(hoverIndex!) - 70, 0), width - 150),
                }}
              >
                <div className="mb-1 font-mono text-muted-on-ink">{formatShortDate(hovered.date)}</div>
                {SERIES.map((s) => {
                  const v = hovered[s.key];
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className="inline-block h-[2px] w-2.5" style={{ background: s.color }} />
                      <span className="text-muted-on-ink">{s.label}</span>
                      <span className="ml-auto font-semibold text-[#E8ECF4]">{v ?? '—'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
          View as table
        </summary>
        <div className="mt-2 max-h-48 overflow-auto rounded-md border border-ink-line">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-ink-soft text-muted-on-ink">
              <tr>
                <th className="px-3 py-1.5 font-mono font-normal">Date</th>
                <th className="px-3 py-1.5 font-mono font-normal">Security</th>
                <th className="px-3 py-1.5 font-mono font-normal">Performance</th>
                <th className="px-3 py-1.5 font-mono font-normal">Technical debt</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date} className="border-t border-ink-line">
                  <td className="px-3 py-1.5 font-mono text-muted-on-ink">{p.date}</td>
                  <td className="px-3 py-1.5 tabular-nums">{p.security ?? '—'}</td>
                  <td className="px-3 py-1.5 tabular-nums">{p.performance ?? '—'}</td>
                  <td className="px-3 py-1.5 tabular-nums">{p.technicalDebt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
