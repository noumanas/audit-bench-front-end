import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/services', label: 'Services' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/app', label: 'Open the app' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/signup', label: 'Sign up' },
      { href: '/login', label: 'Log in' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-10">
        <div className="max-w-xs">
          <div className="mb-2 font-mono text-base font-bold tracking-tight text-[#E8ECF4]">
            audit<span className="text-cobalt">/</span>bench
          </div>
          <p className="text-sm leading-relaxed text-muted-on-ink">
            AI code review for security, logic, performance, and architecture — before it ships.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
              {col.title}
            </div>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-on-ink hover:text-[#E8ECF4]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-5xl border-t border-ink-line pt-6 text-xs text-muted-on-ink">
        © {new Date().getFullYear()} audit/bench. Built for reviewing AI-generated and human-written code.
      </div>
    </footer>
  );
}
