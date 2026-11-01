import Link from 'next/link';
import { Children, isValidElement, type ReactNode } from 'react';

/** Text of a heading's children, for its anchor id. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return '';
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function Heading({ as: Tag, id, children }: { as: 'h2' | 'h3'; id?: string; children: ReactNode }) {
  const anchor = id ?? slugify(textOf(children));
  return (
    <Tag id={anchor} className="group scroll-mt-20">
      {children}
      <a href={`#${anchor}`} aria-label="Link to this section" className="docs-anchor">
        #
      </a>
    </Tag>
  );
}

/** Section heading: gets an id (from its text) so it shows in "On this page" and can be linked to. */
export const H2 = (props: { id?: string; children: ReactNode }) => <Heading as="h2" {...props} />;
export const H3 = (props: { id?: string; children: ReactNode }) => <Heading as="h3" {...props} />;

const CALLOUT_STYLES = {
  note: { label: 'Note', border: 'border-cobalt/50', bg: 'bg-cobalt/[0.07]', text: 'text-[#9db6ff]' },
  tip: { label: 'Tip', border: 'border-pass/60', bg: 'bg-pass/[0.08]', text: 'text-[#7fd1a6]' },
  warning: { label: 'Heads up', border: 'border-high/60', bg: 'bg-high/[0.08]', text: 'text-[#F0CE9A]' },
} as const;

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
}) {
  const s = CALLOUT_STYLES[type];
  return (
    <div className={`not-prose rounded-lg border-l-[3px] ${s.border} ${s.bg} px-4 py-3`}>
      <div className={`mb-1 font-mono text-[10.5px] font-bold tracking-[0.12em] uppercase ${s.text}`}>
        {title ?? s.label}
      </div>
      <div className="docs-callout-body text-[13.5px] leading-relaxed text-[#c9d1e0]">{children}</div>
    </div>
  );
}

/** Numbered steps with a rail: each child <Step title> becomes one. */
export function Steps({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children);
  return (
    <ol className="not-prose relative space-y-6">
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-4">
          {i < steps.length - 1 && <span aria-hidden className="absolute top-8 bottom-[-1.5rem] left-[13px] w-px bg-ink-line" />}
          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cobalt/60 bg-ink font-mono text-[12px] font-bold text-[#9db6ff]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">{step}</div>
        </li>
      ))}
    </ol>
  );
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-[15px] font-bold text-[#E8ECF4]">{title}</h3>
      <div className="docs-step-body space-y-3 text-[14px] leading-relaxed text-[#c9d1e0]">{children}</div>
    </div>
  );
}

export function Cards({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`not-prose grid gap-3 sm:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : ''}`}>{children}</div>
  );
}

export function Card({ href, title, icon, children }: { href: string; title: string; icon?: ReactNode; children: ReactNode }) {
  const external = href.startsWith('http');
  const body = (
    <>
      {icon && <div className="mb-3 text-[#9db6ff]">{icon}</div>}
      <div className="mb-1 flex items-center gap-1.5 text-[14px] font-bold text-[#E8ECF4]">
        {title}
        <span aria-hidden className="text-muted-on-ink transition-transform group-hover:translate-x-0.5">→</span>
      </div>
      <p className="text-[12.5px] leading-relaxed text-muted-on-ink">{children}</p>
    </>
  );
  const className =
    'group block rounded-lg border border-ink-line bg-ink-soft/60 p-4 transition-colors hover:border-cobalt/60 hover:bg-ink-soft';
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

/** A table that scrolls sideways on narrow screens instead of widening the page. */
export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="docs-table">
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Kbd =({ children }: { children: ReactNode }) => (
  <kbd className="rounded border border-ink-line bg-ink-soft px-1.5 py-0.5 font-mono text-[11px] text-[#E8ECF4]">{children}</kbd>
);

/** A small inline icon set for cards, in the 24px stroke style of components/icons.tsx. */
export function DocIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const ICONS = {
  rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2m-1-4 4 4m-4-4c1-4 4-9 11-10-1 7-6 10-10 11m3-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  branch: 'M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0a9 9 0 0 1-9 9',
  shield: 'M12 3l7 3v5c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6l7-3z',
  chat: 'M4 5h16v11H8l-4 4V5z',
  sliders: 'M4 6h10m4 0h2M4 12h4m4 0h8M4 18h12m4 0h0M14 4v4M8 10v4m8 2v4',
  terminal: 'M4 5h16v14H4zM7 9l3 3-3 3m5 0h5',
  editor: 'M8 6l-6 6 6 6m8-12 6 6-6 6M14 4l-4 16',
  scan: 'M4 7V4h3m10 0h3v3m0 10v3h-3M7 20H4v-3m0-5h16',
  layers: 'M12 3l9 5-9 5-9-5 9-5zm-9 9 9 5 9-5M3 16l9 5 9-5',
  check: 'M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
} as const;
