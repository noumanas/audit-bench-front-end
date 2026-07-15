import {
  AdminUser,
  AnalyticsOverview,
  AnalyticsTrend,
  Audit,
  ChangePlanResult,
  Finding,
  GithubRepo,
  GithubStatus,
  GitlabProject,
  GitlabStatus,
  InvitePreview,
  OrgRole,
  OrganizationDetail,
  OrganizationInvite,
  Plan,
  PlanRequest,
  ScanJob,
  Usage,
  User,
  Verdict,
  WebhookConfig,
  WebhookProvider,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://audit-bench-backend-git-242355763105.europe-west1.run.app";
const TOKEN_KEY = "auditbench_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  status: number;
  scope?: string;
  resetsAt?: string;

  constructor(
    message: string,
    status: number,
    extra?: { scope?: string; resetsAt?: string },
  ) {
    super(message);
    this.status = status;
    this.scope = extra?.scope;
    this.resetsAt = extra?.resetsAt;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) onUnauthorized?.();
    throw new ApiError(
      body.message || `Request failed with status ${res.status}`,
      res.status,
      body,
    );
  }
  // A controller handler that resolves to `null`/`undefined` (e.g. "no
  // organization yet") sends a 200 with an empty body, not the literal
  // text "null" — res.json() would throw on that, so read as text first.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ---------- Auth ----------

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export function signup(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  return fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  }).then((res) => unwrap<AuthResponse>(res));
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((res) => unwrap<AuthResponse>(res));
}

// ---------- OAuth login ("Continue with GitHub/GitLab") ----------

// Full-page redirects, not fetch calls — the browser navigates through the
// provider's own site, so these are just URLs for an <a href>, not API calls.
export function githubOAuthUrl(): string {
  return `${API_URL}/auth/github`;
}

export function gitlabOAuthUrl(): string {
  return `${API_URL}/auth/gitlab`;
}

// The redirect back lands on /oauth/callback?code=... — this exchanges that
// one-time code for a real session (see backend OAuthController).
export function exchangeOAuthCode(code: string): Promise<AuthResponse> {
  return fetch(`${API_URL}/auth/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  }).then((res) => unwrap<AuthResponse>(res));
}

export function getMe(): Promise<User> {
  return fetch(`${API_URL}/me`, { headers: authHeaders() }).then((res) =>
    unwrap<User>(res),
  );
}

export function getUsage(): Promise<Usage> {
  return fetch(`${API_URL}/me/usage`, { headers: authHeaders() }).then((res) =>
    unwrap<Usage>(res),
  );
}

export function changePlan(slug: string): Promise<ChangePlanResult> {
  return fetch(`${API_URL}/me/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ slug }),
  }).then((res) => unwrap<ChangePlanResult>(res));
}

export function getMyPlanRequests(): Promise<PlanRequest[]> {
  return fetch(`${API_URL}/me/plan-requests`, { headers: authHeaders() }).then((res) =>
    unwrap<PlanRequest[]>(res),
  );
}

export function listPlans(): Promise<Plan[]> {
  return fetch(`${API_URL}/plans`).then((res) => unwrap<Plan[]>(res));
}

// ---------- Organization ----------

export function getMyOrganization(): Promise<OrganizationDetail | null> {
  return fetch(`${API_URL}/organization`, { headers: authHeaders() }).then((res) =>
    unwrap<OrganizationDetail | null>(res),
  );
}

export function createOrganization(name: string): Promise<OrganizationDetail> {
  return fetch(`${API_URL}/organization`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name }),
  }).then((res) => unwrap<OrganizationDetail>(res));
}

export function inviteToOrganization(email: string, role: OrgRole): Promise<OrganizationInvite> {
  return fetch(`${API_URL}/organization/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ email, role }),
  }).then((res) => unwrap<OrganizationInvite>(res));
}

export function revokeOrganizationInvite(inviteId: string): Promise<void> {
  return fetch(`${API_URL}/organization/invites/${inviteId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<void>(res));
}

export function getInvitePreview(token: string): Promise<InvitePreview> {
  return fetch(`${API_URL}/organization/invites/${token}/preview`).then((res) =>
    unwrap<InvitePreview>(res),
  );
}

export function acceptOrganizationInvite(token: string): Promise<OrganizationDetail> {
  return fetch(`${API_URL}/organization/invites/${token}/accept`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => unwrap<OrganizationDetail>(res));
}

export function updateOrganizationMemberRole(memberId: string, role: OrgRole): Promise<void> {
  return fetch(`${API_URL}/organization/members/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  }).then((res) => unwrap<void>(res));
}

export function removeOrganizationMember(memberId: string): Promise<void> {
  return fetch(`${API_URL}/organization/members/${memberId}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<void>(res));
}

export function leaveOrganization(): Promise<{ left: boolean; organizationDeleted: boolean }> {
  return fetch(`${API_URL}/organization/leave`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => unwrap<{ left: boolean; organizationDeleted: boolean }>(res));
}

export function deleteOrganization(): Promise<void> {
  return fetch(`${API_URL}/organization`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<void>(res));
}

// ---------- Admin ----------

export function listAdminUsers(): Promise<AdminUser[]> {
  return fetch(`${API_URL}/admin/users`, { headers: authHeaders() }).then((res) =>
    unwrap<AdminUser[]>(res),
  );
}

export function listAdminPlanRequests(status?: string): Promise<PlanRequest[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetch(`${API_URL}/admin/plan-requests${query}`, { headers: authHeaders() }).then((res) =>
    unwrap<PlanRequest[]>(res),
  );
}

export function approvePlanRequest(id: string): Promise<PlanRequest> {
  return fetch(`${API_URL}/admin/plan-requests/${id}/approve`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => unwrap<PlanRequest>(res));
}

export function rejectPlanRequest(id: string, note?: string): Promise<PlanRequest> {
  return fetch(`${API_URL}/admin/plan-requests/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ note }),
  }).then((res) => unwrap<PlanRequest>(res));
}

export function updateUserRole(userId: string, role: string): Promise<AdminUser> {
  return fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ role }),
  }).then((res) => unwrap<AdminUser>(res));
}

export function updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
  return fetch(`${API_URL}/admin/users/${userId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ isActive }),
  }).then((res) => unwrap<AdminUser>(res));
}

export function updateUserProfile(
  userId: string,
  data: { name?: string; planId?: string },
): Promise<AdminUser> {
  return fetch(`${API_URL}/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  }).then((res) => unwrap<AdminUser>(res));
}

// ---------- Audits ----------

export interface RunAuditInput {
  filename?: string;
  code: string;
  provider?: string;
  focusAreas?: string[];
}

export function runAudit(input: RunAuditInput): Promise<Audit> {
  return fetch(`${API_URL}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  }).then((res) => unwrap<Audit>(res));
}

export function getAudit(id: string): Promise<Audit> {
  return fetch(`${API_URL}/audit/${id}`, { headers: authHeaders() }).then(
    (res) => unwrap<Audit>(res),
  );
}

export function listAudits(): Promise<Audit[]> {
  return fetch(`${API_URL}/audit`, { headers: authHeaders() }).then((res) =>
    unwrap<Audit[]>(res),
  );
}

// ---------- Repository scans ----------

export function startRepositoryScan(
  file: File,
  provider?: string,
): Promise<ScanJob> {
  const form = new FormData();
  form.append("file", file);
  if (provider) form.append("provider", provider);
  return fetch(`${API_URL}/repository`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  }).then((res) => unwrap<ScanJob>(res));
}

export function getRepositoryScan(id: string): Promise<ScanJob> {
  return fetch(`${API_URL}/repository/${id}`, { headers: authHeaders() }).then(
    (res) => unwrap<ScanJob>(res),
  );
}

export function listRepositoryScans(): Promise<ScanJob[]> {
  return fetch(`${API_URL}/repository`, { headers: authHeaders() }).then(
    (res) => unwrap<ScanJob[]>(res),
  );
}

// ---------- Fix in editor ----------

export function getFixFileContent(scanJobId: string, path: string): Promise<{ content: string }> {
  return fetch(`${API_URL}/repository/${scanJobId}/fix/content?path=${encodeURIComponent(path)}`, {
    headers: authHeaders(),
  }).then((res) => unwrap<{ content: string }>(res));
}

export interface CommitFixResult {
  commitUrl: string;
  pullRequestUrl?: string;
  created: boolean;
}

export function commitFix(
  scanJobId: string,
  path: string,
  content: string,
  message?: string,
): Promise<CommitFixResult> {
  return fetch(`${API_URL}/repository/${scanJobId}/fix/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path, content, message }),
  }).then((res) => unwrap<CommitFixResult>(res));
}

export interface RecheckFixResult {
  before: { verdict: Verdict | null; findingsCount: number };
  after: { verdict: Verdict; findings: Finding[] };
  resolved: boolean;
}

export function recheckFix(scanJobId: string, path: string, content: string): Promise<RecheckFixResult> {
  return fetch(`${API_URL}/repository/${scanJobId}/fix/recheck`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path, content }),
  }).then((res) => unwrap<RecheckFixResult>(res));
}

export interface AiFixResult {
  fixedCode: string;
  explanation: string;
}

export function aiFix(
  scanJobId: string,
  path: string,
  content: string,
  finding: Finding,
): Promise<AiFixResult> {
  return fetch(`${API_URL}/repository/${scanJobId}/fix/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path, content, finding }),
  }).then((res) => unwrap<AiFixResult>(res));
}

export function aiFixAll(
  scanJobId: string,
  path: string,
  content: string,
  findings: Finding[],
): Promise<AiFixResult> {
  return fetch(`${API_URL}/repository/${scanJobId}/fix/ai/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ path, content, findings }),
  }).then((res) => unwrap<AiFixResult>(res));
}

// ---------- GitHub ----------

export function getGithubStatus(): Promise<GithubStatus> {
  return fetch(`${API_URL}/github/status`, { headers: authHeaders() }).then(
    (res) => unwrap<GithubStatus>(res),
  );
}

export function connectGithub(token: string): Promise<{ username: string }> {
  return fetch(`${API_URL}/github/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ token }),
  }).then((res) => unwrap<{ username: string }>(res));
}

export function disconnectGithub(): Promise<void> {
  return fetch(`${API_URL}/github/disconnect`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<void>(res));
}

export function listGithubRepos(): Promise<GithubRepo[]> {
  return fetch(`${API_URL}/github/repos`, { headers: authHeaders() }).then(
    (res) => unwrap<GithubRepo[]>(res),
  );
}

export function listGithubBranches(owner: string, repo: string): Promise<string[]> {
  return fetch(`${API_URL}/github/repos/${owner}/${repo}/branches`, { headers: authHeaders() }).then(
    (res) => unwrap<string[]>(res),
  );
}

export function scanGithubRepo(
  owner: string,
  repo: string,
  ref?: string,
  provider?: string,
): Promise<ScanJob> {
  return fetch(`${API_URL}/github/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ owner, repo, ref, provider }),
  }).then((res) => unwrap<ScanJob>(res));
}

export function reviewGithubPr(
  owner: string,
  repo: string,
  pullNumber: number,
  provider?: string,
): Promise<ScanJob> {
  return fetch(`${API_URL}/github/pr`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ owner, repo, pullNumber, provider }),
  }).then((res) => unwrap<ScanJob>(res));
}

// ---------- GitLab ----------

export function getGitlabStatus(): Promise<GitlabStatus> {
  return fetch(`${API_URL}/gitlab/status`, { headers: authHeaders() }).then(
    (res) => unwrap<GitlabStatus>(res),
  );
}

export function connectGitlab(token: string): Promise<{ username: string }> {
  return fetch(`${API_URL}/gitlab/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ token }),
  }).then((res) => unwrap<{ username: string }>(res));
}

export function disconnectGitlab(): Promise<void> {
  return fetch(`${API_URL}/gitlab/disconnect`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<void>(res));
}

export function listGitlabProjects(): Promise<GitlabProject[]> {
  return fetch(`${API_URL}/gitlab/projects`, { headers: authHeaders() }).then(
    (res) => unwrap<GitlabProject[]>(res),
  );
}

export function listGitlabBranches(projectId: number): Promise<string[]> {
  return fetch(`${API_URL}/gitlab/projects/${projectId}/branches`, { headers: authHeaders() }).then(
    (res) => unwrap<string[]>(res),
  );
}

export function scanGitlabProject(
  projectId: number,
  ref?: string,
  projectPath?: string,
  provider?: string,
): Promise<ScanJob> {
  return fetch(`${API_URL}/gitlab/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ projectId, ref, projectPath, provider }),
  }).then((res) => unwrap<ScanJob>(res));
}

export function reviewGitlabMr(
  projectId: number,
  mrIid: number,
  projectPath?: string,
  provider?: string,
): Promise<ScanJob> {
  return fetch(`${API_URL}/gitlab/mr`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ projectId, mrIid, projectPath, provider }),
  }).then((res) => unwrap<ScanJob>(res));
}

// ---------- Badge ----------

export function getBadgeToken(): Promise<{ badgeToken: string }> {
  return fetch(`${API_URL}/me/badge-token`, { headers: authHeaders() }).then((res) =>
    unwrap<{ badgeToken: string }>(res),
  );
}

export function rotateBadgeToken(): Promise<{ badgeToken: string }> {
  return fetch(`${API_URL}/me/badge-token/rotate`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => unwrap<{ badgeToken: string }>(res));
}

// ---------- API key (CLI / CI-CD) ----------

export function getApiKey(): Promise<{ apiKey: string }> {
  return fetch(`${API_URL}/me/api-key`, { headers: authHeaders() }).then((res) =>
    unwrap<{ apiKey: string }>(res),
  );
}

export function rotateApiKey(): Promise<{ apiKey: string }> {
  return fetch(`${API_URL}/me/api-key/rotate`, {
    method: "POST",
    headers: authHeaders(),
  }).then((res) => unwrap<{ apiKey: string }>(res));
}

// ---------- Webhooks (conversational PR/MR chat) ----------

export function listWebhookConfigs(): Promise<WebhookConfig[]> {
  return fetch(`${API_URL}/webhooks/configs`, { headers: authHeaders() }).then((res) =>
    unwrap<WebhookConfig[]>(res),
  );
}

export function createWebhookConfig(
  provider: WebhookProvider,
  repoIdentifier: string,
): Promise<WebhookConfig> {
  return fetch(`${API_URL}/webhooks/configs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ provider, repoIdentifier }),
  }).then((res) => unwrap<WebhookConfig>(res));
}

export function deleteWebhookConfig(id: string): Promise<{ deleted: boolean }> {
  return fetch(`${API_URL}/webhooks/configs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((res) => unwrap<{ deleted: boolean }>(res));
}

// ---------- Analytics ----------

function repoQuery(repo?: string): string {
  return repo ? `&repo=${encodeURIComponent(repo)}` : '';
}

export function getAnalyticsOverview(days: number, repo?: string): Promise<AnalyticsOverview> {
  return fetch(`${API_URL}/analytics/overview?days=${days}${repoQuery(repo)}`, {
    headers: authHeaders(),
  }).then((res) => unwrap<AnalyticsOverview>(res));
}

export function getAnalyticsTrend(days: number, repo?: string): Promise<AnalyticsTrend> {
  return fetch(`${API_URL}/analytics/trend?days=${days}${repoQuery(repo)}`, {
    headers: authHeaders(),
  }).then((res) => unwrap<AnalyticsTrend>(res));
}

export function listAnalyticsRepos(): Promise<string[]> {
  return fetch(`${API_URL}/analytics/repos`, { headers: authHeaders() }).then((res) => unwrap<string[]>(res));
}
