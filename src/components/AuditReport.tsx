import { Audit } from '@/lib/types';
import { VerdictBadge } from './VerdictBadge';
import { FindingCard } from './FindingCard';
import { PipelineBadge } from './PipelineBadge';
import { Stage1Summary } from './Stage1Summary';

export function AuditReport({ audit }: { audit: Audit }) {
  const counts = audit.findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3.5 flex items-center gap-3">
        <VerdictBadge verdict={audit.verdict} />
        <PipelineBadge aiInvoked={audit.aiInvoked} fromCache={audit.fromCache} />
        <span className="font-mono text-xs text-muted-on-paper">
          {(['critical', 'high', 'medium', 'low'] as const)
            .filter((s) => counts[s])
            .map((s) => `${counts[s]} ${s}`)
            .join(' · ') || 'no findings'}
        </span>
      </div>

      <p className="mb-4.5 text-sm leading-relaxed text-[#1C2128]">{audit.summary}</p>

      {audit.stage1 && <Stage1Summary stage1={audit.stage1} />}

      {audit.findings.map((f, i) => (
        <FindingCard key={i} finding={f} defaultOpen={i === 0} />
      ))}

      {audit.findings.length === 0 && (
        <div className="rounded-lg border border-[#BFDCCB] bg-[#E7F2EB] px-4 py-3 text-sm text-pass">
          No issues found in the selected focus areas. Still worth a human skim before merge.
        </div>
      )}
    </div>
  );
}
