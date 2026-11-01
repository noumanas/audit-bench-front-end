/**
 * The docs' table of contents: sidebar order, previous/next links, search
 * and the sitemap all read from here. Each page lives at /docs/<slug>
 * (the introduction is /docs itself) and renders through <DocPage slug>.
 */
export interface DocMeta {
  /** URL segment after /docs/ — '' for the introduction. */
  slug: string;
  title: string;
  /** One sentence: the page's subtitle, meta description and search snippet. */
  description: string;
  /** Extra words search should match on. */
  keywords?: string[];
}

export interface DocGroup {
  title: string;
  pages: DocMeta[];
}

export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'Get started',
    pages: [
      {
        slug: '',
        title: 'Introduction',
        description: 'What Audit Bench Ai is, what it reviews, and where to begin.',
        keywords: ['overview', 'what is'],
      },
      {
        slug: 'quickstart',
        title: 'Quickstart',
        description: 'Install the GitHub App and get your first pull request reviewed in about five minutes.',
        keywords: ['setup', 'install', 'first review', 'getting started'],
      },
      {
        slug: 'how-it-works',
        title: 'How reviews work',
        description: 'The two-stage pipeline behind every review: free local checks first, then a focused AI pass.',
        keywords: ['pipeline', 'stage 1', 'stage 2', 'architecture', 'engine', 'ai'],
      },
    ],
  },
  {
    title: 'Platforms',
    pages: [
      {
        slug: 'github',
        title: 'GitHub',
        description: 'Install the GitHub App, choose repositories, and understand the permissions it asks for.',
        keywords: ['github app', 'install', 'permissions', 'webhook', 'check run'],
      },
      {
        slug: 'gitlab',
        title: 'GitLab',
        description: 'Connect GitLab with an access token and a project webhook to review merge requests.',
        keywords: ['merge request', 'mr', 'webhook', 'token', 'self-managed'],
      },
      {
        slug: 'bitbucket',
        title: 'Bitbucket',
        description: 'Connect Bitbucket Cloud with an API token and a repository webhook to review pull requests.',
        keywords: ['bitbucket cloud', 'webhook', 'app password', 'token'],
      },
    ],
  },
  {
    title: 'Pull request reviews',
    pages: [
      {
        slug: 'reviews',
        title: 'Reading a review',
        description: 'Summary comments, inline findings, severities, categories and what each line of a finding means.',
        keywords: ['severity', 'critical', 'high', 'medium', 'low', 'suggestion', 'category', 'inline comment', 'summary'],
      },
      {
        slug: 'conversations',
        title: 'Replies and reactions',
        description: 'Push back on a finding, ask questions, and react — the reviewer rechecks and learns from it.',
        keywords: ['reply', 'dispute', 'recheck', 'reaction', 'thumbs', 'acknowledge', 'commands', 'mention'],
      },
      {
        slug: 'required-check',
        title: 'Make it a required check',
        description: 'Turn the review’s verdict into a merge gate with GitHub rulesets or branch protection.',
        keywords: ['branch protection', 'ruleset', 'merge gate', 'status check', 'block merge'],
      },
    ],
  },
  {
    title: 'Configuration',
    pages: [
      {
        slug: 'configuration',
        title: 'Rules and strictness',
        description: 'Team rules, learned suppressions and the strictness thresholds that decide what gets posted.',
        keywords: ['rules', 'thresholds', 'confidence', 'suppressions', 'settings', 'noise', 'strictness'],
      },
      {
        slug: 'review-quality',
        title: 'Review quality metrics',
        description: 'Precision, dismissals, acknowledgements and repeats — how to tell whether reviews are useful.',
        keywords: ['metrics', 'precision', 'analytics', 'dashboard', 'quality'],
      },
    ],
  },
  {
    title: 'Beyond pull requests',
    pages: [
      {
        slug: 'repository-scans',
        title: 'Repository scans',
        description: 'Scan a whole branch for secrets, vulnerable dependencies, licenses, dead code and risky functions.',
        keywords: ['scan', 'secrets', 'dependencies', 'license', 'dead code', 'public scan', 'free'],
      },
      {
        slug: 'vscode',
        title: 'VS Code extension',
        description: 'Review files and changes in your editor before you open a pull request.',
        keywords: ['ide', 'editor', 'extension', 'diagnostics'],
      },
      {
        slug: 'cli',
        title: 'CLI',
        description: 'Review code from the terminal or in CI, with exit codes you can gate a pipeline on.',
        keywords: ['command line', 'terminal', 'ci', 'pipeline', 'npm', 'exit code'],
      },
    ],
  },
  {
    title: 'Account and security',
    pages: [
      {
        slug: 'plans',
        title: 'Plans and limits',
        description: 'What each plan includes, how usage is counted, and what happens at a limit.',
        keywords: ['pricing', 'quota', 'limit', 'free', 'pro', 'billing', 'upgrade'],
      },
      {
        slug: 'security',
        title: 'Security and data',
        description: 'What code is read, where it goes, what’s kept, and how to delete it.',
        keywords: ['privacy', 'data', 'retention', 'delete', 'encryption', 'ai provider', 'training'],
      },
      {
        slug: 'troubleshooting',
        title: 'Troubleshooting',
        description: 'No review on a pull request, a check that didn’t finish, and other common problems.',
        keywords: ['error', 'not working', 'failed', 'temporary problem', 're-run', 'help', 'faq'],
      },
    ],
  },
];

export const DOC_PAGES: DocMeta[] = DOC_GROUPS.flatMap((g) => g.pages);

export const docHref = (slug: string) => (slug ? `/docs/${slug}` : '/docs');

export function docBySlug(slug: string): DocMeta {
  const page = DOC_PAGES.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown docs page: ${slug}`);
  return page;
}

/** The pages before and after `slug` in sidebar order, for the footer links. */
export function docNeighbours(slug: string): { prev?: DocMeta; next?: DocMeta } {
  const i = DOC_PAGES.findIndex((p) => p.slug === slug);
  return { prev: DOC_PAGES[i - 1], next: DOC_PAGES[i + 1] };
}

export function docGroupOf(slug: string): string | undefined {
  return DOC_GROUPS.find((g) => g.pages.some((p) => p.slug === slug))?.title;
}
