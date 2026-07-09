'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { runAudit, ApiError } from '@/lib/api';
import { Audit } from '@/lib/types';
import { AuditReport } from '@/components/AuditReport';
import { AuditLoader } from '@/components/AuditLoader';
import { UsageBar } from '@/components/UsageBar';
import { RequireAuth } from '@/components/RequireAuth';

const MAX_FILE_CHARS = 200_000;

const MONACO_LANGUAGE_BY_EXT: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  rb: 'ruby',
  go: 'go',
  java: 'java',
  kt: 'kotlin',
  php: 'php',
  cs: 'csharp',
  rs: 'rust',
  sql: 'sql',
  json: 'json',
  yml: 'yaml',
  yaml: 'yaml',
  html: 'html',
  css: 'css',
  md: 'markdown',
};

function monacoLanguageFor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return MONACO_LANGUAGE_BY_EXT[ext] ?? 'typescript';
}

const FOCUS_AREAS = [
  { id: 'Security', label: 'Security & OWASP' },
  { id: 'Logic', label: 'Logic & edge cases' },
  { id: 'Performance', label: 'Performance' },
  { id: 'Architecture', label: 'Architecture & maintainability' },
];

const SAMPLE = {
  filename: 'send-invoice.ts',
  code: `// Supabase edge function (Deno) — needs review
const express = require("express");
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let cachedTotal = 0;

Deno.serve(async (req) => {
  const { userId, invoiceId } = await req.json();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  cachedTotal = cachedTotal + invoice.amount;

  await supabase
    .from("invoices")
    .update({ status: "sent", total_sent: cachedTotal })
    .eq("id", invoiceId);

  return new Response(JSON.stringify({ ok: true, total: cachedTotal }));
});`,
};

export default function AuditPage() {
  const [filename, setFilename] = useState('');
  const [code, setCode] = useState('');
  const [focus, setFocus] = useState<Record<string, boolean>>({
    Security: true,
    Logic: true,
    Performance: true,
    Architecture: true,
  });
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [usageRefresh, setUsageRefresh] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFocus = (id: string) => setFocus((p) => ({ ...p, [id]: !p[id] }));

  const loadSample = () => {
    setFilename(SAMPLE.filename);
    setCode(SAMPLE.code);
    setAudit(null);
    setError(null);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!selected) return;

    try {
      const text = await selected.text();
      if (text.length > MAX_FILE_CHARS) {
        setError(`That file is too large (${text.length.toLocaleString()} characters, max ${MAX_FILE_CHARS.toLocaleString()}).`);
        return;
      }

      setFilename(selected.name);
      setCode(text);
      setAudit(null);
      setError(null);
    } catch {
      setError('Could not read that file. Try a different one.');
    }
  };

  const handleRunAudit = async () => {
    if (!code.trim()) {
      setError('Paste some code first, or load the sample.');
      return;
    }
    setLoading(true);
    setError(null);
    setLimitHit(false);
    setAudit(null);

    const focusAreas = FOCUS_AREAS.filter((a) => focus[a.id]).map((a) => a.label);

    try {
      const result = await runAudit({ filename, code, focusAreas });
      setAudit(result);
      setUsageRefresh((n) => n + 1);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setLimitHit(true);
        setError(err.message);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'The audit failed. Run it again — this usually resolves on retry.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
    <div className="flex min-h-[calc(100vh-60px)] flex-wrap">
      {/* Left: code specimen */}
      <section className="flex flex-1 basis-[420px] flex-col gap-3.5 bg-ink p-6">
        <UsageBar refreshKey={usageRefresh} />

        <div className="flex items-center gap-2.5">
          <input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="filename (e.g. send-invoice.ts)"
            className="flex-1 rounded-md border border-ink-line bg-ink-soft px-3 py-2 font-mono text-[13px] text-[#E8ECF4] outline-none placeholder:text-muted-on-ink"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-md border border-ink-line px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-on-ink"
          >
            Upload file
          </button>
          <button
            onClick={loadSample}
            className="cursor-pointer rounded-md border border-ink-line px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-on-ink"
          >
            Load sample
          </button>
        </div>

        <div className="min-h-[320px] flex-1 overflow-hidden rounded-lg border border-ink-line">
          <Editor
            height="100%"
            theme="vs-dark"
            language={monacoLanguageFor(filename || 'untitled.ts')}
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FOCUS_AREAS.map((a) => {
            const on = focus[a.id];
            return (
              <button
                key={a.id}
                onClick={() => toggleFocus(a.id)}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${
                  on ? 'border-cobalt bg-cobalt text-white' : 'border-ink-line text-muted-on-ink'
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRunAudit}
          disabled={loading}
          className={`cursor-pointer rounded-lg px-5 py-3 text-[15px] font-bold text-white ${
            loading ? 'cursor-wait bg-cobalt-dark opacity-80' : 'bg-cobalt'
          }`}
        >
          {loading ? 'Auditing…' : 'Run audit'}
        </button>

        {error && (
          <div className="rounded-lg border border-critical/40 bg-critical/10 px-3.5 py-2.5 text-[13px] text-[#F3B7BF]">
            {error}
            {limitHit && (
              <>
                {' '}
                <Link href="/app/dashboard" className="font-semibold underline">
                  Upgrade your plan
                </Link>
                .
              </>
            )}
          </div>
        )}
      </section>

      {/* Right: findings report */}
      <section className="flex-1 basis-[420px] border-l border-ink-line bg-paper p-6">
        {!audit && !loading && (
          <div className="mx-auto mt-16 max-w-md text-center">
            <div className="mb-2.5 font-mono text-[13px] tracking-wide text-muted-on-paper uppercase">
              Findings report
            </div>
            <p className="text-sm leading-relaxed text-muted-on-paper">
              Paste code on the left and run an audit. Findings land here, ordered by severity,
              each with a root cause and concrete fix. Try the sample to see it in action.
            </p>
          </div>
        )}

        {loading && <AuditLoader />}

        {audit && <AuditReport audit={audit} />}
      </section>
    </div>
    </RequireAuth>
  );
}
