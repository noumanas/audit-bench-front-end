import Link from 'next/link';
import { Footer } from '@/components/Footer';

const SECURITY_COVERAGE = [
  'SQL Injection', 'XSS', 'CSRF', 'SSRF', 'JWT / auth issues', 'Hardcoded secrets', 'OWASP Top 10',
];

const REPO_ANALYSIS = [
  { title: 'Dependency graph', detail: 'Maps imports across the repository and flags circular dependencies.' },
  { title: 'Dead code', detail: 'Finds files nothing imports and that aren’t entry points.' },
  { title: 'Duplicate code', detail: 'Hashes normalized code blocks to surface copy-pasted logic.' },
  { title: 'Secrets scan', detail: 'Regex rules for AWS keys, private keys, Slack/GitHub/Stripe tokens, and more.' },
];

const OUTPUT_FIELDS = [
  ['Severity', 'critical, high, medium, or low'],
  ['Title', 'a short, specific summary'],
  ['Description', 'what is wrong and why it matters'],
  ['Root cause', 'the underlying mistake that produced it'],
  ['Suggested fix', 'a concrete, actionable change'],
  ['Example patch', 'a code snippet showing the fix'],
  ['Confidence score', 'how sure the model is'],
];

export default function ServicesPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">
          Services
        </div>
        <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4]">Everything one audit checks</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-on-ink">
          Paste a file or upload a repository — the same engine reviews both, and every finding
          comes back in the same structured shape.
        </p>
      </section>

      {/* Code ingestion */}
      <section className="bg-paper px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Code ingestion</h2>
          <p className="mb-6 text-sm text-muted-on-paper">Get code in however it's easiest.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ServiceCard title="Paste code" detail="Drop a snippet or a full file straight into the editor." />
            <ServiceCard title="Upload a repository" detail="Zip up a project and get a full cross-file review." />
          </div>
        </div>
      </section>

      {/* Security coverage */}
      <section className="bg-ink px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">Security coverage</h2>
          <p className="mb-6 text-sm text-muted-on-ink">
            The security lens is checked on every audit, backed by a deterministic secrets scanner
            in addition to model reasoning.
          </p>
          <div className="flex flex-wrap gap-2">
            {SECURITY_COVERAGE.map((s) => (
              <span
                key={s}
                className="rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Repository analysis */}
      <section className="bg-paper px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Repository analysis</h2>
          <p className="mb-6 text-sm text-muted-on-paper">
            Beyond per-file review, a repository scan looks at how files relate to each other.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {REPO_ANALYSIS.map((r) => (
              <ServiceCard key={r.title} title={r.title} detail={r.detail} light />
            ))}
          </div>
        </div>
      </section>

      {/* AI output shape */}
      <section className="bg-ink px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">Every finding, same shape</h2>
          <p className="mb-6 text-sm text-muted-on-ink">
            No vague warnings — every finding is structured so it&apos;s immediately actionable.
          </p>
          <div className="overflow-hidden rounded-lg border border-ink-line">
            {OUTPUT_FIELDS.map(([field, detail], i) => (
              <div
                key={field}
                className={`flex gap-4 px-4 py-3 ${i % 2 === 0 ? 'bg-ink-soft' : 'bg-ink'}`}
              >
                <div className="w-40 shrink-0 font-mono text-xs font-bold text-cobalt">{field}</div>
                <div className="text-sm text-muted-on-ink">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-6 py-16 text-center">
        <h2 className="mb-4 text-xl font-bold text-[#1C2128]">See it on your own code</h2>
        <Link href="/signup" className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white">
          Get started free
        </Link>
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ title, detail, light }: { title: string; detail: string; light?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        light ? 'border-paper-line bg-paper-card' : 'border-ink-line bg-ink-soft'
      }`}
    >
      <h3 className={`mb-2 text-sm font-bold ${light ? 'text-[#1C2128]' : 'text-[#E8ECF4]'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${light ? 'text-muted-on-paper' : 'text-muted-on-ink'}`}>
        {detail}
      </p>
    </div>
  );
}
