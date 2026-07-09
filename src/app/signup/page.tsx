'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name || undefined);
      router.push('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-6"
      >
        <h1 className="mb-1 text-lg font-bold text-[#E8ECF4]">Create an account</h1>
        <p className="mb-5 text-sm text-muted-on-ink">
          Starts on the Free plan — 5 AI audits/day, 20/month. Local checks (lint, types,
          complexity) are unlimited and don't count against that.
        </p>

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none"
        />

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none"
        />

        <label className="mb-1 block text-xs font-semibold text-muted-on-ink">Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-ink-line bg-ink px-3 py-2 text-sm text-[#E8ECF4] outline-none"
        />

        {error && (
          <div className="mb-4 rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="mt-4 text-center text-xs text-muted-on-ink">
          Already have an account?{' '}
          <Link href="/login" className="text-cobalt">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
