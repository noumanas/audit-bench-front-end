interface SimpleIconData {
  title: string;
  hex: string;
  path: string;
}

/**
 * Renders an official brand mark from `simple-icons` (MIT-licensed SVG data)
 * in the current muted text color, with the real brand color available via
 * the --brand custom property for a hover reveal — see the pill styles in
 * page.tsx (group-hover:text-[color:var(--brand)]).
 */
export function TechLogo({ icon, className }: { icon: SimpleIconData; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      style={{ '--brand': `#${icon.hex}` } as React.CSSProperties}
      aria-hidden="true"
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
