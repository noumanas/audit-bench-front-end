// Generated from the same source as /downloads/technical-due-diligence-checklist.csv.
// 6 risk areas, 15 domains, 43 checks; mirrors the Audit Bench TDD assessment catalog.

export interface TddChecklistItem {
  severity: 'critical' | 'high' | 'medium' | 'low';
  check: string;
  lookFor: string;
  redFlag: string;
}
export interface TddChecklistArea {
  name: string;
  why: string;
  domains: Array<{ name: string; checks: TddChecklistItem[] }>;
}

export const TDD_CHECKLIST: TddChecklistArea[] = [
  {
    name: 'Security exposure',
    why: 'What an attacker could exploit today, and what would trigger a breach notification.',
    domains: [
      {
        name: 'Application security',
        checks: [
          {
            severity: 'critical',
            check: 'No critical security vulnerabilities',
            lookFor: 'Run static analysis and review auth, payment and data-export paths for exploitable flaws.',
            redFlag: 'Any critical finding on an internet-facing endpoint with no fix date.',
          },
          {
            severity: 'high',
            check: 'No high-severity security vulnerabilities',
            lookFor: 'Count high-severity findings and check whether the same class repeats across endpoints.',
            redFlag: 'The same vulnerability pattern in many places, which points to a process gap, not one bug.',
          },
          {
            severity: 'high',
            check: 'No code or command injection',
            lookFor: 'Search for eval/exec, shell commands built from user input and template injection.',
            redFlag: 'User input reaching a shell, eval() or a template engine without validation.',
          },
          {
            severity: 'high',
            check: 'No SQL injection risks',
            lookFor: 'Look for queries built with string formatting instead of parameters or an ORM.',
            redFlag: 'f-strings or string concatenation inside SQL, especially in DELETE/UPDATE.',
          },
          {
            severity: 'high',
            check: 'No unsafe deserialization',
            lookFor: 'Check pickle, unsafe YAML loading and similar on data that crosses a trust boundary.',
            redFlag: 'pickle.loads or yaml.load on request bodies, files or queue messages.',
          },
          {
            severity: 'high',
            check: 'Authentication and access control hold up',
            lookFor: 'Review session handling, role checks and tenant isolation on multi-tenant data.',
            redFlag:
              "Endpoints that change data without an auth check, or IDs that let one customer read another's records.",
          },
          {
            severity: 'medium',
            check: 'Static security rules pass',
            lookFor: 'Run a rule-based scanner (e.g. Semgrep) against the codebase and triage the results.',
            redFlag: 'Hundreds of open scanner findings nobody has looked at.',
          },
        ],
      },
      {
        name: 'Secrets & credentials',
        checks: [
          {
            severity: 'critical',
            check: 'No hardcoded secrets in the repository',
            lookFor: 'Scan the code and the full git history for keys, tokens and passwords.',
            redFlag: 'Live credentials in the repo; past staff and contractors still have them.',
          },
          {
            severity: 'critical',
            check: 'No private keys committed',
            lookFor: 'Look for service-account JSON, TLS and signing keys in the tree.',
            redFlag: 'A *.json or *.pem key file in source control.',
          },
          {
            severity: 'critical',
            check: 'No cloud or payment provider tokens',
            lookFor: 'Check specifically for AWS, Stripe, GitHub and Slack tokens.',
            redFlag: 'A live Stripe or AWS key: direct access to money or infrastructure.',
          },
          {
            severity: 'high',
            check: 'No credentials assigned in code',
            lookFor: 'Look for passwords and API keys set as string literals or defaults.',
            redFlag: "os.getenv('KEY', 'real-secret-value') style fallbacks.",
          },
        ],
      },
      {
        name: 'Configuration & environment',
        checks: [
          {
            severity: 'high',
            check: 'No environment files committed',
            lookFor: 'Check for .env, .env.prod and similar files in the repository.',
            redFlag: '.env files with production database URLs or keys in git.',
          },
          {
            severity: 'medium',
            check: 'Debug and auto-reload disabled in production',
            lookFor: 'Confirm debug flags and dev servers are off in production config.',
            redFlag: 'Stack traces or debug pages reachable on the live site.',
          },
          {
            severity: 'medium',
            check: 'Database connection configured safely',
            lookFor: 'Review ORM/engine settings: SQL echo, SSL, pool limits.',
            redFlag: 'SQL logging of real customer data, or unencrypted connections.',
          },
        ],
      },
    ],
  },
  {
    name: 'Dependency & license risk',
    why: 'Open-source risk the buyer inherits on day one.',
    domains: [
      {
        name: 'Dependency vulnerabilities',
        checks: [
          {
            severity: 'critical',
            check: 'No critical vulnerable dependencies',
            lookFor: 'Run npm audit / pip-audit (or an SBOM scan) against the lockfiles.',
            redFlag: 'Critical advisories in packages that are directly reachable from the internet.',
          },
          {
            severity: 'high',
            check: 'No high-severity vulnerable dependencies',
            lookFor: 'List high advisories by package and whether a patched version exists.',
            redFlag: 'Many high advisories with available fixes that were never applied.',
          },
          {
            severity: 'medium',
            check: 'Moderate advisories under control',
            lookFor: 'Count moderate advisories and the age of the oldest unpatched one.',
            redFlag: "A long backlog of old advisories: dependencies aren't being maintained.",
          },
        ],
      },
      {
        name: 'License compliance',
        checks: [
          {
            severity: 'high',
            check: 'No strong-copyleft dependencies',
            lookFor: 'Find GPL/AGPL packages in a proprietary product, including transitive ones.',
            redFlag: 'AGPL code in a SaaS product: may oblige publishing your own source.',
          },
          {
            severity: 'medium',
            check: 'No weak-copyleft dependencies without review',
            lookFor: 'Flag LGPL/MPL packages and how they are linked or modified.',
            redFlag: 'Modified LGPL/MPL code shipped without meeting its obligations.',
          },
          {
            severity: 'low',
            check: 'Every dependency license identified',
            lookFor: 'List packages with missing or non-standard licenses.',
            redFlag: 'Unknown licenses on core packages: unpriced legal risk.',
          },
        ],
      },
    ],
  },
  {
    name: 'Technical debt',
    why: 'How expensive the codebase will be to change after close.',
    domains: [
      {
        name: 'Code correctness',
        checks: [
          {
            severity: 'high',
            check: 'The code compiles and type-checks',
            lookFor: 'Build the project and run the type checker from a clean checkout.',
            redFlag: "The main branch doesn't build, or type errors are suppressed wholesale.",
          },
          {
            severity: 'medium',
            check: 'No lint errors',
            lookFor: "Run the project's linters with its own config.",
            redFlag: 'Linting disabled in CI, or thousands of errors left in place.',
          },
          {
            severity: 'high',
            check: 'No high-severity logic defects',
            lookFor: 'Review money, permissions and data-integrity code paths for wrong results.',
            redFlag: 'Billing, refund or quota logic with unhandled edge cases.',
          },
        ],
      },
      {
        name: 'Complexity & maintainability',
        checks: [
          {
            severity: 'medium',
            check: 'No extremely complex functions',
            lookFor: 'Measure cyclomatic complexity; list functions above 20.',
            redFlag: 'Core business logic in a handful of 500-line functions.',
          },
          {
            severity: 'low',
            check: 'Under 10% of functions above complexity 10',
            lookFor: 'Check what share of functions are moderately complex.',
            redFlag: 'Complexity spread everywhere: every change is slow and risky.',
          },
          {
            severity: 'medium',
            check: 'No high-severity maintainability issues',
            lookFor: 'Look for global state, hidden coupling and copy-pasted rules.',
            redFlag: 'Global mutable state shared across requests.',
          },
        ],
      },
      {
        name: 'Duplication & dead code',
        checks: [
          {
            severity: 'low',
            check: 'Little duplicated code',
            lookFor: 'Detect duplicated blocks across the repository.',
            redFlag: 'The same business rule implemented differently in several places.',
          },
          {
            severity: 'low',
            check: 'Little unreferenced code',
            lookFor: "Find files nothing imports and that aren't entry points.",
            redFlag: 'Large amounts of dead code that inflate the codebase you are paying for.',
          },
        ],
      },
    ],
  },
  {
    name: 'Architecture & scalability',
    why: 'Whether the system can support the growth plan in the deal thesis.',
    domains: [
      {
        name: 'Architecture consistency',
        checks: [
          {
            severity: 'medium',
            check: 'Consistent architecture across the codebase',
            lookFor: 'Check that layering, data access and error handling follow one pattern.',
            redFlag: 'Three different ways to call the database, each with its own bugs.',
          },
          {
            severity: 'low',
            check: 'Few cross-cutting inconsistencies',
            lookFor: 'List competing conventions (config, logging, auth checks).',
            redFlag: 'Every service or module invented its own conventions.',
          },
        ],
      },
      {
        name: 'Modularity & coupling',
        checks: [
          {
            severity: 'medium',
            check: 'No circular imports',
            lookFor: 'Build the import graph and look for cycles.',
            redFlag: "Modules that can't be changed or extracted independently.",
          },
          {
            severity: 'low',
            check: 'No module depends on everything',
            lookFor: 'Find modules that import many internal modules.',
            redFlag: "A 'utils' or 'core' module every change has to touch.",
          },
          {
            severity: 'medium',
            check: 'No high-severity design flaws',
            lookFor: 'Review service boundaries, schema design and single points of failure.',
            redFlag: 'A design that needs a rewrite to reach the projected scale.',
          },
        ],
      },
      {
        name: 'Performance',
        checks: [
          {
            severity: 'medium',
            check: 'No high-severity performance problems',
            lookFor: 'Look for N+1 queries, blocking I/O in async code and unbounded queries.',
            redFlag: 'Costs or latency that grow faster than usage.',
          },
        ],
      },
    ],
  },
  {
    name: 'Engineering practices',
    why: 'Whether the team can ship changes safely.',
    domains: [
      {
        name: 'Test coverage',
        checks: [
          {
            severity: 'high',
            check: 'At least one test file per five source files',
            lookFor: 'Compare test files to source files, and look at what the tests cover.',
            redFlag: 'Almost no tests around payments, auth or data integrity.',
          },
          {
            severity: 'low',
            check: 'Coverage is measured',
            lookFor: 'Check for coverage tooling and reports.',
            redFlag: 'Nobody knows which parts of the product are unprotected.',
          },
          {
            severity: 'medium',
            check: 'Every major area has tests',
            lookFor: 'List top-level modules with no tests at all.',
            redFlag: 'Whole services or apps with zero tests.',
          },
        ],
      },
      {
        name: 'CI & delivery',
        checks: [
          {
            severity: 'medium',
            check: 'CI runs the tests on every change',
            lookFor: 'Check the pipeline runs tests and blocks merges on failure.',
            redFlag: "CI exists but doesn't run tests, or failures are ignored.",
          },
        ],
      },
    ],
  },
  {
    name: 'Team & knowledge',
    why: 'Key-person risk that has to be handled in the deal terms.',
    domains: [
      {
        name: 'Knowledge concentration',
        checks: [
          {
            severity: 'high',
            check: 'No one wrote half or more of the code',
            lookFor: "Look at the commit share per contributor over the repo's history.",
            redFlag: 'One engineer authored most of the commits: a bus factor of one.',
          },
          {
            severity: 'medium',
            check: 'At least three significant contributors',
            lookFor: 'Count contributors with 10% or more of commits.',
            redFlag: 'Only one or two people understand the core systems.',
          },
        ],
      },
      {
        name: 'Development continuity',
        checks: [
          {
            severity: 'medium',
            check: 'Recent commits',
            lookFor: 'Check when the codebase was last changed.',
            redFlag: 'No commits for months: nobody may be left who can maintain it.',
          },
          {
            severity: 'high',
            check: 'The main author is still active',
            lookFor: "Check the top contributor's most recent commit.",
            redFlag: 'The person who wrote most of the code has stopped committing.',
          },
          {
            severity: 'medium',
            check: 'Two or more people actively committing',
            lookFor: 'Count contributors active in the last 90 days.',
            redFlag: 'A single active maintainer for every post-close fix.',
          },
        ],
      },
    ],
  },
];
