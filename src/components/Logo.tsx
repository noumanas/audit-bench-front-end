/**
 * Shield + scan-line mark: the shield reuses the exact silhouette from
 * icons.tsx's ShieldIcon (same glyph already used for the "Audit" nav item
 * and elsewhere), so the logo reads as part of the same visual system
 * rather than a one-off. The scan-line crossing it is the same "AI sweeping
 * through code" idea as AuditLoader's scan-sweep beam — idle animation,
 * disabled under prefers-reduced-motion.
 */
export function LogoMark({
  className,
  animated = true,
  style,
}: {
  className?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 3.5l7 2.6v5.4c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6.1l7-2.6z"
        fill="#2b5be3"
      />
      <g className={animated ? 'logo-scan-line' : undefined}>
        <path d="M4.3 9.6L19.7 14.4" stroke="#E8ECF4" strokeWidth="1.5" strokeLinecap="round" opacity="0.95" />
        <circle cx="19.7" cy="14.4" r="1.3" fill="#E8ECF4" />
      </g>
    </svg>
  );
}

const SIZES = {
  sm: { mark: 18, text: 'text-sm', gap: 'gap-1.5' },
  md: { mark: 22, text: 'text-base', gap: 'gap-2' },
  lg: { mark: 26, text: 'text-lg', gap: 'gap-2' },
} as const;

export function Logo({
  size = 'md',
  animated = true,
  className,
}: {
  size?: keyof typeof SIZES;
  animated?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} font-mono ${s.text} font-bold tracking-tight text-[#E8ECF4] ${className ?? ''}`}>
      <LogoMark className="shrink-0" animated={animated} style={{ width: s.mark, height: s.mark }} />
      <span>Audit Bench</span>
      <span className="text-cobalt">Ai</span>
    </span>
  );
}
