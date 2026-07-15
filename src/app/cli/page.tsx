import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { CodeBlock } from '@/components/CodeBlock';

export const metadata: Metadata = {
  title: 'CLI',
  description:
    'The audit/bench command-line client — run audits and repository scans from a terminal, a pre-commit hook, or a CI pipeline. Install, command reference, and GitHub Actions / GitLab CI setup.',
  alternates: { canonical: '/cli' },
};

const SECTIONS = [
  { href: '#install', label: 'Install' },
  { href: '#commands', label: 'Commands' },
  { href: '#auth', label: 'Authentication' },
  { href: '#ci', label: 'CI/CD' },
  { href: '#docker', label: 'Docker' },
];

const COMMANDS = [
  { cmd: 'auditbench login', detail: 'Log in and store an access token locally. Prompts for email/password.' },
  { cmd: 'auditbench logout', detail: 'Clear the stored access token.' },
  { cmd: 'auditbench status', detail: "Show the current plan and today's/this month's AI-audit quota usage." },
  { cmd: 'auditbench audit <file>', detail: 'Run a single-file audit and print the verdict and findings.' },
  {
    cmd: 'auditbench scan <path>',
    detail: 'Zip a directory (or point at an existing .zip) and run a full repository scan.',
  },
];

const FLAGS = [
  { flag: '--provider <name>', detail: 'Choose the LLM provider for this run: anthropic, openai, or gemini.' },
  {
    flag: '--fail-on <level>',
    detail:
      'Exit non-zero when the verdict is at least this bad: do_not_ship (default — matches the PR merge-block threshold), needs_work (stricter), or never (report only, never fail the build).',
  },
];

const ENV_VARS = [
  { name: 'AUDITBENCH_API_KEY', detail: 'Long-lived credential for CI — skips auditbench login entirely.' },
  { name: 'AUDITBENCH_API_URL', detail: 'Override the API base URL (self-hosting or local development).' },
];

export default function CliPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">CLI</div>
        <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4]">audit/bench, from your terminal</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-muted-on-ink">
          Same review engine as the web app — run it from a terminal, a pre-commit hook, or a pipeline
          step, and fail the build when a scan comes back <code className="rounded bg-ink-soft px-1.5 py-0.5 font-mono text-[13px]">do_not_ship</code>.
        </p>
        <div className="mx-auto mb-8 max-w-lg text-left">
          <CodeBlock code={'npm install -g auditbench-cli\nauditbench login'} />
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink hover:text-[#E8ECF4]"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </section>

      {/* Install */}
      <section id="install" className="scroll-mt-6 bg-paper px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Install</h2>
          <p className="mb-6 text-sm text-muted-on-paper">Two ways to get it running, depending on your setup.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-paper-line bg-paper-card p-5">
              <h3 className="mb-2 text-sm font-bold text-[#1C2128]">npm (global install)</h3>
              <p className="mb-3 text-sm leading-relaxed text-muted-on-paper">
                Needs Node.js 20+. Puts <code className="rounded bg-paper px-1 py-0.5 font-mono text-[12px]">auditbench</code> on
                your PATH.
              </p>
              <CodeBlock code="npm install -g auditbench-cli" />
            </div>
            <div className="rounded-lg border border-paper-line bg-paper-card p-5">
              <h3 className="mb-2 text-sm font-bold text-[#1C2128]">Docker</h3>
              <p className="mb-3 text-sm leading-relaxed text-muted-on-paper">
                No Node.js toolchain needed — good for pipelines that only have Docker available.
                Build it from source (see <a href="#docker" className="text-cobalt underline">Docker</a> below).
              </p>
              <CodeBlock code={'git clone https://github.com/noumanas/-audit-bench-cli.git\ncd -audit-bench-cli && docker build -t auditbench-cli .'} />
            </div>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section id="commands" className="scroll-mt-6 bg-ink px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">Commands</h2>
          <p className="mb-6 text-sm text-muted-on-ink">Five commands cover the whole workflow.</p>
          <div className="mb-6 overflow-hidden rounded-lg border border-ink-line">
            {COMMANDS.map((c, i) => (
              <div key={c.cmd} className={`flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${i % 2 === 0 ? 'bg-ink-soft' : 'bg-ink'}`}>
                <code className="shrink-0 font-mono text-[13px] font-bold text-cobalt sm:w-56">{c.cmd}</code>
                <div className="text-sm text-muted-on-ink">{c.detail}</div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
            Flags (audit / scan)
          </h3>
          <div className="mb-6 overflow-hidden rounded-lg border border-ink-line">
            {FLAGS.map((f, i) => (
              <div key={f.flag} className={`flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:gap-4 ${i % 2 === 0 ? 'bg-ink-soft' : 'bg-ink'}`}>
                <code className="shrink-0 font-mono text-[13px] font-bold text-cobalt sm:w-48">{f.flag}</code>
                <div className="text-sm text-muted-on-ink">{f.detail}</div>
              </div>
            ))}
          </div>

          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
            Environment variables
          </h3>
          <div className="overflow-hidden rounded-lg border border-ink-line">
            {ENV_VARS.map((e, i) => (
              <div key={e.name} className={`flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:gap-4 ${i % 2 === 0 ? 'bg-ink-soft' : 'bg-ink'}`}>
                <code className="shrink-0 font-mono text-[13px] font-bold text-cobalt sm:w-56">{e.name}</code>
                <div className="text-sm text-muted-on-ink">{e.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section id="auth" className="scroll-mt-6 bg-paper px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Authentication</h2>
          <p className="mb-6 text-sm text-muted-on-paper">Two modes, depending on where the CLI runs.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-paper-line bg-paper-card p-5">
              <h3 className="mb-2 text-sm font-bold text-[#1C2128]">Interactive login</h3>
              <p className="mb-3 text-sm leading-relaxed text-muted-on-paper">
                For your own machine. Stores an access token in{' '}
                <code className="rounded bg-paper px-1 py-0.5 font-mono text-[12px]">~/.auditbench/config.json</code>{' '}
                (mode <code className="rounded bg-paper px-1 py-0.5 font-mono text-[12px]">0600</code>).
              </p>
              <CodeBlock code="auditbench login" />
            </div>
            <div className="rounded-lg border border-paper-line bg-paper-card p-5">
              <h3 className="mb-2 text-sm font-bold text-[#1C2128]">API key</h3>
              <p className="mb-3 text-sm leading-relaxed text-muted-on-paper">
                For CI — no password ever touches the pipeline. Generate one from the dashboard:{' '}
                <span className="font-semibold text-[#1C2128]">Repository scan → Integrations → CLI / CI-CD API key</span>.
              </p>
              <CodeBlock code={'export AUDITBENCH_API_KEY="abk_..."\nauditbench status'} />
            </div>
          </div>
        </div>
      </section>

      {/* CI/CD */}
      <section id="ci" className="scroll-mt-6 bg-ink px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">CI/CD — fail the build on bad findings</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-on-ink">
            Both <code className="rounded bg-ink-soft px-1.5 py-0.5 font-mono text-[13px]">audit</code> and{' '}
            <code className="rounded bg-ink-soft px-1.5 py-0.5 font-mono text-[13px]">scan</code> exit non-zero once the
            verdict meets <code className="rounded bg-ink-soft px-1.5 py-0.5 font-mono text-[13px]">--fail-on</code> — a
            failing review fails the build, the same threshold that blocks a PR merge.
          </p>

          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
            GitHub Actions
          </h3>
          <div className="mb-8">
            <CodeBlock
              label=".github/workflows/audit-bench.yml"
              code={`name: audit-bench
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g auditbench-cli
      - run: auditbench scan . --fail-on do_not_ship
        env:
          AUDITBENCH_API_KEY: \${{ secrets.AUDITBENCH_API_KEY }}`}
            />
          </div>

          <h3 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">GitLab CI</h3>
          <div>
            <CodeBlock
              label=".gitlab-ci.yml"
              code={`audit-bench:
  image: node:20
  script:
    - npm install -g auditbench-cli
    - auditbench scan . --fail-on do_not_ship
  variables:
    AUDITBENCH_API_KEY: $AUDITBENCH_API_KEY`}
            />
          </div>
        </div>
      </section>

      {/* Docker */}
      <section id="docker" className="scroll-mt-6 bg-paper px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Docker</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-on-paper">
            No Node.js required on the runner. Build the image from source, then bind-mount the repo
            to scan at <code className="rounded bg-paper px-1 py-0.5 font-mono text-[12px]">/workspace</code> — the
            image&apos;s default working directory. Pass the API key as an env var: container state
            doesn&apos;t persist between runs, so <code className="rounded bg-paper px-1 py-0.5 font-mono text-[12px]">auditbench login</code>{' '}
            isn&apos;t an option here.
          </p>
          <div className="space-y-3">
            <CodeBlock
              label="one-time build"
              code={'git clone https://github.com/noumanas/-audit-bench-cli.git\ncd -audit-bench-cli\ndocker build -t auditbench-cli .'}
            />
            <CodeBlock
              label="run a scan"
              code={`docker run --rm \\
  -v "$(pwd)":/workspace \\
  -e AUDITBENCH_API_KEY="$AUDITBENCH_API_KEY" \\
  auditbench-cli scan . --fail-on do_not_ship`}
            />
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-center">
        <h2 className="mb-4 text-xl font-bold text-[#E8ECF4]">Wire it into your pipeline</h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
          Free plan includes the CLI — sign up, generate an API key, and drop the workflow above into
          your repo.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white">
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink hover:text-[#E8ECF4]"
          >
            View pricing
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
