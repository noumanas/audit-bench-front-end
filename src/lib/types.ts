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
  // Cap on distinct repositories this plan may ever scan, lifetime — null
  // means unlimited. Only meaningful when repositoryScan is true.
  maxRepositories: number | null;
  // Alignment Lab — a second product line alongside code review (Team/
  // Enterprise). monthlyInvestigationLimit is null for unlimited, and only
  // meaningful when alignmentLabEnabled is true.
  alignmentLabEnabled: boolean;
  monthlyInvestigationLimit: number | null;
  // AI repository scans per calendar month (not PR/MR reviews); null = unlimited.
  monthlyRepoScanLimit: number | null;
  // Technical due diligence reports — Enterprise only.
  dueDiligence: boolean;
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
  autoReview: boolean;
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
  lastLoginAt: string | null;
  plan: Plan;
  // Paid plans expire 30 days after approval and fall back to Free; null on Free.
  planExpiresAt: string | null;
  role: Role;
  githubUsername: string | null;
  isActive: boolean;
  _count: { audits: number; scanJobs: number };
  // Present on the users list (GET /admin/users), not on mutation responses.
  gitlabUsername?: string | null;
  orgRole?: OrgRole | null;
  organization?: { id: string; name: string } | null;
  effectivePlan?: Plan;
  planExpired?: boolean;
  lastActiveAt?: string | null;
  quota?: AdminQuota;
  month?: { aiRuns: number; aiRepoScans: number; inputTokens: number; outputTokens: number };
}

export interface AdminQuota {
  // 'organization' = the team's shared pool, which is what limits apply to.
  scope: 'personal' | 'organization';
  dailyUsed: number;
  dailyLimit: number | null;
  monthlyUsed: number;
  monthlyLimit: number | null;
  repoScansUsed: number;
  repoScanLimit: number | null;
}

export interface AdminUsageSummary {
  totalUsers: number;
  suspended: number;
  newThisMonth: number;
  activeUsers7d: number;
  activeUsers30d: number;
  aiRunsMonth: number;
  inputTokensMonth: number;
  outputTokensMonth: number;
}

export interface AdminUserUsageDetail {
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    lastLoginAt: string | null;
    planExpiresAt: string | null;
    role: Role;
    isActive: boolean;
    githubUsername: string | null;
    gitlabUsername: string | null;
    orgRole: OrgRole | null;
    plan: Plan;
    organization: { id: string; name: string } | null;
  };
  quota: Usage;
  daily: Array<{ date: string; audits: number; scans: number; aiRuns: number; tokens: number }>;
  totals: { audits: number; scans: number; inputTokens: number; outputTokens: number };
  recent: Array<{
    kind: 'audit' | 'scan';
    id: string;
    label: string;
    verdict: Verdict | null;
    status: string;
    provider: string;
    usedAi: boolean;
    tokens: number;
    createdAt: string;
  }>;
  planRequests: Array<{ id: string; status: string; createdAt: string; reviewedAt: string | null; requestedPlan: { name: string } }>;
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
  repoScansUsed: number;
  repoScanLimit: number | null;
  dueDiligence: boolean;
  // When the current paid plan lapses back to Free; null on Free.
  planExpiresAt: string | null;
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

export interface GithubPullRequest {
  number: number;
  title: string;
  headRef: string;
  baseRef: string;
  draft: boolean;
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

export interface GitlabMergeRequest {
  iid: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  draft: boolean;
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

export type FindingStatus = 'open' | 'in_progress' | 'wont_fix';
export type FindingStatuses = Record<number, FindingStatus>;

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
  findingStatuses: FindingStatuses | null;
  stage1: Stage1Result | null;
  aiInvoked: boolean;
  fromCache: boolean;
  inputTokens: number;
  outputTokens: number;
  codeSize: number;
  createdAt: string;
}

export interface ScanFile {
  id: string;
  path: string;
  language: string | null;
  verdict: Verdict | null;
  findings: Finding[];
  findingStatuses: FindingStatuses | null;
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

export interface LicenseFinding {
  package: string;
  version: string;
  license: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
}

export interface TestCoverageEstimate {
  sourceFileCount: number;
  testFileCount: number;
  testFileRatio: number;
  hasCoverageConfig: boolean;
  hasCiTestStep: boolean;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
  untestedDirectories: string[];
}

export interface RiskCategoryScore {
  category: string;
  riskLevel: 'high' | 'medium' | 'low' | null;
  detail: string;
}

export interface RemediationItem {
  category: string;
  description: string;
  estimatedDays: number;
}

// Technical due diligence assessment — mirrors backend repository/tdd-assessment.ts.
export type TddCheckSeverity = 'critical' | 'high' | 'medium' | 'low';
export type TddCheckStatus = 'pass' | 'fail' | 'not_assessed';
export type TddRating = TddCheckSeverity | 'pass' | 'not_assessed';
export type TddRemediationPhase = 'pre_close' | 'days_30' | 'days_90';

export interface TddCheck {
  id: string;
  title: string;
  domainId: string;
  status: TddCheckStatus;
  severity: TddCheckSeverity;
  detail: string;
  businessImpact: string;
  evidence: Array<{ path: string; line: number | null; note: string }>;
}

export interface TddDomain {
  id: string;
  name: string;
  areaId: string;
  rating: TddRating;
  checksRun: number;
  checksPassed: number;
}

export interface TddArea {
  id: string;
  name: string;
  rating: TddRating;
  checksRun: number;
  checksPassed: number;
  headline: string;
}

export interface TddRemediationStep {
  areaId: string;
  phase: TddRemediationPhase;
  category: string;
  description: string;
  estimatedDays: number;
  costLowUsd: number;
  costHighUsd: number;
}

export interface TddAssessment {
  areas: TddArea[];
  domains: TddDomain[];
  checks: TddCheck[];
  coverage: {
    catalogSize: number;
    checksRun: number;
    checksPassed: number;
    checksFailed: number;
    notAssessed: number;
    filesAnalyzed: number;
    filesInRepository: number;
  };
  riskCounts: Record<TddCheckSeverity, number>;
  remediationPlan: {
    steps: TddRemediationStep[];
    byPhase: Record<TddRemediationPhase, { days: number; costLowUsd: number; costHighUsd: number }>;
  };
}

export interface RiskAggregation {
  overallRiskRating: 'high' | 'medium' | 'low';
  overallHealthScore: number;
  categories: RiskCategoryScore[];
  remediation: {
    items: RemediationItem[];
    totalEstimatedDays: number;
    estimatedCostLowUsd: number;
    estimatedCostHighUsd: number;
  };
  recommendations: string[];
  summary: string;
}

export interface ArchitectureInconsistency {
  title: string;
  description: string;
  files: string[];
}

export interface ArchitectureAssessment {
  consistencyScore: number;
  riskLevel: 'high' | 'medium' | 'low';
  summary: string;
  inconsistencies: ArchitectureInconsistency[];
}

export interface ContributorStat {
  author: string;
  email?: string;
  commits: number;
  additions: number;
  deletions: number;
  lastCommitAt: string | null;
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
  resourceId: string;
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

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export type CategoryBreakdown = Partial<Record<string, number>>;

export interface CriticalIssue {
  title: string;
  category: string;
  severity: Severity;
  confidencePct: number;
  resourceId: string;
  resourceLabel: string;
  resourceKind: 'audit' | 'scan';
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
  severityBreakdown: SeverityBreakdown;
  categoryBreakdown: CategoryBreakdown;
  patchesAvailable: number;
  totalFindings: number;
  criticalIssues: CriticalIssue[];
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
  // Public share link state — see backend PublicScanService.
  shareId?: string | null;
  isPublic?: boolean;
  localOnly?: boolean;
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
  licenseFindings: LicenseFinding[] | null;
  testCoverage: TestCoverageEstimate | null;
  architectureAssessment: ArchitectureAssessment | null;
  contributorStats: ContributorStat[] | null;
  riskAggregation: RiskAggregation | null;
  /** Computed on read alongside riskAggregation for completed scans — see backend repository/tdd-assessment.ts. */
  tddAssessment?: TddAssessment | null;
  filesFromCache: number;
  filesAiSkipped: number;
  aiInvoked: boolean;
  inputTokens: number;
  outputTokens: number;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
  files?: ScanFile[];
}

// ---------- Alignment lab (admin-only pilot, see backend AlignmentLabModule) ----------

export type BenchmarkDifficulty = 'easy' | 'medium' | 'hard';
export type InvestigationStatus = 'running' | 'completed' | 'failed';

export interface BenchmarkModel {
  id: string;
  name: string;
  hiddenBehavior: string;
  personaPrompt: string;
  difficulty: BenchmarkDifficulty;
  confessionResistance: BenchmarkDifficulty;
  createdById: string;
  createdAt: string;
}

export interface InvestigationTurn {
  turn: number;
  hypothesis: string;
  prompt: string;
  response: string;
  updatedBelief: string;
  confidence: number;
}

export interface WebVitalMetricSummary {
  name: string;
  count: number;
  /** 75th percentile — the actual Core Web Vitals threshold basis, not a plain average. */
  p75: number;
  goodPct: number;
  needsImprovementPct: number;
  poorPct: number;
}

export interface Investigation {
  id: string;
  modelId: string;
  runById: string;
  status: InvestigationStatus;
  turns: InvestigationTurn[];
  predictedBehavior: string | null;
  confidence: number | null;
  correct: boolean | null;
  queryCount: number;
  inputTokens: number;
  outputTokens: number;
  provider: string;
  createdAt: string;
  completedAt: string | null;
}

// Shared/public scan view — mirrors backend PublicScanService.getShared.
export interface PublicScan {
  shareId: string;
  sourceName: string;
  sourceType: ScanSourceType;
  repoUrl: string | null;
  ref: string | null;
  status: ScanStatus;
  error: string | null;
  framework: string | null;
  fileCount: number;
  filesScanned: number;
  verdict: Verdict | null;
  localOnly: boolean;
  createdAt: string;
  completedAt: string | null;
  riskAggregation: RiskAggregation | null;
  secrets: { count: number; types: Record<string, number> } | null;
  dependencyVulnerabilities: DependencyVulnerability[] | null;
  licenseFindings: LicenseFinding[] | null;
  testCoverage: TestCoverageEstimate | null;
  circularImports: string[][] | null;
  deadCode: string[] | null;
  duplicates: unknown[] | null;
  contributors: { count: number; topSharePct: number } | null;
  files: Array<{ path: string; language: string | null; verdict: Verdict | null; findings: Finding[] }>;
}

// ---------- Revenue (super admin) — mirrors backend revenue/revenue.service.ts ----------
export interface RevenueMonth {
  month: string; // YYYY-MM
  mrrCents: number;
  newCents: number;
  reactivationCents: number;
  expansionCents: number;
  contractionCents: number;
  churnCents: number;
  accounts: number;
  collectedRecurringCents: number;
  collectedOneOffCents: number;
}

export interface RevenueOverview {
  currency: string;
  asOf: string;
  mrrCents: number;
  arrCents: number;
  payingAccounts: number;
  arpaCents: number;
  netNewMrrThisMonthCents: number;
  churnRateLastMonthPct: number | null;
  renewalsAtRiskCents: number;
  collectedThisMonthCents: number;
  collectedYtdCents: number;
  oneOffYtdCents: number;
  series: RevenueMonth[];
  planMix: Array<{ plan: string; accounts: number; mrrCents: number }>;
  renewals: Array<{ subscriptionId: string; account: string; plan: string; amountCents: number; endsAt: string; daysLeft: number }>;
}

export interface RevenueSubscription {
  id: string;
  account: string;
  accountType: 'user' | 'team';
  userId: string | null;
  organizationId: string | null;
  plan: { id: string; slug: string; name: string; priceMonthlyCents: number };
  amountCents: number;
  currency: string;
  startedAt: string;
  endsAt: string;
  endedAt: string | null;
  status: 'active' | 'expired' | 'canceled';
  state: 'active' | 'scheduled' | 'expired' | 'canceled';
  source: string;
  notes: string | null;
}

export type PaymentKind = 'subscription' | 'tdd_engagement' | 'other';

export interface RevenuePayment {
  id: string;
  amountCents: number;
  currency: string;
  kind: PaymentKind;
  method: string | null;
  reference: string | null;
  payer: string;
  plan: string | null;
  paidAt: string;
  notes: string | null;
}
