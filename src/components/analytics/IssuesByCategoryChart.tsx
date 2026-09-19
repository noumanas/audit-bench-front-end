'use client';

import { useState } from 'react';
import { CategoryBreakdown } from '@/lib/types';

// The six categories a Finding can carry (see backend finding.schema.ts),
// mapped onto the app's existing severity/brand color tokens rather than
// inventing a new palette — Security reuses "critical" red, etc.
const CATEGORY_STYLE: Record<string, { color: string; short: string }> = {
  Security: { color: '#c92a3d', short: 'SEC' },
  Logic: { color: '#2b5be3', short: 'LGC' },
  Performance: { color: '#d97706', short: 'PRF' },
  Architecture: { color: '#2e6fab', short: 'ARC' },
  Maintainability: { color: '#b08a00', short: 'MNT' },
  Testing: { color: '#1f7a4d', short: 'TST' },
};
const FALLBACK_COLOR = '#8b96ab';

const SIZE = 148;
const STROKE = 26;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function IssuesByCategoryChart({ breakdown }: { breakdown: CategoryBreakdown }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const entries = Object.entries(breakdown)
    .filter((e): e is [string, number] => typeof e[1] === 'number' && e[1] > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-on-ink">No findings in this window.</p>;
  }

  const arcs = entries.reduce<{ category: string; count: number; dash: number; offset: number }[]>((acc, [category, count]) => {
    const dash = (count / total) * CIRCUMFERENCE;
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    acc.push({ category, count, dash, offset: prevEnd });
    return acc;
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={SIZE} height={SIZE} className="shrink-0 -rotate-90">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#2a3242" strokeWidth={STROKE} />
        {arcs.map(({ category, dash, offset }) => {
          const style = CATEGORY_STYLE[category] ?? { color: FALLBACK_COLOR, short: category.slice(0, 3).toUpperCase() };
          const isHovered = hovered === category;
          return (
            <circle
              key={category}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={style.color}
              strokeWidth={isHovered ? STROKE + 4 : STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              opacity={hovered && !isHovered ? 0.45 : 1}
              onPointerEnter={() => setHovered(category)}
              onPointerLeave={() => setHovered(null)}
              style={{ transition: 'opacity .12s ease, stroke-width .12s ease', cursor: 'default' }}
            />
          );
        })}
        <text
          x={CX}
          y={CY}
          transform={`rotate(90 ${CX} ${CY})`}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[#E8ECF4]"
          fontSize={22}
          fontWeight={700}
        >
          {total}
        </text>
      </svg>

      <div className="min-w-[160px] flex-1 space-y-1.5">
        {entries.map(([category, count]) => {
          const style = CATEGORY_STYLE[category] ?? { color: FALLBACK_COLOR, short: category.slice(0, 3).toUpperCase() };
          const pct = ((count / total) * 100).toFixed(1);
          return (
            <div
              key={category}
              className="flex items-center gap-2 text-[12px]"
              onPointerEnter={() => setHovered(category)}
              onPointerLeave={() => setHovered(null)}
            >
              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: style.color }} />
              <span className={hovered && hovered !== category ? 'text-muted-on-ink' : 'text-[#E8ECF4]'}>{category}</span>
              <span className="ml-auto shrink-0 tabular-nums text-muted-on-ink">
                {pct}% · {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
