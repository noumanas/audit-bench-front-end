import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { CodeBlock } from '@/components/CodeBlock';
import { Reveal } from '@/components/Reveal';
import { SeverityTag, CategoryTag } from '@/components/Tag';

export const metadata: Metadata = {
  title: 'VS Code Extension',
  description:
    'Audit Bench Ai in your editor — inline diagnostics, hover explanations, and one-click AI fixes for security, logic, performance, architecture, and test-coverage findings, backed by the same engine as the CLI and web app.',
  alternates: { canonical: '/vscode' },
};

const SECTIONS = [
  { href: '#what-it-does', label: 'What it does' },
  { href: '#fix-all', label: 'Fix All with AI' },
  { href: '#get-it', label: 'Get it' },
  { href: '#settings', label: 'Settings' },
];

const FEATURES = [
  {
    title: 'Audit Current File',
    detail: 'Sends the active file to your account and shows findings as inline squiggly diagnostics — red for critical/high, yellow for medium, blue for low.',
  },
  {
    title: 'Hover for the full finding',
    detail: 'Description, root cause, suggested fix, and an example patch where available — without leaving the line you’re looking at.',
  },
  {
    title: 'Status bar verdict',
    detail: 'Shows the last verdict and how many tokens it cost — nothing shown if the finding was free (cached, or resolved by local checks alone).',
  },
  {
    title: 'Fix All Issues with AI',
    detail: 'One click fixes every finding in a file, applies the result to the editor, then re-checks the fix and updates the diagnostics to match.',
  },
  {
    title: 'Account & Usage panel',
    detail: 'Your plan, and daily/monthly AI-audit quota with reset times — a status bar glance opens the full panel.',
  },
  {
    title: 'Secrets-aware by default',
    detail: 'A file that looks like it holds a real key — an AWS/Slack/Stripe/GitHub token, a PEM header, a .env or credentials.json — gets a confirmation prompt before anything is sent, every time, not just once.',
  },
];

const SETTINGS = [
  { name: 'auditbench.apiUrl', detail: 'API base URL — override for local backend testing.' },
  { name: 'auditbench.provider', detail: 'Force a specific LLM provider: anthropic, openai, gemini, deepseek, glm, qwen, kimi, xai, mistral, or minimax.' },
  { name: 'auditbench.auditOnSave', detail: 'Automatically audit a file every time you save it. Off by default.' },
  { name: 'auditbench.warnAboveChars', detail: 'Confirm before auditing a file over this many characters (20,000 default).' },
];

export default function VsCodePage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16 text-center">
        <Reveal>
          <div className="mb-2 font-mono text-[13px] tracking-wide text-muted-on-ink uppercase">VS Code Extension</div>
          <h1 className="mb-3 text-3xl font-bold text-[#E8ECF4]">Audit Bench Ai, right in your editor</h1>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-muted-on-ink">
            Same review engine as the CLI and web app — inline diagnostics, hover explanations, and
            one-click AI fixes, without leaving VS Code.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="rounded-full border border-ink-line px-3 py-1.5 text-xs font-medium text-muted-on-ink transition-colors duration-200 hover:border-cobalt/50 hover:text-[#E8ECF4]"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </Reveal>
      </section>

      {/* What it does */}
      <section id="what-it-does" className="scroll-mt-6 bg-paper px-6 py-14">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">What it does</h2>
          <p className="mb-6 text-sm text-muted-on-paper">
            Talks to the same <code className="rounded bg-paper-card px-1 py-0.5 font-mono text-[12px]">/audit</code>,{' '}
            <code className="rounded bg-paper-card px-1 py-0.5 font-mono text-[12px]">/me</code>, and repo-scan/fix
            endpoints the CLI and web app use — no separate backend, no separate account.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-paper-line bg-paper-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cobalt/40 hover:shadow-panel"
              >
                <h3 className="mb-2 text-sm font-bold text-[#1C2128]">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-on-paper">{f.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Mock demo */}
      <section className="bg-ink px-6 py-14">
        <Reveal className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-xl border border-ink-line bg-ink-soft">
            <div className="flex items-center gap-2 border-b border-ink-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-critical/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-high/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
              <span className="ml-2 font-mono text-[11px] text-muted-on-ink">charge.ts</span>
            </div>
            <div className="p-4 font-mono text-[13px] leading-relaxed">
              <div className="text-muted-on-ink">{'async function chargeCard(token: string, amount: number) {'}</div>
              <div className="pl-4 text-[#E8ECF4]">
                <span className="border-b-2 border-dotted border-critical">
                  {'  logger.info(`charging ${token} for ${amount}`);'}
                </span>
              </div>
              <div className="text-muted-on-ink">{'}'}</div>
              <div className="mt-4 max-w-sm rounded-lg border border-ink-line bg-ink p-3 text-[12px]">
                <div className="mb-1 font-bold text-[#E8ECF4]">Card token logged in plain text</div>
                <div className="mb-2 flex items-center gap-1.5">
                  <SeverityTag severity="critical" />
                  <CategoryTag label="Security" />
                  <span className="font-mono text-[9px] tracking-wide text-muted-on-ink uppercase">96% confidence</span>
                </div>
                <div className="text-muted-on-ink">
                  Sensitive payment data is written to application logs on every charge attempt — mask it before logging.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-ink-line px-4 py-2.5 font-mono text-[11px]">
              <span className="text-critical">$(shield) Audit Bench Ai: do not ship</span>
              <span className="text-muted-on-ink">$(wand) Fix All Issues with AI</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Fix All */}
      <section id="fix-all" className="scroll-mt-6 bg-paper px-6 py-14">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Fix All Issues with AI</h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-on-paper">
            The backend&apos;s AI-fix endpoints are scoped to a repo scan, the same way the web app&apos;s
            fix-in-editor flow works. Rather than needing a separate backend path for a single open file,
            the extension zips just that one file and uploads it through the same repo-scan endpoint the
            CLI&apos;s <code className="rounded bg-paper-card px-1 py-0.5 font-mono text-[12px]">auditbench scan</code>{' '}
            uses — a one-file &quot;repo.&quot; One click: zip → upload → scan → bulk AI fix → apply to the
            editor → re-check the result.
          </p>
          <p className="text-sm leading-relaxed text-muted-on-paper">
            That&apos;s up to three AI calls in one action — notably more than a single file audit — so it
            only ever runs when you click it, never automatically, and it requires your plan to include
            repository scanning. The summary afterward is specific about what actually happened: whether
            the original findings are confirmed gone, or a fresh full re-check surfaced something different
            — not a vague &quot;issues remain.&quot;
          </p>
        </Reveal>
      </section>

      {/* Get it */}
      <section id="get-it" className="scroll-mt-6 bg-ink px-6 py-14">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#E8ECF4]">Get it</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-on-ink">
            Not yet on the VS Code Marketplace — build it from source for now, same as the CLI before its
            first release.
          </p>
          <CodeBlock
            label="build & install"
            code={
              'git clone https://github.com/noumanas/audit-bench-vscode-extenstion.git\n' +
              'cd audit-bench-vscode-extenstion\n' +
              'npm install\n' +
              'npm run compile\n' +
              'npm run package\n' +
              'code --install-extension auditbench-vscode-0.1.0.vsix'
            }
          />
          <p className="mt-4 text-sm leading-relaxed text-muted-on-ink">
            Then run <span className="font-semibold text-[#E8ECF4]">Audit Bench Ai: Set API Key</span> from the
            Command Palette (Dashboard → Integrations → &quot;CLI / CI-CD API key&quot;) and you&apos;re set.
          </p>
        </Reveal>
      </section>

      {/* Settings */}
      <section id="settings" className="scroll-mt-6 bg-paper px-6 py-14">
        <Reveal className="mx-auto max-w-4xl">
          <h2 className="mb-2 text-xl font-bold text-[#1C2128]">Settings</h2>
          <div className="overflow-hidden rounded-lg border border-paper-line">
            {SETTINGS.map((s, i) => (
              <div
                key={s.name}
                className={`flex flex-col gap-1 px-4 py-3.5 transition-colors duration-200 hover:bg-cobalt/10 sm:flex-row sm:items-center sm:gap-4 ${i % 2 === 0 ? 'bg-paper-card' : 'bg-paper'}`}
              >
                <code className="shrink-0 font-mono text-[13px] font-bold text-cobalt sm:w-64">{s.name}</code>
                <div className="text-sm text-muted-on-paper">{s.detail}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-ink px-6 py-16 text-center">
        <Reveal>
          <h2 className="mb-4 text-xl font-bold text-[#E8ECF4]">Review code without leaving the editor</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
            Free plan includes single-file audits from the extension — sign up, generate an API key, and
            you&apos;re auditing in a couple of minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
            >
              Get started free
            </Link>
            <Link
              href="/cli"
              className="rounded-lg border border-ink-line px-5 py-3 text-sm font-bold text-muted-on-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-cobalt/40 hover:text-[#E8ECF4]"
            >
              See the CLI
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
