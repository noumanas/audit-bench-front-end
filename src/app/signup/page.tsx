'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';
import { OAuthButtons } from '@/components/OAuthButtons';
import { PasswordInput } from '@/components/PasswordInput';
import { consumePendingInvite } from '@/lib/pendingInvite';
import { AuthShell, authButtonClass, authInputClass, authLabelClass } from '@/components/auth/AuthShell';
import { ArrowRightIcon } from '@/components/icons';

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
      router.push(pendingInvite ? `/invite/${pendingInvite}` : '/app/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create an account"
      subtitle={
        <>
          Starts on the Free plan — 5 AI audits/day, 20/month. Local checks (lint, types,
          complexity) are unlimited and don&apos;t count against that.
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <OAuthButtons />

        <label className={authLabelClass}>Name (optional)</label>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mb-4 ${authInputClass}`}
        />

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
          minLength={8}
          autoComplete="new-password"
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
          {loading ? 'Creating account…' : 'Sign up'}
          {!loading && <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>

        <p className="mt-6 text-center text-sm text-muted-on-ink">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-cobalt hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
