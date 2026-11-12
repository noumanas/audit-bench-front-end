import Link from 'next/link';
import { Logo } from './Logo';

// The brand footer's top row: logo, line, and three quick links.
const QUICK_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/security', label: 'Security' },
  { href: '/login', label: 'Log in' },
];

// The navbar only carries three links, so this grid is how visitors — and
// search engines — reach every other page. Keep each page linked somewhere.
const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/scan', label: 'Free scan' },
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/services', label: 'Services' },
      { href: '/cli', label: 'CLI' },
      { href: '/vscode', label: 'VS Code' },
      { href: '/alignment-lab', label: 'Alignment Lab' },
    ],
  },
  {
    title: 'Due diligence',
    links: [
      { href: '/due-diligence', label: 'Technical due diligence' },
      { href: '/blog/technical-due-diligence-checklist', label: 'TDD checklist & template' },
      { href: '/blog/technical-due-diligence-questions', label: 'TDD questions to ask' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: 'mailto:noumanqureshi15@gmail.com', label: 'noumanqureshi15@gmail.com' },
    ],
  },
];

const LINK = 'hover:text-white hover:underline hover:underline-offset-[5px]';

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto w-full max-w-[1600px] px-[18px] pt-[39px] pb-[35px] sm:px-7 md:pt-[58px] lg:px-12">
        <div className="grid items-center gap-[25px] md:grid-cols-[200px_1fr_auto] md:gap-[30px]">
          <Link href="/" aria-label="Audit Bench Ai home" className="self-start md:self-center">
            <Logo size="md" />
          </Link>
          <p className="text-[17px] text-[#aaaaaa]">Build fast. Check what ships.</p>
          <div className="flex gap-[30px] text-[13px] text-[#bbbbbb] md:gap-[25px]">
            {QUICK_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={LINK}>
                {l.label}
                <span aria-hidden="true"> ↗</span>
              </Link>
            ))}
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink-line pt-8 sm:grid-cols-4"
        >
          {COLUMNS.map((col) => (
            // Legal holds the email address, too long for a half-width column on phones.
            <div key={col.title} className={col.title === 'Legal' ? 'col-span-2 sm:col-span-1' : undefined}>
              <div className="mb-3 text-[11px] font-medium tracking-[0.09em] text-[#888888] uppercase">{col.title}</div>
              <ul className="space-y-2 text-[13px] text-[#bbbbbb]">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={LINK}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-10 border-t border-ink-line pt-[25px] text-xs text-[#888888]">
          © {new Date().getFullYear()} Audit Bench Ai
        </p>
      </div>
    </footer>
  );
}
