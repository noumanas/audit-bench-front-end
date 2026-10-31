import { ActivityLog, ActivityType } from '@/lib/types';

/** Label + badge colors per event, shared by the Activity tab, the bell and the user drawer. */
export const ACTIVITY_META: Record<ActivityType, { label: string; badge: string; dot: string }> = {
  signup: { label: 'Signed up', badge: 'border-pass/40 bg-pass/15 text-[#7ee2ad]', dot: 'bg-pass' },
  login: { label: 'Signed in', badge: 'border-cobalt/40 bg-cobalt/15 text-[#B9CCF7]', dot: 'bg-cobalt' },
  login_failed: { label: 'Failed sign-in', badge: 'border-critical/40 bg-critical/15 text-[#F3B7BF]', dot: 'bg-critical' },
  plan_requested: { label: 'Requested plan', badge: 'border-high/40 bg-high/15 text-[#F0CE9A]', dot: 'bg-high' },
  plan_approved: { label: 'Plan approved', badge: 'border-pass/40 bg-pass/15 text-[#7ee2ad]', dot: 'bg-pass' },
  plan_rejected: { label: 'Plan rejected', badge: 'border-ink-line bg-ink text-muted-on-ink', dot: 'bg-muted-on-ink' },
};

const METHOD_LABELS: Record<string, string> = {
  password: 'Email',
  google: 'Google',
  github: 'GitHub',
  gitlab: 'GitLab',
  oauth: 'OAuth',
};

export function methodLabel(method: string | null | undefined): string | null {
  return method ? (METHOD_LABELS[method] ?? method) : null;
}

const FAIL_REASONS: Record<string, string> = {
  unknown_email: 'no account with this email',
  wrong_password: 'wrong password',
  oauth_only_account: 'account uses Google/GitHub/GitLab',
  suspended: 'account suspended',
};

/** "🇵🇰" from "PK" — regional-indicator letters; empty for anything that isn't a 2-letter code. */
export function flag(countryCode: string | null | undefined): string {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return '';
  return String.fromCodePoint(...[...countryCode].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

let regionNames: Intl.DisplayNames | null | undefined;
export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "Lahore, Pakistan" / "Pakistan" / null — city only when the edge supplied it. */
export function locationLabel(parts: { city?: string | null; countryCode?: string | null }): string | null {
  const country = countryName(parts.countryCode);
  return [parts.city, country].filter(Boolean).join(', ') || null;
}

export function Location({ city, countryCode }: { city?: string | null; countryCode?: string | null }) {
  const label = locationLabel({ city, countryCode });
  if (!label) return <span className="text-muted-on-ink/60">Unknown</span>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span aria-hidden="true">{flag(countryCode)}</span>
      {label}
    </span>
  );
}

/** Coarse "Chrome · macOS" from a user agent — enough to spot an unfamiliar device. */
export function deviceLabel(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : /curl|node|python|Go-http|axios/i.test(ua)
              ? 'Script'
              : null;
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X|Macintosh/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : null;
  return [browser, os].filter(Boolean).join(' · ') || 'Other';
}

/** One line of event-specific detail: the plan, the failure reason, where a signup came from. */
export function activityDetail(log: ActivityLog): string | null {
  const m = log.metadata ?? {};
  const str = (k: string) => (typeof m[k] === 'string' ? (m[k] as string) : null);
  switch (log.type) {
    case 'signup': {
      const source = str('source');
      const campaign = str('campaign');
      return source ? `from ${source}${campaign ? ` · ${campaign}` : ''}` : null;
    }
    case 'login_failed':
      return FAIL_REASONS[str('reason') ?? ''] ?? str('reason');
    case 'plan_requested':
      return str('plan') ? `${str('plan')}${str('organization') ? ` for ${str('organization')}` : ''}` : null;
    case 'plan_approved':
    case 'plan_rejected': {
      const by = str('reviewedBy');
      return [str('plan'), by ? `by ${by}` : null].filter(Boolean).join(' · ') || null;
    }
    default:
      return null;
  }
}

export function ActivityBadge({ type }: { type: ActivityType }) {
  const meta = ACTIVITY_META[type];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${meta.badge}`}>
      {meta.label}
    </span>
  );
}
