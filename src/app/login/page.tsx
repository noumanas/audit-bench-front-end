'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';
import { OAuthButtons } from '@/components/OAuthButtons';
import { PasswordInput } from '@/components/PasswordInput';
import { consumePendingInvite } from '@/lib/pendingInvite';
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from '@/components/auth/AuthShell';
import { ArrowRightIcon } from '@/components/icons';

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
      // Same-site paths only ("/scan/x", never "//evil.com"), so the link can't redirect off-site.
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      router.push(pendingInvite ? `/invite/${pendingInvite}` : (safeNext ?? '/app/dashboard'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      subtitle="Continue auditing where you left off — every pull request reviewed before it reaches main."
    >
      <form onSubmit={handleSubmit}>
        <OAuthButtons />

        <label className={authLabelClass}>Work email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mb-4 ${authInputClass}`}
        />

        <label className={authLabelClass}>Password</label>
        <PasswordInput
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          wrapperClassName="mb-6"
          className={authInputClass}
        />

        {error && (
          <div className="mb-4 rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-xs text-[#F3B7BF]">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? 'Logging in…' : 'Log in'}
          {!loading && <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>

        <p className="mt-6 text-center text-sm text-muted-on-ink">
          No account?{' '}
          <Link href="/signup" className="font-semibold text-cobalt hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
