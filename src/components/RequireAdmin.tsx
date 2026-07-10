'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!isAdmin) {
      router.replace('/app/dashboard');
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center">
        <div className="text-sm text-muted-on-ink">Loading…</div>
      </div>
    );
  }

  return <>{children}</>;
}
