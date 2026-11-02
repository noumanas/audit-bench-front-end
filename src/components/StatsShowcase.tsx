import Link from 'next/link';
import { CountUp } from '@/components/gsap/CountUp';
import { ScrollReveal } from '@/components/gsap/ScrollReveal';
import { ArrowRightIcon } from '@/components/icons';
import { BLOG_POSTS } from '@/lib/blog';

// Every number here is a verifiable product fact, not a traction claim —
// swap in real usage figures (repos scanned, findings caught) once they're
// worth publishing.
const SHOWCASE_STATS = [
  { value: `${BLOG_POSTS.length}+`, label: 'Security and code-review guides published by our team' },
  { value: '10', label: 'LLM providers — bring the model you already pay for' },
  { value: '11+', label: 'Frameworks understood, from Next.js to Spring Boot' },
  { value: '55', label: 'Checks in our free technical due diligence checklist' },
];

const RESEARCH_LINKS = [
  { kicker: 'Security guide', title: 'Command injection', href: '/blog/command-injection-code-review-guide' },
  { kicker: 'Due diligence', title: 'TDD checklist', href: '/blog/technical-due-diligence-checklist' },
  { kicker: 'AI alignment', title: 'Alignment Lab', href: '/alignment-lab' },
];

export function StatsShowcase() {
  return (
    <section className="border-b border-paper-line bg-paper px-6 pt-16">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal
          className="grid gap-px overflow-hidden rounded-t-xl border border-paper-line bg-paper-line sm:grid-cols-2 lg:grid-cols-4"
          stagger
        >
          {SHOWCASE_STATS.map((s) => (
            <div key={s.label} className="bg-paper-card px-7 py-9">
              <div className="text-5xl font-semibold tracking-tight text-cobalt tabular-nums">
                <CountUp value={s.value} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#1C2128]">{s.label}</p>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal
          className="grid gap-px overflow-hidden border border-t-0 border-paper-line bg-paper-line sm:grid-cols-2 lg:grid-cols-4"
          stagger
        >
          <div className="flex items-center bg-paper-card px-7 py-7 text-sm text-muted-on-paper">Published research</div>
          {RESEARCH_LINKS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex items-start justify-between gap-4 bg-paper-card px-7 py-7 transition-colors duration-200 hover:bg-paper"
            >
              <div>
                <div className="font-mono text-[12px] tracking-[0.08em] text-muted-on-paper uppercase">{r.kicker}</div>
                <div className="mt-1.5 text-xl font-bold tracking-tight text-[#1C2128] group-hover:text-cobalt">
                  {r.title}
                </div>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cobalt/10 text-cobalt transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                <ArrowRightIcon className="h-4 w-4 -rotate-45" />
              </span>
            </Link>
          ))}
        </ScrollReveal>
      </div>

      <div
        aria-hidden="true"
        className="mx-auto h-10 max-w-5xl border-x border-paper-line"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, var(--color-paper-line) 0 1px, transparent 1px 10px)',
        }}
      />
    </section>
  );
}
