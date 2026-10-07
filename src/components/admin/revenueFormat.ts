const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Cents → "$1,234", or "$1.2K" when compact. Shows cents only when there are some. */
export function formatMoney(cents: number, compact = false): string {
  const dollars = cents / 100;
  if (compact && Math.abs(dollars) >= 1000) return usdCompact.format(dollars);
  return cents % 100 === 0 ? usd.format(dollars) : usdCents.format(dollars);
}

/** "$29.00" typed by a person → 2900 cents; null if it isn't a valid amount. */
export function parseMoney(input: string): number | null {
  const n = Number(input.replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

/** Rows → CSV text with a header, quoting every field. */
export function toCsv(rows: Array<Record<string, string | number | null>>): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const q = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.map(q).join(','), ...rows.map((r) => cols.map((c) => q(r[c])).join(','))].join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
