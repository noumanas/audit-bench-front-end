import Link from 'next/link';
import { BrandMark } from './BrandMark';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/scan', label: 'Free scan' },
      { href: '/cli', label: 'CLI' },
      { href: '/vscode', label: 'VS Code' },
      { href: '/app', label: 'Open the app' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/due-diligence', label: 'Technical due diligence' },
      { href: '/services', label: 'Services' },
      { href: '/alignment-lab', label: 'Alignment Lab' },
      { href: '/contact', label: 'Contact sales' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/blog', label: 'Blog' },
      { href: '/docs/required-check', label: 'Required check guide' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/security', label: 'Security' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ab-line bg-ab-bg font-ab text-ab-muted">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pt-14 pb-8 sm:px-8">
        <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <BrandMark />
            <p className="leading-relaxed text-ab-dim">The merge gate for AI-written code.</p>
            <Link href="/scan" className="font-medium text-chartreuse hover:underline">
              Review a public PR free →
            </Link>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5">
              <strong className="text-[13px] font-semibold text-white">{col.title}</strong>
              {col.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-ab-muted hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-ab-line pt-5 text-[13px] text-ab-dim">
          <span>© {new Date().getFullYear()} Audit Bench Ai</span>
          <a href="mailto:hello@auditbenchai.com" className="text-chartreuse hover:underline">
            hello@auditbenchai.com
          </a>
        </div>
      </div>
    </footer>
  );
}
