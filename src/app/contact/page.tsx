import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';
import { TextReveal } from '@/components/gsap/TextReveal';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Audit Bench Ai about AI code review, technical due diligence engagements, support, partnerships, privacy or security.',
  alternates: { canonical: '/contact' },
};

// The mailbox the form delivers to — shown as the fallback if the form can't send.
const EMAIL = 'contact@auditbenchai.com';

const SHORTCUTS: { href: string; title: string; detail: string }[] = [
  { href: '/scan', title: 'Try it first', detail: 'Free scan of any public GitHub repo, no sign-up.' },
  { href: '/security', title: 'How we handle your code', detail: 'Security & Trust answers most data questions.' },
  { href: '/pricing', title: 'Plans and limits', detail: 'Compare Free, Pro, Team and Enterprise.' },
  {
    href: '/blog/technical-due-diligence-checklist',
    title: 'Due diligence checklist',
    detail: 'The free checklist, if you are doing it yourself.',
  },
];

export default function ContactPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Contact
          </div>
          <h1 className="mb-3 text-3xl leading-tight font-bold text-[#E8ECF4] sm:text-4xl">
            <TextReveal>Talk to the Audit Bench team</TextReveal>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-on-ink">
            Questions about a scan, an Enterprise plan, a due diligence engagement or anything else — send a message and
            a person will reply, usually within one business day.
          </p>
        </div>
      </section>

      <section className="bg-paper px-6 py-12 sm:py-14">
        <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-2xl border border-paper-line bg-paper-card" />}>
            <ContactForm fallbackEmail={EMAIL} />
          </Suspense>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-paper-line bg-paper-card p-5">
              <h2 className="text-[13px] font-semibold text-[#1C2128]">Prefer email?</h2>
              <a href={`mailto:${EMAIL}`} className="mt-1 block text-[14px] font-semibold break-all text-cobalt hover:underline">
                {EMAIL}
              </a>
              <dl className="mt-4 space-y-3 border-t border-paper-line pt-4 text-[13px]">
                <div>
                  <dt className="text-muted-on-paper">Typical reply</dt>
                  <dd className="font-semibold text-[#1C2128]">Within one business day</dd>
                </div>
                <div>
                  <dt className="text-muted-on-paper">Security reports</dt>
                  <dd className="text-[#1C2128]">
                    Pick <span className="font-semibold">Security disclosure</span>
                    {' — '}they&apos;re read first.
                  </dd>
                </div>
              </dl>
            </div>

            <nav aria-label="Before you write">
              <h2 className="mb-2 px-1 font-mono text-[11px] tracking-wide text-muted-on-paper uppercase">
                Before you write
              </h2>
              <ul className="space-y-1">
                {SHORTCUTS.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group block rounded-xl px-3 py-2.5 transition hover:bg-paper-card">
                      <span className="text-[14px] font-semibold text-[#1C2128] group-hover:text-cobalt">
                        {s.title} →
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-on-paper">{s.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
      <Footer />
    </div>
  );
}
