'use client';

import { useEffect, useRef, useState } from 'react';
import { getRepositoryScan } from './api';
import { ScanJob } from './types';

const POLL_INTERVAL_MS = 2000;

/** Fetches a scan by ID and keeps polling while it's queued/processing. */
export function usePollScan(id: string | null) {
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setScan(null);
    setError(null);
    if (!id) return;

    setLoading(true);
    const fetchOnce = async () => {
      try {
        const updated = await getRepositoryScan(id);
        setScan(updated);
        setLoading(false);
        if (updated.status === 'completed' || updated.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scan.');
        setLoading(false);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    };

    fetchOnce();
    pollRef.current = setInterval(fetchOnce, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id]);

  return { scan, error, loading };
}
