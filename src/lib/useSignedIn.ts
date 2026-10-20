import { useSyncExternalStore } from 'react';
import { getToken } from './api';

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
};

/** Whether this browser holds a session, for public pages that don't require one. False while server rendering. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => Boolean(getToken()),
    () => false,
  );
}
