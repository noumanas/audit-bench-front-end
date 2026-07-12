'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/lib/api';

function OAuthCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { loginWithOAuthCode } = useAuth();
  const [error, setError] = useState<string | null>(params.get('error'));

  useEffect(() => {
    const code = params.get('code');
    if (!code) return;
    loginWithOAuthCode(code)
      .then(() => router.replace('/app'))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.'));
    // Only ever run once per landing on this page — re-running with a
    // used-up code would just fail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-6 text-center">
        {error ? (
          <>
            <h1 className="mb-2 text-lg font-bold text-[#E8ECF4]">Login failed</h1>
            <p className="mb-5 text-sm text-muted-on-ink">{error}</p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-bold text-[#E8ECF4]">Signing you in…</h1>
            <p className="text-sm text-muted-on-ink">One moment.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackInner />
    </Suspense>
  );
}
