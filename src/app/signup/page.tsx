'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';
import { OAuthButtons } from '@/components/OAuthButtons';
import { consumePendingInvite } from '@/lib/pendingInvite';

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invitedEmail = params.get('email');
    if (invitedEmail) setEmail(invitedEmail);
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name || undefined);
      const pendingInvite = consumePendingInvite();
      router.push(pendingInvite ? `/invite/${pendingInvite}` : '/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="shadow-panel fade-up w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-7"
      >
        <div className="mb-5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
          <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt uppercase">
            Get started
          </span>
        </div>
        <h1 className="mb-1 text-xl font-bold tracking-tight text-[#E8ECF4]">Create an account</h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-on-ink">
          Starts on the Free plan — 5 AI audits/day, 20/month. Local checks (lint, types,
          complexity) are unlimited and don't count against that.
        </p>

        <OAuthButtons />

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none transition-colors focus:border-cobalt focus:ring-1 focus:ring-cobalt/40"
        />

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none transition-colors focus:border-cobalt focus:ring-1 focus:ring-cobalt/40"
        />

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none transition-colors focus:border-cobalt focus:ring-1 focus:ring-cobalt/40"
        />

        {error && (
          <div className="mb-4 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-px disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="mt-5 text-center text-xs text-muted-on-ink">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cobalt hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
