import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Code review built for the way code gets written now — AI reasoning paired with static analysis, reviewed with the rigor of a careful senior engineer.',
  alternates: { canonical: '/about' },
};

const USERS = [
  'Individual developers',
  'Startup engineering teams',
  'Enterprise engineering organizations',
  'Security teams',
  'CTOs',
];

const PIPELINE = [
  { name: 'Planner', detail: 'Reads the code and routes it to the right specialists.' },
  { name: 'Security agent', detail: 'OWASP Top 10, auth/JWT issues, secrets, injection.' },
  { name: 'Logic agent', detail: 'Edge cases, race conditions, hallucinated behavior.' },
  { name: 'Performance agent', detail: 'Slow paths, N+1 queries, unnecessary work.' },
  { name: 'Architecture agent', detail: 'Framework misuse, structure, maintainability.' },
  { name: 'Patch generator', detail: 'Turns each finding into a concrete, applicable fix.' },
];

const ADVANTAGES = [
  'AI-first code reasoning, not just pattern matching',
  'Multiple specialized review lenses per audit',
  'Context-aware repository analysis, not just single files',
  'Every finding ships with a root cause and a fix, not just a warning',
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
            About
          </div>
          <h1 className="mb-4 text-3xl font-bold text-[#E8ECF4]">
            Code review built for the way code gets written now
          </h1>
          <p className="text-base leading-relaxed text-muted-on-ink">
            AI coding assistants write more code, faster, than any team could before. audit/bench
            exists to review that code with the same rigor a careful senior engineer would — before
            it reaches production.
          </p>
        </div>
      </section>

      <section className="bg-paper px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-[#1C2128]">Why this exists</h2>
          <p className="mb-4 text-sm leading-relaxed text-[#1C2128]">
            Traditional linters catch syntax problems. They don&apos;t catch a service-role key
            bypassing row-level security, a shared mutable variable leaking data across requests,
            or Node syntax quietly failing inside a Deno edge function. Those are the mistakes AI
            assistants make constantly — because they produce code that <em>looks right</em> without
            necessarily reasoning about the runtime, the framework, or who&apos;s allowed to call it.
          </p>
          <p className="text-sm leading-relaxed text-[#1C2128]">
            audit/bench pairs LLM reasoning with static analysis — dependency graphs, dead code
            detection, secret scanning — so a review considers both what the code says and what the
            rest of the repository implies about it.
          </p>
        </div>
      </section>

      <section className="bg-ink px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-bold text-[#E8ECF4]">How an audit runs</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE.map((step, i) => (
              <div key={step.name} className="rounded-lg border border-ink-line bg-ink-soft p-4">
                <div className="mb-1 font-mono text-[11px] text-muted-on-ink">{`0${i + 1}`}</div>
                <div className="mb-1 text-sm font-bold text-[#E8ECF4]">{step.name}</div>
                <p className="text-xs leading-relaxed text-muted-on-ink">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#1C2128]">Who it&apos;s for</h2>
            <ul className="space-y-2 text-sm text-[#1C2128]">
              {USERS.map((u) => (
                <li key={u} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                  {u}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-bold text-[#1C2128]">What sets it apart</h2>
            <ul className="space-y-2 text-sm text-[#1C2128]">
              {ADVANTAGES.map((a) => (
                <li key={a} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-center">
        <h2 className="mb-4 text-xl font-bold text-[#E8ECF4]">Try it on your own code</h2>
        <Link href="/signup" className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white">
          Get started free
        </Link>
      </section>

      <Footer />
    </div>
  );
}
