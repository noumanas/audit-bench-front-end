'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';
import { OAuthButtons } from '@/components/OAuthButtons';
import { consumePendingInvite } from '@/lib/pendingInvite';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const pendingInvite = consumePendingInvite();
      router.push(pendingInvite ? `/invite/${pendingInvite}` : '/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
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
            Welcome back
          </span>
        </div>
        <h1 className="mb-1 text-xl font-bold tracking-tight text-[#E8ECF4]">Log in</h1>
        <p className="mb-6 text-sm text-muted-on-ink">Continue auditing where you left off.</p>

        <OAuthButtons />

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
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-5 text-center text-xs text-muted-on-ink">
          No account?{' '}
          <Link href="/signup" className="font-semibold text-cobalt hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
