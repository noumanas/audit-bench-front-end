const BANDS = [
  { min: 80, color: '#1f7a4d', label: 'Healthy' },
  { min: 50, color: '#d97706', label: 'Needs attention' },
  { min: 0, color: '#c92a3d', label: 'At risk' },
];

function bandFor(score: number) {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
}

export function ScoreCard({ label, score, hint }: { label: string; score: number; hint: string }) {
  const band = bandFor(score);
  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-4 py-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">{label}</span>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide uppercase"
          style={{ color: band.color, backgroundColor: `${band.color}1f` }}
        >
          {band.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-[#E8ECF4]">{score}</span>
        <span className="text-sm text-muted-on-ink">/100</span>
      </div>
      <p className="mt-1 text-[12px] text-muted-on-ink">{hint}</p>
    </div>
  );
}
