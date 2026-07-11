type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5l7 2.6v5.4c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6.1l7-2.6z" />
      <path d="M9 12l2 2 4-4.2" />
    </svg>
  );
}

export function LayersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5l8 4-8 4-8-4 8-4z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16.5l8 4 8-4" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M10.9 4.2a1.25 1.25 0 0 1 2.2 0l8 14.4A1.25 1.25 0 0 1 20 20.6H4a1.25 1.25 0 0 1-1.1-2l8-14.4z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.5 3h7l4 4v13.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V3.5a.5.5 0 0 1 .5-.5z" />
      <path d="M13 3v4.5h4.5" />
      <path d="M8.5 13h7M8.5 16.5h7" />
    </svg>
  );
}

export function GitBranchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="6" cy="5.5" r="2" />
      <circle cx="6" cy="18.5" r="2" />
      <circle cx="17.5" cy="9.5" r="2" />
      <path d="M6 7.5v9" />
      <path d="M6 9.5c0 4 3 4.5 6 4.5s5.5-.5 5.5-2.5v0" />
    </svg>
  );
}

export function UploadCloudIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M7.5 17.5a4.5 4.5 0 0 1-.7-8.94 5.5 5.5 0 0 1 10.6-1.4A4.25 4.25 0 0 1 17 17.5" />
      <path d="M12 20v-8" />
      <path d="M9 14.5l3-3 3 3" />
    </svg>
  );
}

export function PlugIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 3v5M15 3v5" />
      <path d="M6.5 8h11l-.7 4.2A5.6 5.6 0 0 1 11.3 17v0a5.6 5.6 0 0 1-4.5-4.8L6.5 8z" />
      <path d="M11 17v4" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4.5 12h15" />
      <path d="M13.5 6.5l6 5.5-6 5.5" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
