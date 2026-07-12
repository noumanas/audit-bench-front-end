type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function InfoIcon({ className, title }: IconProps & { title?: string }) {
  return (
    <svg {...base} className={className} aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.2" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

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

export function GithubLogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.75" />
      <path d="M12 3.5v2.4M12 18.1v2.4M20.5 12h-2.4M5.9 12H3.5M17.7 6.3l-1.7 1.7M8 16l-1.7 1.7M17.7 17.7L16 16M8 8 6.3 6.3" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5.5 5.5-5.5S14.5 16 14.5 19" />
      <path d="M15.5 8.3a2.6 2.6 0 1 1 0 5.1" />
      <path d="M17 13.6c2 .3 3.5 2.3 3.5 4.9" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true" fill="currentColor" stroke="none">
      <path d="M11 3c.35 2.9 1.1 4.75 2.25 5.9S16.6 10.65 19.5 11c-2.9.35-4.75 1.1-5.9 2.25S11.35 16.6 11 19.5c-.35-2.9-1.1-4.75-2.25-5.9S5.9 11.35 3 11c2.9-.35 4.75-1.1 5.9-2.25S10.65 5.9 11 3z" />
      <path d="M18.5 3.5c.15 1.2.46 1.98.94 2.46s1.26.79 2.46.94c-1.2.15-1.98.46-2.46.94s-.79 1.26-.94 2.46c-.15-1.2-.46-1.98-.94-2.46s-1.26-.79-2.46-.94c1.2-.15 1.98-.46 2.46-.94s.79-1.26.94-2.46z" />
    </svg>
  );
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

export function EyeOffIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3.5 3.5l17 17" />
      <path d="M10.6 5.7c.45-.09.92-.14 1.4-.14 6 0 9.5 6.5 9.5 6.5a16.6 16.6 0 0 1-3.3 4.13M6.6 6.6C4.02 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.36 0 2.6-.33 3.68-.87" />
      <path d="M9.9 10c-.25.37-.4.83-.4 1.32 0 1.3 1.06 2.36 2.36 2.36.5 0 .96-.15 1.34-.42" />
    </svg>
  );
}

export function GitlabLogoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#E24329"
        d="M12 21.42 16.3 8.18H7.7L12 21.42z"
      />
      <path fill="#FC6D26" d="M12 21.42 7.7 8.18H2.87L12 21.42z" />
      <path fill="#FCA326" d="M2.87 8.18 1.7 11.75c-.1.32 0 .68.28.88L12 21.42 2.87 8.18z" />
      <path fill="#E24329" d="M2.87 8.18H7.7L5.65 1.9a.52.52 0 0 0-.99 0L2.87 8.18z" />
      <path fill="#FC6D26" d="M12 21.42 16.3 8.18h4.83L12 21.42z" />
      <path fill="#FCA326" d="M21.13 8.18 22.3 11.75c.1.32 0 .68-.28.88L12 21.42l9.13-13.24z" />
      <path fill="#E24329" d="M21.13 8.18H16.3L18.34 1.9a.52.52 0 0 1 .99 0l1.8 6.28z" />
    </svg>
  );
}
