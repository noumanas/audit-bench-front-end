'use client';

import { Fragment, useState } from 'react';

function ChromeDots() {
  return (
    <div className="flex gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-critical/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-high/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
    </div>
  );
}

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-4 font-mono text-[12px] leading-relaxed">
      <div className="mb-3 flex items-center justify-between">
        <ChromeDots />
        <span className="text-[10px] tracking-wide text-muted-on-ink uppercase">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Dot({ tone }: { tone: 'critical' | 'high' | 'medium' | 'low' | 'pass' }) {
  const cls = { critical: 'bg-critical', high: 'bg-high', medium: 'bg-medium', low: 'bg-low', pass: 'bg-pass' }[tone];
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${cls}`} />;
}

function VerdictBadge({ verdict }: { verdict: 'pass' | 'needs_work' | 'do_not_ship' }) {
  const cls = { pass: 'bg-pass', needs_work: 'bg-high', do_not_ship: 'bg-critical' }[verdict];
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase ${cls}`}>
      {verdict}
    </span>
  );
}

function Finding({ tone, text }: { tone: 'critical' | 'high' | 'medium' | 'low'; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
      <Dot tone={tone} />
      <span className="truncate text-[#E8ECF4]">{text}</span>
    </div>
  );
}

// ---------- Repo, PR & File Review ----------

function RepoScanDemo() {
  return (
    <Panel label="auditbench">
      <div className="text-muted-on-ink">$ auditbench scan .</div>
      <div className="mt-2 space-y-1.5">
        <Finding tone="low" text="dependency graph — 0 circular imports" />
        <Finding tone="medium" text="3 files with duplicate logic" />
        <Finding tone="critical" text="1 hardcoded secret in config/stripe.ts" />
      </div>
    </Panel>
  );
}

function PrNativeDemo() {
  return (
    <Panel label="github pr #482">
      <div className="rounded-md border border-ink-line bg-ink px-3 py-2">
        <div className="mb-1 text-[10px] tracking-wide text-muted-on-ink uppercase">src/api/orders.ts · line 58</div>
        <div className="text-[#E8ECF4]">Missing ownership check — any authenticated user can cancel any order.</div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-md bg-ink-soft px-3 py-2">
        <span className="text-muted-on-ink">audit/bench</span>
        <VerdictBadge verdict="do_not_ship" />
      </div>
    </Panel>
  );
}

// ---------- Findings & Severity ----------

function CategoriesTabDemo() {
  return (
    <Panel label="4 lenses">
      <div className="space-y-1.5">
        <Finding tone="critical" text="Security — SSRF in webhook fetch" />
        <Finding tone="high" text="Logic — off-by-one in cursor paging" />
        <Finding tone="medium" text="Performance — N+1 in orders.list()" />
        <Finding tone="low" text="Architecture — circular import" />
      </div>
    </Panel>
  );
}

function SeverityDemo() {
  return (
    <Panel label="verdict logic">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
          <span className="flex items-center gap-2 text-[#E8ECF4]"><Dot tone="critical" />2 critical</span>
          <span className="text-muted-on-ink">→ do_not_ship</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
          <span className="flex items-center gap-2 text-[#E8ECF4]"><Dot tone="medium" />3 medium</span>
          <span className="text-muted-on-ink">→ needs_work</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
          <span className="flex items-center gap-2 text-[#E8ECF4]"><Dot tone="low" />0 findings</span>
          <span className="text-muted-on-ink">→ pass</span>
        </div>
      </div>
    </Panel>
  );
}

// ---------- Fix & Re-audit ----------

function FixDemo() {
  return (
    <Panel label="fix with ai">
      <div className="whitespace-pre text-[#E8ECF4]">
        {'if (user.role === "admin") {\n  return res.json(allInvoices);\n}'}
      </div>
      <div className="mt-2 rounded bg-pass/15 px-2 py-1 text-pass">
        {'+ if (user.role === "admin" && user.orgId === invoice.orgId) {'}
      </div>
      <div className="mt-2 text-[11px] text-muted-on-ink">Suggested fix — review before it touches your branch.</div>
    </Panel>
  );
}

function ReauditDemo() {
  return (
    <Panel label="re-audit">
      <div className="mb-2 text-muted-on-ink">Re-checking billing/invoices.ts…</div>
      <div className="flex items-center gap-2 rounded-md border-l-4 border-l-pass bg-ink px-3 py-2">
        <Dot tone="pass" />
        <span className="text-[#E8ECF4]">Ownership check confirmed — resolved, ready to commit.</span>
      </div>
    </Panel>
  );
}

// ---------- CLI & CI/CD ----------

function CliInstallDemo() {
  return (
    <Panel label="terminal">
      <div className="text-muted-on-ink">$ npm install -g auditbench-cli</div>
      <div className="mt-1 text-muted-on-ink">$ docker run auditbench-cli scan .</div>
      <div className="mt-1 text-muted-on-ink"># or drop it straight into a workflow step</div>
      <div className="mt-2 rounded bg-ink px-2.5 py-1.5 text-[#E8ECF4]">- run: auditbench scan . --fail-on do_not_ship</div>
    </Panel>
  );
}

function CiFailOnDemo() {
  return (
    <Panel label="ci log">
      <div className="text-muted-on-ink">Run auditbench scan . --fail-on do_not_ship</div>
      <div className="mt-1 text-muted-on-ink">Verdict: do_not_ship (2 critical, 1 high)</div>
      <div className="mt-3 rounded-md border-l-4 border-l-critical bg-ink px-3 py-2 text-[#E8ECF4]">
        Error: Process completed with exit code 1.
      </div>
    </Panel>
  );
}

// ---------- Team Dashboard & Trends ----------

function TrendDemo() {
  return (
    <Panel label="score trend · 30d">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Security', value: 94 },
          { label: 'Performance', value: 88 },
          { label: 'Tech debt', value: 91 },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-ink-line bg-ink px-2.5 py-2">
            <div className="text-base font-bold text-[#E8ECF4] tabular-nums">{s.value}</div>
            <div className="text-[9px] tracking-wide text-muted-on-ink uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RiskiestDemo() {
  return (
    <Panel label="riskiest files">
      <div className="space-y-1.5">
        <Finding tone="critical" text="api/webhooks/stripe.ts" />
        <Finding tone="high" text="auth/session.ts" />
        <Finding tone="medium" text="billing/invoices.ts" />
      </div>
    </Panel>
  );
}

// ---------- Reports & Badges ----------

function ExportDemo() {
  return (
    <Panel label="export">
      <div className="space-y-1.5">
        {['PDF report', 'HTML report', 'Markdown', 'JSON'].map((f) => (
          <div key={f} className="flex items-center justify-between rounded-md border border-ink-line bg-ink px-2.5 py-1.5">
            <span className="text-[#E8ECF4]">{f}</span>
            <span className="text-muted-on-ink">↓ download</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BadgeDemo() {
  return (
    <Panel label="readme.md">
      <div className="mb-2 text-muted-on-ink">{'[![audit/bench](badge.svg)](…)'}</div>
      <div className="flex items-center gap-2 rounded-md bg-ink px-2.5 py-1.5">
        <span className="rounded bg-ink-line px-1.5 py-0.5 text-[10px] tracking-wide text-muted-on-ink uppercase">
          audit/bench
        </span>
        <VerdictBadge verdict="pass" />
      </div>
    </Panel>
  );
}

// ---------- Integrations ----------

function MergeGateDemo() {
  return (
    <Panel label="branch protection">
      <div className="flex items-center justify-between rounded-md border border-ink-line bg-ink px-3 py-2">
        <span className="text-[#E8ECF4]">audit/bench / do_not_ship</span>
        <span className="rounded bg-critical px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Blocked
        </span>
      </div>
      <div className="mt-2 text-[11px] text-muted-on-ink">Required check — merge button stays disabled until it clears.</div>
    </Panel>
  );
}

function MentionDemo() {
  return (
    <Panel label="pr thread">
      <div className="rounded-md border border-ink-line bg-ink px-3 py-2 text-muted-on-ink">
        @auditbench why is this flagged as critical?
      </div>
      <div className="mt-2 rounded-md border-l-4 border-l-cobalt bg-ink px-3 py-2 text-[#E8ECF4]">
        The token is logged in plain text on line 41 before the mask helper runs — anyone with log access can read it.
      </div>
    </Panel>
  );
}

const TABS = [
  {
    key: 'review',
    label: 'Repo, PR & File Review',
    intro: 'One engine, three ways in. Scan a whole repository, a single file, or a pull/merge request — same findings, same verdict, wherever the code lives.',
    rows: [
      {
        title: 'Whole-repo scans',
        body: 'Point it at a repo or a .zip and get a full pass — dependency graph, dead code, duplicates, and secrets included, alongside the AI review.',
        demo: RepoScanDemo,
      },
      {
        title: 'PR & MR native',
        body: 'Reviews scope to just the changed lines on a GitHub PR or GitLab MR — inline comments, a summary, and a commit status check land automatically.',
        demo: PrNativeDemo,
      },
    ],
  },
  {
    key: 'findings',
    label: 'Findings & Severity',
    intro: "Four lenses, four severities. Every finding is categorized and ranked, so the team knows what actually needs attention first.",
    rows: [
      {
        title: 'Security, logic, performance, architecture',
        body: 'Every audit checks all four — not a security-only tool with a linter bolted on.',
        demo: CategoriesTabDemo,
      },
      {
        title: 'Critical, high, medium, low',
        body: 'Severity drives the verdict: enough critical or high findings and the scan comes back do_not_ship, automatically.',
        demo: SeverityDemo,
      },
    ],
  },
  {
    key: 'fix',
    label: 'Fix & Re-audit',
    intro: 'Close the loop in the editor. Apply an AI-suggested fix, then re-check it before you commit — not after.',
    rows: [
      {
        title: 'Fix with AI',
        body: 'One finding or all of them — a suggested patch is generated in the browser editor, ready to review before it touches your branch.',
        demo: FixDemo,
      },
      {
        title: 'Re-audit before commit',
        body: "Re-run the check on just the edited file before committing — confirm the fix actually resolved it, don't just trust the diff.",
        demo: ReauditDemo,
      },
    ],
  },
  {
    key: 'cli',
    label: 'CLI & CI/CD',
    intro: 'Built for pipelines, not just terminals. A real CLI, a Docker image, and a gate that fails the build on its own terms.',
    rows: [
      {
        title: 'One binary, three environments',
        body: 'npm install, a prebuilt Docker image, or straight into GitHub Actions / GitLab CI — same engine underneath.',
        demo: CliInstallDemo,
      },
      {
        title: 'A gate you control',
        body: '--fail-on do_not_ship by default, --fail-on needs_work if you want it stricter, or --fail-on never to just report.',
        demo: CiFailOnDemo,
      },
    ],
  },
  {
    key: 'dashboard',
    label: 'Team Dashboard & Trends',
    intro: "See the trend, not just today's scan. Track security, performance, and tech-debt scores over time and know which files are riskiest.",
    rows: [
      {
        title: 'Score trend',
        body: 'Security, performance, and tech-debt scores plotted over the last 30 days — a regression shows up immediately, not at the next incident.',
        demo: TrendDemo,
      },
      {
        title: 'Riskiest files',
        body: 'Ranked by finding count and severity — the files most worth a second look before the next release.',
        demo: RiskiestDemo,
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Badges',
    intro: "Take the verdict wherever it's needed. Export a full report, or show it live right in the README.",
    rows: [
      {
        title: 'PDF, HTML, Markdown, JSON',
        body: 'Every scan exports in whatever format the audience needs — a PDF for a stakeholder, JSON for a script.',
        demo: ExportDemo,
      },
      {
        title: 'A live README badge',
        body: 'Shows the verdict of the most recent scan — always current, no screenshot to update by hand.',
        demo: BadgeDemo,
      },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    intro: 'Lives where the team already works. GitHub, GitLab, webhooks, and a bot that replies in-thread.',
    rows: [
      {
        title: 'Merge-blocking gate',
        body: 'A commit status check reports pass/fail on every PR and MR — wire it into branch protection and stop shippable-looking regressions before they merge.',
        demo: MergeGateDemo,
      },
      {
        title: 'Ask it directly',
        body: '@-mention the bot in any PR or MR thread and it replies in context, using the diff to answer follow-up questions.',
        demo: MentionDemo,
      },
    ],
  },
];

export function FeaturesTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <div className="bg-ink">
      <div className="border-b border-ink-line px-6">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto py-4">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActive(i)}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 font-mono text-[13px] whitespace-nowrap transition-colors ${
                i === active
                  ? 'bg-cobalt font-bold text-white'
                  : 'text-muted-on-ink hover:text-[#E8ECF4]'
              }`}
            >
              {i === active && <span className="mr-1.5 opacity-70">//</span>}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div key={tab.key} className="fade-up grid md:grid-cols-2">
          <div className="border-b border-ink-line px-6 py-10 md:col-span-2">
            <p className="max-w-2xl text-lg leading-relaxed text-muted-on-ink">
              <span className="font-bold text-[#E8ECF4]">// {tab.label}.</span> {tab.intro}
            </p>
          </div>

          {tab.rows.map((row) => {
            const Demo = row.demo;
            return (
              <Fragment key={row.title}>
                <div className="border-b border-ink-line px-6 py-10 md:border-r">
                  <p className="max-w-sm text-sm leading-relaxed text-muted-on-ink">
                    <span className="font-bold text-[#E8ECF4]">// {row.title}.</span> {row.body}
                  </p>
                </div>
                <div className="flex items-center justify-center border-b border-ink-line px-6 py-10">
                  <Demo />
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
