'use client';

import { useMemo, useState } from 'react';
import { TrendPoint } from '@/lib/types';
import { formatShortDate, pickTickIndices, useChartWidth } from './useChartWidth';

const HEIGHT = 140;
const PAD = { top: 16, right: 8, bottom: 26, left: 30 };
const BAR_COLOR = '#2b5be3';
const BAR_COLOR_HOVER = '#5b82ea';

export function ActivityBarChart({ points }: { points: TrendPoint[] }) {
  const [containerRef, width] = useChartWidth(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const counts = points.map((p) => p.audits + p.scans);
  const maxCount = Math.max(1, ...counts);
  const yMax = Math.ceil(maxCount / 5) * 5 || 5;

  const bandwidth = points.length ? plotW / points.length : 0;
  const barWidth = Math.min(24, bandwidth * 0.6);
  const x = (i: number) => PAD.left + i * bandwidth + (bandwidth - barWidth) / 2;
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  const tickIdx = useMemo(() => pickTickIndices(points.length, Math.min(6, points.length)), [points.length]);
  const hasData = counts.some((c) => c > 0);
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div>
      <div ref={containerRef} className="relative w-full">
        {!hasData ? (
          <div className="flex items-center justify-center text-sm text-muted-on-ink" style={{ height: HEIGHT }}>
            No audits or scans in this window yet.
          </div>
        ) : (
          <>
            <svg width={width} height={HEIGHT} className="block overflow-visible">
              {[0, yMax].map((tick) => (
                <g key={tick}>
                  <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} stroke="#2a3242" strokeWidth={1} />
                  <text x={PAD.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" className="fill-muted-on-ink" fontSize={10}>
                    {tick}
                  </text>
                </g>
              ))}

              {tickIdx.map((i) => (
                <text key={i} x={x(i) + barWidth / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-muted-on-ink" fontSize={10}>
                  {formatShortDate(points[i].date)}
                </text>
              ))}

              {points.map((p, i) => {
                const count = p.audits + p.scans;
                if (count === 0) return null;
                const barH = (count / yMax) * plotH;
                return (
                  <rect
                    key={p.date}
                    x={x(i)}
                    y={y(count)}
                    width={barWidth}
                    height={Math.max(barH, 2)}
                    rx={4}
                    fill={hoverIndex === i ? BAR_COLOR_HOVER : BAR_COLOR}
                  />
                );
              })}

              {points.map((p, i) => (
                <rect
                  key={`hit-${p.date}`}
                  x={PAD.left + i * bandwidth}
                  y={PAD.top}
                  width={bandwidth}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setHoverIndex(i)}
                  onPointerLeave={() => setHoverIndex(null)}
                />
              ))}
            </svg>

            {hovered && (
              <div
                className="pointer-events-none absolute top-0 rounded-md border border-ink-line bg-ink px-3 py-2 text-[11px] shadow-lg"
                style={{ left: Math.min(Math.max(x(hoverIndex!) - 50, 0), width - 140) }}
              >
                <div className="mb-1 font-mono text-muted-on-ink">{formatShortDate(hovered.date)}</div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-on-ink">Audits</span>
                  <span className="ml-auto font-semibold text-[#E8ECF4]">{hovered.audits}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-on-ink">Repo scans</span>
                  <span className="ml-auto font-semibold text-[#E8ECF4]">{hovered.scans}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
