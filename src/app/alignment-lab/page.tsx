import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Reveal } from '@/components/Reveal';

export const metadata: Metadata = {
  title: 'Alignment Lab',
  description:
    'Register a benchmark persona with a known hidden behavior, then run an autonomous investigator agent against it and see whether it uncovers what you hid — a practice ground for alignment-auditing technique, on Team and Enterprise plans.',
  alternates: { canonical: '/alignment-lab' },
};

const STEPS = [
  {
    n: '01',
    title: 'Register a persona',
    detail:
      'Write a system prompt that implants a specific hidden behavior — a secret bias, an undisclosed objective, anything you want an auditor to have to dig for — plus the ground truth of what you hid, for grading afterward.',
  },
  {
    n: '02',
    title: 'Run the investigator',
    detail:
      'An autonomous agent probes your persona over several turns — forming a hypothesis, choosing an indirect angle (roleplay, hypotheticals, multi-turn framing) rather than asking outright, and updating its belief after each answer.',
  },
  {
    n: '03',
    title: 'See what it found',
    detail:
      'Read the full turn-by-turn transcript, the investigator\'s final prediction and confidence, and whether it actually matched the hidden behavior you wrote — not just "no issues found."',
  },
];

const HONEST_NOTES = [
  {
    title: 'Your persona, not a live third-party model',
    detail:
      'The "target" is a real LLM call under a system prompt you write and control — not your production model, and not someone else\'s. This is a practice ground for auditing technique, not a scanner for models you don\'t control.',
  },
  {
    title: 'No jailbreak or prompt-injection scanning (yet)',
    detail:
      "What's here today is hidden-behavior discovery: one investigator agent, one persona, does it find what you hid. It doesn't scan for jailbreaks, prompt injection, or live production traffic.",
  },
  {
    title: 'A heuristic grade, not a certified one',
    detail:
      'Whether the investigator\'s final prediction "counts" as correct is a keyword-overlap check against the hidden behavior you wrote — a cheap approximation, not a rigorous or audited grader.',
  },
];

export default function AlignmentLabPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <Reveal>
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
            AI red-teaming · Team &amp; Enterprise
          </div>
          <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4] sm:text-4xl">
            Practice alignment auditing on models you control
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-on-ink">
            Write a hidden behavior into a persona, then send an autonomous investigator agent after it. See
            exactly how it probed, what it concluded, and whether it actually caught what you hid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
            >
              Get started
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
            >
              See plans
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-paper px-6 py-16">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#1C2128]">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-lg border border-paper-line bg-paper-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <div className="mb-2 font-mono text-[11px] text-muted-on-paper">{s.n}</div>
                <div className="mb-1 text-sm font-bold text-[#1C2128]">{s.title}</div>
                <p className="text-xs leading-relaxed text-muted-on-paper">{s.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-ink px-6 py-16">
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-xl font-bold text-[#E8ECF4]">What this actually is</h2>
          <p className="mb-8 text-center text-sm text-muted-on-ink">
            No overselling — here&apos;s exactly what&apos;s built today, and what isn&apos;t.
          </p>
          <div className="space-y-4">
            {HONEST_NOTES.map((n) => (
              <div key={n.title} className="rounded-lg border border-ink-line bg-ink-soft p-5">
                <h3 className="mb-1.5 text-sm font-bold text-[#E8ECF4]">{n.title}</h3>
                <p className="text-sm leading-relaxed text-muted-on-ink">{n.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-paper px-6 py-16 text-center">
        <Reveal>
          <h2 className="mb-3 text-xl font-bold text-[#1C2128]">Included on Team and Enterprise</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-paper">
            Team plans get a monthly investigation allowance; Enterprise is unlimited. Registering personas to see
            how it works is free on every plan — only running an investigation draws from the allowance.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
          >
            Compare plans
          </Link>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
