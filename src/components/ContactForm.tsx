'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { submitContact, type ContactTopic } from '@/lib/api';

export const CONTACT_TOPICS: { key: ContactTopic; label: string; hint: string }[] = [
  { key: 'support', label: 'Product support', hint: 'Include the email on your account and what you were doing.' },
  { key: 'sales', label: 'Sales and Enterprise plans', hint: 'Team size and what you need (limits, SSO, invoicing) help us quote.' },
  { key: 'due-diligence', label: 'Technical due diligence', hint: 'Tell us about the deal: timeline, codebase size, screening or full review.' },
  { key: 'security', label: 'Security disclosure', hint: "Steps to reproduce help most. Please don't test on other users' data." },
  { key: 'privacy', label: 'Privacy and data requests', hint: 'Access, correction or deletion of your data — send it from the account email.' },
  { key: 'partnerships', label: 'Partnerships and press', hint: 'Referral partnerships, integrations, guest posts and media.' },
  { key: 'other', label: 'Something else', hint: '' },
];

const isTopic = (v: string | null): v is ContactTopic => CONTACT_TOPICS.some((t) => t.key === v);

const FIELD =
  'block w-full rounded-lg border border-paper-line bg-white px-3.5 py-2.5 text-[14px] text-[#1C2128] outline-none transition placeholder:text-[#9AA1AC] focus:border-cobalt focus:ring-2 focus:ring-cobalt/20';

/** The /contact form — posts to the API, which emails the team inbox and confirms to the sender. */
export function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  // Topic links elsewhere on the site use /contact?topic=sales etc.
  const fromUrl = useSearchParams().get('topic');
  const [topic, setTopic] = useState<ContactTopic>(isTopic(fromUrl) ? fromUrl : 'support');
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', website: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      await submitContact({ ...form, company: form.company || undefined, topic });
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-2xl border border-paper-line bg-paper-card p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pass/10 text-pass">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#1C2128]">Thanks, {form.name.split(' ')[0]} — message received</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted-on-paper">
          A person on our team will reply to <strong className="text-[#1C2128]">{form.email}</strong>, usually within
          one business day. We&apos;ve sent you a confirmation email too.
        </p>
        <button
          onClick={() => {
            setForm({ name: form.name, email: form.email, company: form.company, message: '', website: '' });
            setStatus('idle');
          }}
          className="mt-6 cursor-pointer text-[13px] font-semibold text-cobalt hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const hint = CONTACT_TOPICS.find((t) => t.key === topic)?.hint;

  return (
    <form onSubmit={submit} className="rounded-2xl border border-paper-line bg-paper-card p-6 sm:p-8">
      <fieldset>
        <legend className="mb-2.5 text-[13px] font-semibold text-[#1C2128]">What can we help with?</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((t) => (
            <label
              key={t.key}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cobalt/40 ${
                topic === t.key
                  ? 'border-cobalt bg-cobalt text-white'
                  : 'border-paper-line bg-white text-[#3B4250] hover:border-cobalt/60'
              }`}
            >
              <input
                type="radio"
                name="topic"
                value={t.key}
                checked={topic === t.key}
                onChange={() => setTopic(t.key)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
        {hint && <p className="mt-2.5 text-[12px] leading-relaxed text-muted-on-paper">{hint}</p>}
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-[13px] font-semibold text-[#1C2128]">
          Name
          <input required maxLength={120} autoComplete="name" value={form.name} onChange={set('name')} className={`${FIELD} mt-1.5 font-normal`} />
        </label>
        <label className="block text-[13px] font-semibold text-[#1C2128]">
          Work email
          <input
            required
            type="email"
            maxLength={320}
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            className={`${FIELD} mt-1.5 font-normal`}
          />
        </label>
        <label className="block text-[13px] font-semibold text-[#1C2128] sm:col-span-2">
          Company <span className="font-normal text-muted-on-paper">(optional)</span>
          <input
            maxLength={160}
            autoComplete="organization"
            value={form.company}
            onChange={set('company')}
            className={`${FIELD} mt-1.5 font-normal`}
          />
        </label>
        <label className="block text-[13px] font-semibold text-[#1C2128] sm:col-span-2">
          Message
          <textarea
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            value={form.message}
            onChange={set('message')}
            placeholder="How can we help?"
            className={`${FIELD} mt-1.5 resize-y font-normal`}
          />
          <span className="mt-1 block text-right text-[11px] font-normal text-muted-on-paper">
            {form.message.length.toLocaleString()} / 5,000
          </span>
        </label>
        {/* Honeypot: off-screen and skipped by keyboard and screen readers; bots fill it in. */}
        <label aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          Website
          <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-critical/30 bg-critical/5 px-3.5 py-2.5 text-[13px] text-critical">
          {error} You can also email{' '}
          <a href={`mailto:${fallbackEmail}`} className="font-semibold underline">
            {fallbackEmail}
          </a>
          .
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-relaxed text-muted-on-paper">
          We only use your details to reply. See our{' '}
          <a href="/privacy" className="text-cobalt hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full shrink-0 cursor-pointer rounded-lg bg-cobalt px-6 py-2.5 text-[14px] font-bold text-white transition hover:bg-cobalt-dark disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
