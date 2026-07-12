// Bridges the gap between "visited an invite link while logged out" and
// "finished logging in/signing up" — login/signup normally redirect to
// /app, but if a pending invite token is stashed here, they redirect back
// to /invite/:token instead so the invite auto-accepts on return.
const KEY = 'auditbench_pending_invite';

export function setPendingInvite(token: string): void {
  window.sessionStorage.setItem(KEY, token);
}

export function consumePendingInvite(): string | null {
  const token = window.sessionStorage.getItem(KEY);
  if (token) window.sessionStorage.removeItem(KEY);
  return token;
}
