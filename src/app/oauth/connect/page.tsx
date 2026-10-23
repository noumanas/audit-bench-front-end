'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, completeHostConnect, getToken } from '@/lib/api';

const NAMES = { github: 'GitHub', gitlab: 'GitLab' } as const;

/** Where GitHub/GitLab send the browser back after "Connect GitHub/GitLab" on the repository page. */
function ConnectReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get('provider');
  const provider = raw === 'github' || raw === 'gitlab' ? raw : null;
  const back = `/app/repository?source=${provider ?? 'github'}`;
  const [error, setError] = useState<string | null>(() => {
    if (!provider) return 'Unknown provider.';
    if (params.get('error')) return params.get('error_description') || 'The connection was cancelled.';
    if (!params.get('code') || !params.get('state')) return 'The connection was cancelled.';
    if (!getToken()) return 'Your session ended. Sign in again, then click Connect.';
    return null;
  });

  useEffect(() => {
    if (error || !provider) return;
    completeHostConnect(provider, params.get('code') as string, params.get('state') as string)
      .then(() => router.replace(back))
      .catch((err) =>
        setError(
          err instanceof ApiError || err instanceof Error ? err.message : 'Connecting failed. Please try again.',
        ),
      );
    // Runs once: the provider's code can only be used once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = provider ? NAMES[provider] : 'your account';
  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-ink-line bg-ink-soft p-6 text-center">
        {error ? (
          <>
            <h1 className="mb-2 text-lg font-bold text-[#E8ECF4]">Couldn&apos;t connect {name}</h1>
            <p className="mb-5 text-sm text-muted-on-ink">{error}</p>
            <Link href={back} className="inline-block rounded-lg bg-cobalt px-4 py-2.5 text-sm font-bold text-white">
              Back to repositories
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-bold text-[#E8ECF4]">Connecting {name}…</h1>
            <p className="text-sm text-muted-on-ink">One moment.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConnectReturnPage() {
  return (
    <Suspense fallback={null}>
      <ConnectReturnInner />
    </Suspense>
  );
}
