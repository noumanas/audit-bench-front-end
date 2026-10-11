import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Audit Bench Ai about AI code review, technical due diligence engagements, support, partnerships, privacy or security.',
  alternates: { canonical: '/contact' },
};

const EMAIL = 'noumanqureshi15@gmail.com';

const TOPICS: Array<{ title: string; detail: string; subject: string; link?: { href: string; label: string } }> = [
  {
    title: 'Technical due diligence',
    detail: 'Scoping a screening or full review for an acquisition or investment, or asking for the sample report.',
    subject: 'Technical due diligence inquiry',
    link: { href: '/due-diligence', label: 'How due diligence works' },
  },
  {
    title: 'Sales and Enterprise plans',
    detail: 'Team or Enterprise pricing, custom limits, SSO and invoicing.',
    subject: 'Enterprise plan inquiry',
    link: { href: '/pricing', label: 'See pricing' },
  },
  {
    title: 'Product support',
    detail:
      'Help with scans, pull request reviews, the CLI, the VS Code extension or your account. Include your account email.',
    subject: 'Support request',
  },
  {
    title: 'Privacy and data requests',
    detail: 'Access, correction or deletion of your personal data, or questions about our Privacy Policy.',
    subject: 'Privacy request',
    link: { href: '/privacy', label: 'Privacy Policy' },
  },
  {
    title: 'Security disclosure',
    detail:
      'Report a suspected vulnerability in Audit Bench Ai. Please include steps to reproduce and do not test on other users’ data.',
    subject: 'Security report',
    link: { href: '/security', label: 'Security & Trust' },
  },
  {
    title: 'Partnerships and press',
    detail: 'Referral partnerships for M&A advisors, integrations, guest posts and media requests.',
    subject: 'Partnership inquiry',
  },
];

export default function ContactPage() {
  return (
    <LegalPage
      kicker="Contact"
      title="Contact Audit Bench Ai"
      intro="Pick the topic that fits and your email app opens with the subject filled in, so your message reaches the right place."
    >
      <p>
        Email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Every message is read by a person, not a bot.
      </p>

      <div className="not-prose my-8 grid gap-3 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div key={t.title} className="flex flex-col rounded-xl border border-paper-line bg-paper-card p-5">
            <h2 className="mt-0! text-[15px] font-bold text-[#1C2128]">{t.title}</h2>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted-on-paper">{t.detail}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(t.subject)}`}
                className="rounded-md bg-cobalt px-3.5 py-1.5 text-[13px] font-bold text-white hover:bg-cobalt-dark"
              >
                Email us
              </a>
              {t.link && (
                <Link href={t.link.href} className="text-[13px] font-semibold text-cobalt hover:underline">
                  {t.link.label}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2>Before you write</h2>
      <ul>
        <li>
          Questions about how scans handle your code are answered on our{' '}
          <Link href="/security">Security &amp; Trust</Link> page.
        </li>
        <li>
          Want to see a report first? Run a <Link href="/scan">free scan of a public GitHub repo</Link>, no sign-up
          needed.
        </li>
        <li>
          Doing due diligence yourself? Use the free{' '}
          <Link href="/blog/technical-due-diligence-checklist">technical due diligence checklist</Link>.
        </li>
      </ul>
    </LegalPage>
  );
}
