/**
 * First-touch attribution: where a visitor came from the first time they
 * landed, kept until they sign up and sent once with the signup / OAuth
 * exchange (backend ActivityService.recordSignup turns it into the user's
 * "came from"). localStorage can be unavailable (private mode, blocked
 * storage), so every access is guarded and a miss just means "direct".
 */

const KEY = 'ab_attribution';

export interface Attribution {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPath?: string;
}

/** Runs on every page load; only the first visit (or a later tagged link) is recorded. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const tagged = params.has('utm_source');
    if (localStorage.getItem(KEY) && !tagged) return;

    const referrer = document.referrer;
    let external = '';
    try {
      if (referrer && new URL(referrer).host !== window.location.host) external = referrer;
    } catch {
      // Malformed referrer — treat as none.
    }
    const value: Attribution = {
      referrer: external.slice(0, 500) || undefined,
      utmSource: params.get('utm_source')?.slice(0, 100) || undefined,
      utmMedium: params.get('utm_medium')?.slice(0, 100) || undefined,
      utmCampaign: params.get('utm_campaign')?.slice(0, 150) || undefined,
      landingPath: window.location.pathname.slice(0, 300),
    };
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage blocked — nothing to record.
  }
}

export function readAttribution(): Attribution | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}

/** After a successful signup — the next account on this browser starts fresh. */
export function clearAttribution(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Ignore.
  }
}
