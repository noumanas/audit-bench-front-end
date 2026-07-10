import {
  AnalyticsOverview,
  AnalyticsTrend,
  Audit,
  GithubRepo,
  GithubStatus,
  GitlabProject,
  GitlabStatus,
  Plan,
  ScanJob,
  Usage,
  User,
} from "./types";

const API_URL =
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
  return res.json();
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

export function changePlan(slug: string): Promise<User> {
  return fetch(`${API_URL}/me/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ slug }),
  }).then((res) => unwrap<User>(res));
}

export function listPlans(): Promise<Plan[]> {
  return fetch(`${API_URL}/plans`).then((res) => unwrap<Plan[]>(res));
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

// ---------- Analytics ----------

export function getAnalyticsOverview(days: number): Promise<AnalyticsOverview> {
  return fetch(`${API_URL}/analytics/overview?days=${days}`, {
    headers: authHeaders(),
  }).then((res) => unwrap<AnalyticsOverview>(res));
}

export function getAnalyticsTrend(days: number): Promise<AnalyticsTrend> {
  return fetch(`${API_URL}/analytics/trend?days=${days}`, {
    headers: authHeaders(),
  }).then((res) => unwrap<AnalyticsTrend>(res));
}
