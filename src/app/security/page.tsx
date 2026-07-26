import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Security & Trust',
  description:
    'How audit/bench handles your code and credentials: read-only by default, git-based checkpoints, encrypted tokens, and what actually happens to your code during a scan.',
  alternates: { canonical: '/security' },
};

const PRINCIPLES = [
  {
    title: 'Read-only, unless you say otherwise',
    detail:
      'A scan never writes anything — not to your repo, not to your branch. The only action that changes your code is "commit fix" in the editor, and that’s opt-in, per file, every time.',
  },
  {
    title: 'Every fix is a real commit',
    detail:
      'Applied fixes land as an actual git commit — either directly on the reviewed PR/MR’s branch, or on a fresh branch opened for a repo scan. Undo is git revert, not a support ticket.',
  },
  {
    title: 'Your code is not used to train any model',
    detail:
      'audit/bench does not use scanned code to train a model, ours or anyone else’s. Each scan sends the relevant code to the LLM provider configured for that request, for that single review — nothing more. Check that provider’s own API terms for their data-handling policy; we don’t control it, but standard API access (as opposed to consumer chat products) typically excludes request data from training.',
  },
  {
    title: 'Credentials are encrypted, not just hidden',
    detail:
      'GitHub and GitLab tokens are encrypted at rest with AES-256-GCM before they touch the database — not stored in plaintext behind an access check. CLI/CI API keys are never returned in any normal account response; you only ever see one right after generating or rotating it.',
  },
  {
    title: 'Passwords are hashed, not encrypted',
    detail:
      'bcrypt, cost factor 12 — and any account created under an older, lower cost factor is silently upgraded to the current standard the next time you log in.',
  },
  {
    title: 'Verified webhooks',
    detail:
      'Every inbound GitHub/GitLab webhook is checked against a per-repository secret — HMAC signature verification for GitHub, a shared-secret header for GitLab — before anything in the payload is trusted.',
  },
  {
    title: 'Your team sees your team’s data, nothing else',
    detail:
      'Scans and audits are scoped to the account that ran them, or the organization it belongs to — enforced on every query, not just in the UI. Role-based permissions control who on a team can do what.',
  },
];

export default function SecurityPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Security &amp; Trust
          </div>
          <h1 className="mb-4 text-3xl leading-tight font-bold text-[#E8ECF4] sm:text-4xl">
            What actually happens to your code.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-on-ink">
            Not a compliance certification — a plain-language account of what this product does and doesn&apos;t do
            with your code and your credentials, so you can decide for yourself whether that&apos;s enough.
          </p>
        </div>
      </section>

      <section className="bg-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-6">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-lg border border-paper-line bg-paper-card p-5">
                <h2 className="mb-2 text-sm font-bold text-[#1C2128]">{p.title}</h2>
                <p className="text-sm leading-relaxed text-muted-on-paper">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-line bg-ink px-6 py-16 text-center">
        <h2 className="mb-3 text-xl font-bold text-[#E8ECF4]">Questions we didn&apos;t answer here?</h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
          Ask directly — especially before a security review on your end.
        </p>
        <a
          href="mailto:noumanqureshi15@gmail.com"
          className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white"
        >
          Contact us
        </a>
      </section>

      <Footer />
    </div>
  );
}
