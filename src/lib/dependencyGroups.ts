import { DependencyVulnerability } from './types';

export type DepSeverity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

export const SEVERITY_HEX: Record<DepSeverity, string> = {
  critical: '#c92a3d',
  high: '#d97706',
  medium: '#b08a00',
  low: '#2e6fab',
  unknown: '#8a93a3',
};

export const DEP_RANK: Record<DepSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1, unknown: 0 };

// Advisory feeds use npm's "moderate" and OSV's free-form strings — fold
// them onto the four app severities, with anything unrecognised as unknown.
export function normalizeDepSeverity(raw: string): DepSeverity {
  const s = raw.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'moderate' || s === 'medium') return 'medium';
  if (s === 'low') return 'low';
  return 'unknown';
}

export interface DependencyGroup {
  pkg: string;
  severity: DepSeverity;
  advisories: number;
  titles: string[];
  ranges: string[];
}

/**
 * The raw feed repeats one package once per advisory (and again with a
 * generic "Vulnerable dependency: X" title when a source has no detail).
 * Group by package, keep the worst severity, and drop the generic titles
 * whenever a specific one exists.
 */
export function groupDependencies(vulns: DependencyVulnerability[]): DependencyGroup[] {
  const groups = new Map<string, { severity: DepSeverity; advisories: number; titles: Set<string>; ranges: Set<string> }>();
  for (const v of vulns) {
    const sev = normalizeDepSeverity(v.severity);
    const g = groups.get(v.package) ?? { severity: sev, advisories: 0, titles: new Set<string>(), ranges: new Set<string>() };
    g.advisories++;
    if (DEP_RANK[sev] > DEP_RANK[g.severity]) g.severity = sev;
    g.titles.add(v.title.trim());
    if (v.range) g.ranges.add(v.range);
    groups.set(v.package, g);
  }
  return [...groups.entries()]
    .map(([pkg, g]) => {
      const specific = [...g.titles].filter((t) => !/^vulnerable dependency/i.test(t));
      return {
        pkg,
        severity: g.severity,
        advisories: g.advisories,
        titles: specific.length > 0 ? specific : [...g.titles],
        ranges: [...g.ranges],
      };
    })
    .sort((a, b) => DEP_RANK[b.severity] - DEP_RANK[a.severity] || b.advisories - a.advisories);
}
