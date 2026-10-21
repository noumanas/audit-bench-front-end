'use client';

import { useEffect, useMemo, useState } from 'react';
import { createReviewRule, deleteReviewRule, getReviewOutcomes, listReviewRules, updateReviewRule } from '@/lib/api';
import type { OutcomeCounts, ReviewOutcomes, ReviewRule, ReviewRuleKind } from '@/lib/types';
import { RequireAuth } from '@/components/RequireAuth';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/AuthContext';

const KINDS: Record<ReviewRuleKind, { label: string; hint: string; placeholder: string }> = {
  instruction: {
    label: 'Instruction',
    hint: 'Guidance the AI follows on every review.',
    placeholder: 'e.g. We validate input with zod at the API boundary, so don’t flag missing checks inside services.',
  },
  ignore_path: {
    label: 'Ignore files',
    hint: 'A path pattern. Matching files are never reviewed.',
    placeholder: 'e.g. src/generated/**   or   *.min.js',
  },
  suppress: {
    label: "Don't flag",
    hint: 'A kind of comment your team doesn’t want.',
    placeholder: 'e.g. console.log statements in scripts/',
  },
};

export default function ReviewRulesPage() {
  return (
    <RequireAuth>
      <RulesInner />
    </RequireAuth>
  );
}

function RulesInner() {
  const { user } = useAuth();
  const [rules, setRules] = useState<ReviewRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listReviewRules()
      .then(setRules)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your rules.'));
  }, []);

  const manual = useMemo(() => (rules ?? []).filter((r) => r.source === 'manual'), [rules]);
  const learned = useMemo(() => (rules ?? []).filter((r) => r.source === 'learned'), [rules]);
  const canShare = Boolean(user?.organization) && (user?.orgRole === 'owner' || user?.orgRole === 'admin');

  const replace = (rule: ReviewRule) => setRules((rs) => (rs ?? []).map((r) => (r.id === rule.id ? rule : r)));
  const remove = (id: string) => setRules((rs) => (rs ?? []).filter((r) => r.id !== id));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <PageHeader
        kicker="Review"
        title="Review rules"
        description="Teach Audit Bench Ai how your team reviews. Rules apply to every pull request review and repository scan. It also learns on its own: 👍/👎 on its GitHub comments, “not an issue” replies and Won’t fix in reports all count."
      />

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-critical/40 bg-critical/10 px-4 py-3 text-[13px] text-[#F3B7BF]"
        >
          {error}
        </p>
      )}

      <OutcomesCard />

      <AddRule canShare={canShare} onAdded={(r) => setRules((rs) => [r, ...(rs ?? [])])} onError={setError} />
      <p className="-mt-5 mb-8 text-[12px] leading-relaxed text-muted-on-ink">
        Prefer keeping conventions in the code? Commit an <code className="font-mono">auditbench.md</code> file (or{' '}
        <code className="font-mono">.github/auditbench.md</code>) to the repository, written in plain English. Every
        review of that repository follows it.
      </p>

      <Section
        title="Your rules"
        empty="No rules yet. Add one above, for example a folder to skip or a convention the AI should know."
        loading={rules === null}
        rules={manual}
        onChange={replace}
        onRemove={remove}
        onError={setError}
      />

      <Section
        title="Learned from your team"
        empty="Nothing learned yet. When your team dismisses the same kind of comment twice in a repository (👎, “not an issue”, or Won’t fix), Audit Bench Ai stops raising it and lists it here."
        loading={rules === null}
        rules={learned}
        onChange={replace}
        onRemove={remove}
        onError={setError}
      />
    </div>
  );
}

function AddRule({
  canShare,
  onAdded,
  onError,
}: {
  canShare: boolean;
  onAdded: (r: ReviewRule) => void;
  onError: (msg: string | null) => void;
}) {
  const [kind, setKind] = useState<ReviewRuleKind>('instruction');
  const [text, setText] = useState('');
  const [repo, setRepo] = useState('');
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setBusy(true);
    onError(null);
    try {
      onAdded(await createReviewRule({ kind, text: text.trim(), repo: repo.trim() || undefined, shared }));
      setText('');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not add the rule.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="mb-8 rounded-lg border border-ink-line bg-ink-soft p-4"
    >
      <div role="radiogroup" aria-label="Kind of rule" className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(KINDS) as ReviewRuleKind[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-semibold ${
              kind === k ? 'bg-cobalt text-white' : 'border border-ink-line text-muted-on-ink hover:text-[#E8ECF4]'
            }`}
          >
            {KINDS[k].label}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[12px] text-muted-on-ink">{KINDS[kind].hint}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={KINDS[kind].placeholder}
        rows={kind === 'instruction' ? 3 : 1}
        maxLength={500}
        className={`w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-[13px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt ${
          kind === 'ignore_path' ? 'font-mono' : ''
        }`}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repo (optional: every repository)"
          aria-label="Only for this repository"
          className="min-w-[14rem] flex-1 rounded-md border border-ink-line bg-ink px-3 py-1.5 font-mono text-[12px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink focus:border-cobalt"
        />
        {canShare && (
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted-on-ink">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="h-3.5 w-3.5 accent-cobalt"
            />
            Apply to my whole team
          </label>
        )}
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="cursor-pointer rounded-md bg-cobalt px-4 py-1.5 text-sm font-bold text-white hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Adding…' : 'Add rule'}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  empty,
  loading,
  rules,
  onChange,
  onRemove,
  onError,
}: {
  title: string;
  empty: string;
  loading: boolean;
  rules: ReviewRule[];
  onChange: (r: ReviewRule) => void;
  onRemove: (id: string) => void;
  onError: (msg: string | null) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-mono text-[11px] font-bold tracking-wide text-muted-on-ink uppercase">
        {title}
        {rules.length > 0 && ` (${rules.length})`}
      </h2>
      {loading ? (
        <div className="h-20 animate-pulse rounded-lg bg-ink-soft" />
      ) : rules.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-line px-4 py-4 text-[13px] text-muted-on-ink">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-ink-line overflow-hidden rounded-lg border border-ink-line bg-ink-soft">
          {rules.map((r) => (
            <RuleRow key={r.id} rule={r} onChange={onChange} onRemove={onRemove} onError={onError} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RuleRow({
  rule,
  onChange,
  onRemove,
  onError,
}: {
  rule: ReviewRule;
  onChange: (r: ReviewRule) => void;
  onRemove: (id: string) => void;
  onError: (msg: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    onError(null);
    try {
      await fn();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'That did not work.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`flex flex-wrap items-start gap-x-4 gap-y-2 px-4 py-3 ${rule.enabled ? '' : 'opacity-60'}`}>
      <div className="min-w-[14rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-ink-line px-1.5 py-px font-mono text-[10px] font-bold text-muted-on-ink uppercase">
            {KINDS[rule.kind]?.label ?? rule.kind}
          </span>
          <span className="text-[11px] text-muted-on-ink">
            {rule.repo ? <span className="font-mono">{rule.repo}</span> : 'All repositories'}
            {rule.organizationId ? ' · whole team' : ' · just you'}
            {rule.source === 'learned' && ` · dismissed ${rule.evidence} time${rule.evidence === 1 ? '' : 's'}`}
          </span>
        </div>
        <p className={`mt-1 text-[13px] break-words text-[#E8ECF4] ${rule.kind === 'ignore_path' ? 'font-mono' : ''}`}>
          {rule.text}
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-2 pt-0.5 text-[12px] text-muted-on-ink">
        <input
          type="checkbox"
          checked={rule.enabled}
          disabled={busy}
          onChange={() => void run(async () => onChange(await updateReviewRule(rule.id, { enabled: !rule.enabled })))}
          className="h-3.5 w-3.5 accent-cobalt"
        />
        On
      </label>
      <button
        disabled={busy}
        onClick={() => {
          if (window.confirm('Delete this rule?')) {
            void run(async () => {
              await deleteReviewRule(rule.id);
              onRemove(rule.id);
            });
          }
        }}
        className="cursor-pointer pt-0.5 text-[12px] text-muted-on-ink hover:text-[#F3B7BF] disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}

/** How useful reviews were: what happened to findings by the time their PRs closed. */
function OutcomesCard() {
  const [data, setData] = useState<ReviewOutcomes | null>(null);
  useEffect(() => {
    getReviewOutcomes()
      .then(setData)
      .catch(() => setData(null));
  }, []);
  if (!data) return null;
  const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : '–');
  const cats = Object.entries(data.byCategory).sort((a, b) => b[1].total - a[1].total);
  return (
    <section className="mb-8 rounded-lg border border-ink-line bg-ink-soft p-4">
      <h2 className="text-sm font-bold text-[#E8ECF4]">What happened to findings (last {data.days} days)</h2>
      {data.total.total === 0 ? (
        <p className="mt-1 text-[12px] leading-relaxed text-muted-on-ink">
          Nothing yet. When a reviewed pull request closes, each GitHub App comment is counted as accepted (thread
          resolved, the code changed, or 👍), dismissed (👎) or ignored.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Accepted" value={pct(data.total.accepted, data.total.total)} tone="text-pass" />
            <Stat label="Dismissed" value={pct(data.total.dismissed, data.total.total)} tone="text-[#F3B7BF]" />
            <Stat label="Ignored" value={pct(data.total.ignored, data.total.total)} tone="text-muted-on-ink" />
          </div>
          <p className="mt-2 text-[11px] text-muted-on-ink">
            {data.total.total} findings on closed pull requests. Accepted means the thread was resolved, the code it was
            on changed, or someone reacted 👍.
          </p>
          {cats.length > 1 && (
            <ul className="mt-3 divide-y divide-ink-line overflow-hidden rounded-md border border-ink-line">
              {cats.map(([cat, c]) => (
                <CategoryRow key={cat} cat={cat} c={c} pct={pct} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-md border border-ink-line bg-ink px-3 py-2">
      <div className={`text-lg font-bold tabular-nums ${tone}`}>{value}</div>
      <div className="text-[11px] text-muted-on-ink">{label}</div>
    </div>
  );
}

function CategoryRow({ cat, c, pct }: { cat: string; c: OutcomeCounts; pct: (n: number, of: number) => string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-ink px-3 py-2 text-[12px]">
      <span className="min-w-[8rem] flex-1 font-semibold text-[#E8ECF4]">{cat}</span>
      <span className="text-pass">{pct(c.accepted, c.total)} accepted</span>
      <span className="text-[#F3B7BF]">{pct(c.dismissed, c.total)} dismissed</span>
      <span className="text-muted-on-ink">
        {pct(c.ignored, c.total)} ignored · {c.total}
      </span>
    </li>
  );
}
