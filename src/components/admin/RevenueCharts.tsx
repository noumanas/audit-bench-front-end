'use client';

import { useState } from 'react';
import { RevenueMonth } from '@/lib/types';
import { useChartWidth } from '../analytics/useChartWidth';
import { formatMoney } from './revenueFormat';

// Palette validated with the dataviz validator on the admin card surface
// (#1A2130, dark): lightness band, chroma, CVD and normal-vision separation
// between neighbours, and 3:1 contrast all pass. Movement order is fixed so a
// series keeps its colour whichever months are shown.
const MRR_COLOR = '#3987e5';
export const MOVEMENTS = [
  { key: 'newCents', label: 'New', color: '#3987e5', sign: 1 },
  { key: 'expansionCents', label: 'Expansion', color: '#199e70', sign: 1 },
  { key: 'reactivationCents', label: 'Reactivation', color: '#9085e9', sign: 1 },
  { key: 'contractionCents', label: 'Contraction', color: '#c98500', sign: -1 },
  { key: 'churnCents', label: 'Churn', color: '#d55181', sign: -1 },
] as const;

const PAD = { top: 18, right: 12, bottom: 28, left: 56 };
const GRID = '#2A3242';
const AXIS_TEXT = '#8B96AB';

function monthLabel(m: string, withYear = false): string {
  const d = new Date(`${m}-01T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
}

/** Round axis maximum and 4 evenly spaced ticks. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return Array.from({ length: 5 }, (_, i) => i * step);
}

function Tooltip({ x, width, children }: { x: number; width: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x - 90, 0), Math.max(0, width - 180));
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-[180px] rounded-md border border-ink-line bg-ink px-3 py-2 text-[12px] shadow-lg"
      style={{ left }}
    >
      {children}
    </div>
  );
}

export function MrrTrendChart({ series }: { series: RevenueMonth[] }) {
  const [ref, width] = useChartWidth(720);
  const [hover, setHover] = useState<number | null>(null);
  const height = 200;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const ticks = niceTicks(Math.max(...series.map((m) => m.mrrCents), 0));
  const yMax = ticks.at(-1) || 1;
  const band = series.length ? plotW / series.length : 0;
  const barW = Math.min(36, band * 0.6);
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH;
  const hovered = hover !== null ? series[hover] : null;

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label="Monthly recurring revenue at the end of each month">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              {formatMoney(t, true)}
            </text>
          </g>
        ))}
        {series.map((m, i) => {
          const x = PAD.left + i * band + (band - barW) / 2;
          const h = Math.max(0, y(0) - y(m.mrrCents));
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={m.month}>
              {h > 0 && (
                // Rounded only at the data end; square on the baseline.
                <path
                  d={`M${x},${y(0)} V${y(m.mrrCents) + r} Q${x},${y(m.mrrCents)} ${x + r},${y(m.mrrCents)} H${x + barW - r} Q${x + barW},${y(m.mrrCents)} ${x + barW},${y(m.mrrCents) + r} V${y(0)} Z`}
                  fill={MRR_COLOR}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              <text
                x={PAD.left + i * band + band / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={11}
                fill={AXIS_TEXT}
              >
                {monthLabel(m.month)}
              </text>
              <rect
                x={PAD.left + i * band}
                y={PAD.top}
                width={band}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hovered && hover !== null && (
        <Tooltip x={PAD.left + hover * band + band / 2} width={width}>
          <div className="mb-1 font-semibold text-[#E8ECF4]">{monthLabel(hovered.month, true)}</div>
          <div className="flex justify-between text-muted-on-ink">
            MRR <span className="font-mono text-[#E8ECF4]">{formatMoney(hovered.mrrCents)}</span>
          </div>
          <div className="flex justify-between text-muted-on-ink">
            ARR <span className="font-mono text-[#E8ECF4]">{formatMoney(hovered.mrrCents * 12)}</span>
          </div>
          <div className="flex justify-between text-muted-on-ink">
            Paying accounts <span className="font-mono text-[#E8ECF4]">{hovered.accounts}</span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

/** Gains stacked above zero, losses below, per month. */
export function MrrMovementsChart({ series }: { series: RevenueMonth[] }) {
  const [ref, width] = useChartWidth(720);
  const [hover, setHover] = useState<number | null>(null);
  const height = 220;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const up = series.map((m) => MOVEMENTS.filter((s) => s.sign > 0).reduce((a, s) => a + m[s.key], 0));
  const down = series.map((m) => MOVEMENTS.filter((s) => s.sign < 0).reduce((a, s) => a + m[s.key], 0));
  const maxUp = Math.max(...up, 0);
  const maxDown = Math.max(...down, 0);
  const span = Math.max(maxUp + maxDown, 1);
  const zeroY = PAD.top + (maxUp / span) * plotH;
  const scale = plotH / span;
  const band = series.length ? plotW / series.length : 0;
  const barW = Math.min(36, band * 0.6);
  const hovered = hover !== null ? series[hover] : null;
  const empty = maxUp === 0 && maxDown === 0;

  return (
    <div ref={ref} className="relative w-full">
      {empty ? (
        <div className="flex items-center justify-center text-sm text-muted-on-ink" style={{ height }}>
          No MRR movements in this period yet.
        </div>
      ) : (
        <svg width={width} height={height} role="img" aria-label="Monthly MRR gained and lost, by type">
          <line x1={PAD.left} x2={width - PAD.right} y1={zeroY} y2={zeroY} stroke={AXIS_TEXT} strokeWidth={1} />
          <text x={PAD.left - 8} y={zeroY + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
            $0
          </text>
          {maxUp > 0 && (
            <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              +{formatMoney(maxUp, true)}
            </text>
          )}
          {maxDown > 0 && (
            <text x={PAD.left - 8} y={PAD.top + plotH + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
              −{formatMoney(maxDown, true)}
            </text>
          )}
          {series.map((m, i) => {
            const x = PAD.left + i * band + (band - barW) / 2;
            let upY = zeroY;
            let downY = zeroY;
            return (
              <g key={m.month} opacity={hover === null || hover === i ? 1 : 0.45}>
                {MOVEMENTS.map((s) => {
                  const v = m[s.key];
                  if (!v) return null;
                  const h = v * scale;
                  // 2px surface gap between stacked segments.
                  const gap = h > 3 ? 2 : 0;
                  if (s.sign > 0) {
                    upY -= h;
                    return <rect key={s.key} x={x} y={upY} width={barW} height={h - gap} rx={1.5} fill={s.color} />;
                  }
                  const top = downY + gap;
                  downY += h;
                  return <rect key={s.key} x={x} y={top} width={barW} height={h - gap} rx={1.5} fill={s.color} />;
                })}
                <text
                  x={PAD.left + i * band + band / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={AXIS_TEXT}
                >
                  {monthLabel(m.month)}
                </text>
                <rect
                  x={PAD.left + i * band}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {hovered && hover !== null && (
        <Tooltip x={PAD.left + hover * band + band / 2} width={width}>
          <div className="mb-1 font-semibold text-[#E8ECF4]">{monthLabel(hovered.month, true)}</div>
          {MOVEMENTS.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-muted-on-ink">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label}
              <span className="ml-auto font-mono text-[#E8ECF4]">
                {hovered[s.key] ? `${s.sign > 0 ? '+' : '−'}${formatMoney(hovered[s.key])}` : '—'}
              </span>
            </div>
          ))}
        </Tooltip>
      )}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {MOVEMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[12px] text-muted-on-ink">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
            {s.sign < 0 && <span className="text-[10px]">(lost)</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Same numbers as the charts, for screen readers and exact figures. */
export function RevenueTable({ series }: { series: RevenueMonth[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[12px]">
        <thead>
          <tr className="border-b border-ink-line font-mono text-[10px] tracking-wide text-muted-on-ink uppercase">
            <th className="py-2 pr-3">Month</th>
            <th className="py-2 pr-3 text-right">MRR</th>
            {MOVEMENTS.map((s) => (
              <th key={s.key} className="py-2 pr-3 text-right">
                {s.label}
              </th>
            ))}
            <th className="py-2 pr-3 text-right">Collected</th>
            <th className="py-2 text-right">Accounts</th>
          </tr>
        </thead>
        <tbody>
          {[...series].reverse().map((m) => (
            <tr key={m.month} className="border-b border-ink-line/60 text-[#E8ECF4]">
              <td className="py-1.5 pr-3">{monthLabel(m.month, true)}</td>
              <td className="py-1.5 pr-3 text-right font-mono">{formatMoney(m.mrrCents)}</td>
              {MOVEMENTS.map((s) => (
                <td key={s.key} className="py-1.5 pr-3 text-right font-mono text-muted-on-ink">
                  {m[s.key] ? `${s.sign > 0 ? '+' : '−'}${formatMoney(m[s.key])}` : '—'}
                </td>
              ))}
              <td className="py-1.5 pr-3 text-right font-mono">
                {formatMoney(m.collectedRecurringCents + m.collectedOneOffCents)}
              </td>
              <td className="py-1.5 text-right font-mono">{m.accounts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
