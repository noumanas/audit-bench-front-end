'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import {
  commitFix,
  getFixFileContent,
  recheckFix,
  aiFix,
  ApiError,
  CommitFixResult,
  RecheckFixResult,
} from '@/lib/api';
import { monacoLanguageFor } from '@/lib/monacoLanguage';
import { Finding } from '@/lib/types';
import { FindingCard } from './FindingCard';

const VERDICT_LABEL: Record<string, string> = { pass: 'Pass', needs_work: 'Needs work', do_not_ship: 'Do not ship' };

export function FixInEditorModal({
  scanJobId,
  path,
  findings,
  onClose,
}: {
  scanJobId: string;
  path: string;
  findings: Finding[];
  onClose: () => void;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [result, setResult] = useState<CommitFixResult | null>(null);
  const [rechecking, setRechecking] = useState(false);
  const [recheckError, setRecheckError] = useState<string | null>(null);
  const [recheckResult, setRecheckResult] = useState<RecheckFixResult | null>(null);
  const [aiFixingKey, setAiFixingKey] = useState<string | null>(null);
  const [aiFixError, setAiFixError] = useState<string | null>(null);
  const [aiFixNotice, setAiFixNotice] = useState<string | null>(null);

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const highlightDecorations = useRef<string[]>([]);

  const handleEditorMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;
  };

  const jumpToLine = (line: number) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.focus();

    highlightDecorations.current = editor.deltaDecorations(highlightDecorations.current, [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'fix-editor-highlight-line',
          linesDecorationsClassName: 'fix-editor-highlight-line-gutter',
        },
      },
    ]);
  };

  useEffect(() => {
    getFixFileContent(scanJobId, path)
      .then((r) => setContent(r.content))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Failed to load this file.'))
      .finally(() => setLoading(false));
  }, [scanJobId, path]);

  const handleCommit = async () => {
    if (content === null) return;
    setCommitting(true);
    setCommitError(null);
    try {
      const r = await commitFix(scanJobId, path, content, message.trim() || undefined);
      setResult(r);
    } catch (err) {
      setCommitError(err instanceof ApiError ? err.message : 'Failed to commit the fix.');
    } finally {
      setCommitting(false);
    }
  };

  const handleAiFix = async (finding: Finding, key: string) => {
    if (content === null) return;
    setAiFixingKey(key);
    setAiFixError(null);
    setAiFixNotice(null);
    try {
      const r = await aiFix(scanJobId, path, content, finding);
      // Set the model directly first — React's state update below re-renders
      // asynchronously, and jumpToLine's decoration needs to land on the
      // model that's actually showing, not whatever was there a tick ago.
      editorRef.current?.setValue(r.fixedCode);
      setContent(r.fixedCode);
      setAiFixNotice(r.explanation);
      if (finding.line != null) jumpToLine(finding.line);
    } catch (err) {
      setAiFixError(err instanceof ApiError ? err.message : 'Failed to generate an AI fix.');
    } finally {
      setAiFixingKey(null);
    }
  };

  const handleRecheck = async () => {
    if (content === null) return;
    setRechecking(true);
    setRecheckError(null);
    try {
      const r = await recheckFix(scanJobId, path, content);
      setRecheckResult(r);
    } catch (err) {
      setRecheckError(err instanceof ApiError ? err.message : 'Failed to re-check this file.');
    } finally {
      setRechecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-paper-line bg-paper-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper-line px-5 py-3.5">
          <div className="min-w-0">
            <div className="mb-0.5 font-mono text-[10px] font-bold tracking-wide text-muted-on-paper uppercase">
              Fix in editor
            </div>
            <div className="truncate font-mono text-sm text-[#1C2128]">{path}</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-md border border-paper-line px-3 py-1.5 text-xs font-semibold text-muted-on-paper hover:text-[#1C2128]"
          >
            Close
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 border-r border-paper-line">
            {loading && <div className="p-5 text-sm text-muted-on-paper">Loading file…</div>}
            {loadError && (
              <div className="m-5 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-critical">
                {loadError}
              </div>
            )}
            {content !== null && (
              <Editor
                height="100%"
                theme="vs-dark"
                language={monacoLanguageFor(path)}
                value={content}
                onChange={(v) => setContent(v ?? '')}
                onMount={handleEditorMount}
                options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
              />
            )}
          </div>

          <div className="flex w-[380px] shrink-0 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              {aiFixNotice && (
                <div className="mb-3 rounded-lg border border-cobalt/40 bg-cobalt/10 px-3.5 py-2.5 text-[13px] text-cobalt">
                  <span className="font-semibold">AI applied a fix.</span> {aiFixNotice} Review the change in the
                  editor, then commit when ready.
                </div>
              )}
              {aiFixError && (
                <div className="mb-3 rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-critical">
                  {aiFixError}
                </div>
              )}
              {recheckResult ? (
                <>
                  <div
                    className={`mb-3 rounded-lg border p-3 text-[13px] ${
                      recheckResult.resolved ? 'border-pass/40 bg-pass/10 text-pass' : 'border-high/40 bg-high/10 text-high'
                    }`}
                  >
                    <div className="font-semibold">{recheckResult.resolved ? 'Resolved' : 'Still needs work'}</div>
                    <div className="mt-1 text-[12px] opacity-90">
                      Before: {recheckResult.before.findingsCount} finding
                      {recheckResult.before.findingsCount === 1 ? '' : 's'}
                      {recheckResult.before.verdict ? ` · ${VERDICT_LABEL[recheckResult.before.verdict]}` : ''} → After:{' '}
                      {recheckResult.after.findings.length} finding{recheckResult.after.findings.length === 1 ? '' : 's'} ·{' '}
                      {VERDICT_LABEL[recheckResult.after.verdict]}
                    </div>
                  </div>
                  <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
                    {recheckResult.after.findings.length} finding{recheckResult.after.findings.length === 1 ? '' : 's'} now
                  </div>
                  {recheckResult.after.findings.length === 0 ? (
                    <p className="text-sm text-muted-on-paper">No issues found on re-check.</p>
                  ) : (
                    recheckResult.after.findings.map((f, i) => (
                      <FindingCard
                        key={i}
                        finding={f}
                        onLineClick={jumpToLine}
                        onFixWithAi={() => handleAiFix(f, `recheck-${i}`)}
                        fixingWithAi={aiFixingKey === `recheck-${i}`}
                        fixWithAiDisabled={aiFixingKey !== null && aiFixingKey !== `recheck-${i}`}
                      />
                    ))
                  )}
                </>
              ) : (
                <>
                  <div className="mb-2 font-mono text-[11px] font-bold tracking-wide text-muted-on-paper uppercase">
                    {findings.length} finding{findings.length === 1 ? '' : 's'} in this file
                  </div>
                  {findings.length === 0 ? (
                    <p className="text-sm text-muted-on-paper">No findings to reference — edit freely.</p>
                  ) : (
                    findings.map((f, i) => (
                      <FindingCard
                        key={i}
                        finding={f}
                        onLineClick={jumpToLine}
                        onFixWithAi={() => handleAiFix(f, `main-${i}`)}
                        fixingWithAi={aiFixingKey === `main-${i}`}
                        fixWithAiDisabled={aiFixingKey !== null && aiFixingKey !== `main-${i}`}
                      />
                    ))
                  )}
                </>
              )}
            </div>

            <div className="border-t border-paper-line p-4">
              {result ? (
                <div className="space-y-3">
                  <div className="space-y-2 rounded-lg border border-pass/40 bg-pass/10 p-3 text-[13px] text-pass">
                    <div className="font-semibold">{result.created ? 'Pull request opened' : 'Commit pushed'}</div>
                    <div className="flex flex-col gap-1">
                      <a href={result.commitUrl} target="_blank" rel="noreferrer" className="underline">
                        View commit
                      </a>
                      {result.pullRequestUrl && (
                        <a href={result.pullRequestUrl} target="_blank" rel="noreferrer" className="underline">
                          {result.created ? 'View pull request' : 'View on the open PR/MR'}
                        </a>
                      )}
                    </div>
                  </div>

                  {recheckError && (
                    <div className="rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-critical">
                      {recheckError}
                    </div>
                  )}
                  <button
                    onClick={handleRecheck}
                    disabled={rechecking}
                    className="w-full cursor-pointer rounded-lg border border-cobalt px-4 py-2.5 text-sm font-bold text-cobalt disabled:cursor-wait disabled:opacity-50"
                  >
                    {rechecking ? 'Re-checking…' : recheckResult ? 'Re-check again' : 'Re-check — is this resolved?'}
                  </button>
                </div>
              ) : (
                <>
                  {commitError && (
                    <div className="mb-2 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-critical">
                      {commitError}
                    </div>
                  )}
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Commit message (optional)"
                    className="mb-2 w-full rounded-md border border-paper-line bg-paper px-2.5 py-1.5 text-xs text-[#1C2128] outline-none placeholder:text-muted-on-paper/70"
                  />
                  <button
                    onClick={handleCommit}
                    disabled={committing || content === null}
                    className="w-full cursor-pointer rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {committing ? 'Committing…' : 'Commit fix'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
