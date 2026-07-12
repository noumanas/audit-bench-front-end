export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Verdict = 'pass' | 'needs_work' | 'do_not_ship';
export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type ScanSourceType = 'zip' | 'github_repo' | 'github_pr' | 'gitlab_repo' | 'gitlab_mr';
export type Role = 'user' | 'admin' | 'super_admin';
export type PlanRequestStatus = 'pending' | 'approved' | 'rejected';
export type OrgRole = 'owner' | 'admin' | 'member';

export interface Plan {
  id: string;
  slug: string;
  name: string;
  priceMonthlyCents: number;
  dailyAuditLimit: number | null;
  monthlyAuditLimit: number | null;
  repositoryScan: boolean;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  plan: Plan;
  role: Role;
  badgeToken: string | null;
  organization: OrganizationSummary | null;
  orgRole: OrgRole | null;
}

export type WebhookProvider = 'github' | 'gitlab';

export interface WebhookConfig {
  id: string;
  provider: WebhookProvider;
  repoIdentifier: string;
  secret: string;
  createdAt: string;
}

export interface PlanRequestUserSummary {
  id: string;
  email: string;
  name: string | null;
}

export interface PlanRequest {
  id: string;
  status: PlanRequestStatus;
  requestedPlan: Plan;
  // Present on admin listings (GET /admin/plan-requests), absent on a
  // user's own listing (GET /me/plan-requests) — already scoped to them.
  user?: PlanRequestUserSummary;
  // Set when this request targets an organization's shared plan rather
  // than the requester's personal one (see UsersService.changePlan).
  organization?: { id: string; name: string } | null;
  reviewedBy: PlanRequestUserSummary | null;
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ChangePlanResult {
  applied: boolean;
  user?: User;
  request?: PlanRequest;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  plan: Plan;
  role: Role;
  githubUsername: string | null;
  isActive: boolean;
}

export interface Usage {
  plan: Plan;
  // 'organization' when this quota is the team's shared pool rather than
  // this user's own — see QuotaService.getUsage.
  scope: 'personal' | 'organization';
  organizationName: string | null;
  dailyUsed: number;
  dailyLimit: number | null;
  monthlyUsed: number;
  monthlyLimit: number | null;
  dailyResetsAt: string;
  monthlyResetsAt: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  name: string | null;
  orgRole: OrgRole;
  createdAt: string;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  role: OrgRole;
  createdAt: string;
  expiresAt: string;
  inviteUrl: string;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  myRole: OrgRole;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
}

export interface InvitePreview {
  organizationName: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresAt: string;
}

export interface GithubStatus {
  connected: boolean;
  username: string | null;
}

export interface GithubRepo {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitlabStatus {
  connected: boolean;
  username: string | null;
}

export interface GitlabProject {
  id: number;
  pathWithNamespace: string;
  name: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  updatedAt: string;
  webUrl: string;
}

export interface Finding {
  severity: Severity;
  category: string;
  title: string;
  line: number | null;
  description: string;
  rootCause: string;
  suggestedFix: string;
  examplePatch: string | null;
  confidence: number;
}

export interface Stage1FunctionRisk {
  fn: { name: string; startLine: number; endLine: number; complexity: number };
  score: number;
  reasons: string[];
}

export interface Stage1Result {
  lint: { line: number; ruleId: string | null; message: string; severity: 'warning' | 'error' }[];
  tsDiagnostics: { line: number; message: string }[];
  formatted: boolean;
  formattingSkipped: boolean;
  semgrep: { skipped: true; reason: string } | { skipped: false; findings: { pattern: string; line: number; snippet: string }[] };
  functions: { name: string; startLine: number; endLine: number; complexity: number }[];
  riskyFunctions: Stage1FunctionRisk[];
  clean: boolean;
}

export interface Audit {
  id: string;
  filename: string;
  language: string | null;
  provider: string;
  verdict: Verdict;
  summary: string;
  findings: Finding[];
  stage1: Stage1Result | null;
  aiInvoked: boolean;
  fromCache: boolean;
  codeSize: number;
  createdAt: string;
}

export interface ScanFile {
  id: string;
  path: string;
  language: string | null;
  verdict: Verdict | null;
  findings: Finding[];
  stage1: Stage1Result | null;
  aiInvoked: boolean;
  fromCache: boolean;
  createdAt: string;
}

export interface DuplicateGroup {
  linesOfCode: number;
  occurrences: { path: string; startLine: number; endLine: number }[];
}

export interface SecretFinding {
  path: string;
  line: number;
  rule: string;
  snippet: string;
}

export interface DependencyVulnerability {
  package: string;
  severity: string;
  title: string;
  url: string;
  range: string;
}

export interface ScoreSet {
  security: number;
  performance: number;
  technicalDebt: number;
}

export interface VerdictBreakdown {
  pass: number;
  needs_work: number;
  do_not_ship: number;
}

export interface UsageTotals {
  audits: number;
  scans: number;
  freshAiCalls: number;
  cachedHits: number;
  localOnlySkips: number;
  cacheSavingsPct: number;
}

export interface RiskiestItem {
  label: string;
  kind: 'audit' | 'scan';
  verdict: Verdict | null;
  createdAt: string;
  criticalCount: number;
  highCount: number;
}

export interface TopIssue {
  category: string;
  title: string;
  count: number;
  maxSeverity: Severity;
}

export interface AnalyticsOverview {
  windowDays: number;
  repoFilter: string | null;
  totals: UsageTotals;
  activeRepositories: number;
  prReviewCount: number;
  verdictBreakdown: VerdictBreakdown;
  scores: ScoreSet;
  riskiest: RiskiestItem[];
  topIssues: TopIssue[];
}

export interface TrendPoint {
  date: string;
  audits: number;
  scans: number;
  security: number | null;
  performance: number | null;
  technicalDebt: number | null;
}

export interface AnalyticsTrend {
  windowDays: number;
  points: TrendPoint[];
}

export interface ScanJob {
  id: string;
  sourceName: string;
  sourceType: ScanSourceType;
  pullRequestUrl: string | null;
  status: ScanStatus;
  provider: string;
  framework: string | null;
  fileCount: number;
  filesScanned: number;
  verdict: Verdict | null;
  summary: string | null;
  dependencyGraph: Record<string, string[]> | null;
  circularImports: string[][] | null;
  deadCode: string[] | null;
  duplicates: DuplicateGroup[] | null;
  secrets: SecretFinding[] | null;
  dependencyVulnerabilities: DependencyVulnerability[] | null;
  filesFromCache: number;
  filesAiSkipped: number;
  aiInvoked: boolean;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  files?: ScanFile[];
}
