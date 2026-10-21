import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/gsap/ScrollReveal';
import { TextReveal } from '@/components/gsap/TextReveal';

export const metadata: Metadata = {
  title: 'Security & Trust',
  description:
    'What code Audit Bench Ai reads, where it goes, which AI provider sees it and under what terms, what we keep, the GitHub access we ask for, and how to delete your data.',
  alternates: { canonical: '/security' },
};

const SHORT_VERSION = [
  'We read the code needed for the review you asked for, and only that.',
  'The relevant code goes to one AI provider, OpenAI by default, through its API. It is never used to train any model.',
  'We don’t keep copies of your repository. Reports keep findings, file paths and line numbers, not your source files.',
  'The GitHub App asks only to read code, write pull request reviews and comments, and post a check.',
  'You can delete any report, or your whole account and its data, yourself in the app.',
];

const SECTIONS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: 'What code we read',
    body: (
      <ul>
        <li>
          <strong>Pull request reviews:</strong> the files the pull request changes, at its latest commit. To check
          whether a change breaks code elsewhere, we also read a snapshot of the repository at that commit and look up
          where the changed functions are used.
        </li>
        <li>
          <strong>Repository scans:</strong> an archive of the branch you choose, to check for exposed secrets,
          vulnerable dependencies, licenses, dead code and risky functions.
        </li>
        <li>
          <strong>Pasted code:</strong> the snippet you paste into an audit.
        </li>
        <li>
          Code is read, never run. Archives and snapshots are processed in memory for the review and then discarded.
        </li>
      </ul>
    ),
  },
  {
    title: 'Where it goes, and which AI provider sees it',
    body: (
      <>
        <p>
          Free local checks (linters, type checks, secret and dependency scanners) run on our servers first. Then only
          the code a review needs goes to an AI model:
        </p>
        <ul>
          <li>
            <strong>Pull request reviews:</strong> the changed lines with a little surrounding code, short excerpts of
            the code that calls the changed functions, and the pull request’s title and description.
          </li>
          <li>
            <strong>Repository scans:</strong> the functions the local checks flagged as risky, plus the first 1,500
            characters of up to 15 core files to judge how consistent the architecture is. Never the whole repository.
          </li>
          <li>
            <strong>Free public reviews</strong> on auditbenchai.com use local checks only and send nothing to an AI
            provider.
          </li>
        </ul>
        <p>
          <strong>Provider:</strong> OpenAI, through its API (the Chat Completions endpoint), unless your workspace
          chooses another provider. Under{' '}
          <a href="https://developers.openai.com/api/docs/guides/your-data" target="_blank" rel="noreferrer">
            OpenAI’s API data terms
          </a>
          , data sent through the API is not used to train or improve OpenAI’s models, and OpenAI keeps request logs for
          up to 30 days to detect abuse. That endpoint stores no conversation state. If you choose a different provider,
          that provider’s API terms apply instead.
        </p>
        <p>Our own servers (the Audit Bench Ai API) run on Google Cloud.</p>
      </>
    ),
  },
  {
    title: 'Never used for training',
    body: (
      <p>
        Your code is not used to train any model: not ours (we don’t train models) and not the AI provider’s, whose API
        terms exclude it.
      </p>
    ),
  },
  {
    title: 'What we keep, and what we don’t',
    body: (
      <>
        <p>To show you a report, we store:</p>
        <ul>
          <li>
            each finding: its title, explanation, severity, file path, line numbers and suggested fix, which can include
            a few lines of example code;
          </li>
          <li>function names and line numbers from the local checks;</li>
          <li>
            for detected secrets, the type and a masked preview, such as <code>AKIA…7Q</code>, never the secret itself;
          </li>
          <li>pull request details such as title, branches, merge state and CI results.</li>
        </ul>
        <p>
          We don’t store copies of your repository or your source files. Results are cached by a fingerprint of each
          file, so unchanged code isn’t sent to the AI again; the cache holds findings, not your code.
        </p>
      </>
    ),
  },
  {
    title: 'The access we ask for',
    body: (
      <>
        <p>
          The <strong>GitHub App</strong> asks for the least it needs, and you choose which repositories it can see:
        </p>
        <ul>
          <li>
            <strong>Contents: read</strong>, to read the code it reviews;
          </li>
          <li>
            <strong>Pull requests: write</strong>, to post its review, inline comments and replies;
          </li>
          <li>
            <strong>Checks: write</strong>, to post the pass/fail verdict;
          </li>
          <li>
            <strong>Metadata: read</strong>, which every GitHub App has.
          </li>
        </ul>
        <p>
          It never pushes code. The only action that changes code is <strong>Commit fix</strong> in the web editor,
          which you trigger yourself, file by file, with your own connected account, and which lands as a normal commit
          you can revert.
        </p>
        <p>
          If you connect GitHub, GitLab or Bitbucket with a token instead, it’s encrypted at rest with AES-256-GCM and
          only used for the actions you start.
        </p>
      </>
    ),
  },
  {
    title: 'Deleting your data',
    body: (
      <ul>
        <li>
          <strong>One report:</strong> open it and click <strong>Delete</strong>. Its findings go with it.
        </li>
        <li>
          <strong>Everything:</strong> Dashboard → Plan &amp; usage → <strong>Delete account</strong> removes your
          account, scans, reports, audits, review rules, connected tokens and GitHub App links from our database.
        </li>
        <li>
          <strong>GitHub access:</strong> uninstall the app in GitHub’s settings, or disconnect a token in the app, at
          any time.
        </li>
        <li>
          Prefer to ask? Email <a href="mailto:hello@auditbenchai.com">hello@auditbenchai.com</a> and we’ll do it for
          you.
        </li>
      </ul>
    ),
  },
  {
    title: 'How it’s built',
    body: (
      <ul>
        <li>Passwords are hashed with bcrypt (cost factor 12), never stored or encrypted reversibly.</li>
        <li>
          Every webhook from GitHub, GitLab or Bitbucket is signature-checked against a secret before anything in it is
          trusted.
        </li>
        <li>
          Scans and reports belong to the account that ran them, or its team, enforced on every database query, not just
          in the interface.
        </li>
        <li>Shared report links never show where a secret is or who wrote the code.</li>
      </ul>
    ),
  },
  {
    title: 'What we don’t have yet',
    body: (
      <p>
        Audit Bench Ai is not SOC 2 certified yet. If your security review needs more than this page, such as a
        questionnaire, a data processing agreement or a call with the founder, email{' '}
        <a href="mailto:hello@auditbenchai.com">hello@auditbenchai.com</a>.
      </p>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div>
      <section className="border-b border-ink-line bg-ink px-6 py-16">
        <ScrollReveal className="mx-auto max-w-3xl">
          <div className="mb-4 inline-block rounded-full border border-ink-line px-3 py-1 font-mono text-[11px] tracking-wide text-muted-on-ink uppercase">
            Security &amp; Trust
          </div>
          <h1 className="mb-4 text-3xl leading-tight font-bold text-[#E8ECF4] sm:text-4xl">
            <TextReveal>What actually happens to your code.</TextReveal>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-on-ink">
            A plain account of what Audit Bench Ai reads, where it goes, what we keep and how you delete it, so your
            team can decide before installing anything.
          </p>
        </ScrollReveal>
      </section>

      <section className="bg-paper px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal className="rounded-lg border-2 border-cobalt/30 bg-paper-card p-5">
            <h2 className="mb-3 text-sm font-bold text-[#1C2128]">The short version</h2>
            <ul className="space-y-1.5">
              {SHORT_VERSION.map((s) => (
                <li key={s} className="flex gap-2 text-sm leading-relaxed text-[#1C2128]">
                  <span className="font-bold text-pass">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <div className="prose-blog mt-10 space-y-10 text-sm leading-relaxed text-[#1C2128]">
            {SECTIONS.map((s) => (
              <section key={s.title} className="[&>p]:mt-3 [&>ul]:mt-3">
                <h2>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>

          <p className="mt-10 text-[13px] text-muted-on-paper">
            Making Audit Bench Ai a merge gate? See{' '}
            <Link href="/docs/required-check" className="font-semibold text-cobalt hover:underline">
              how to make it a required check
            </Link>
            . Data handling for accounts and billing is in our{' '}
            <Link href="/privacy" className="font-semibold text-cobalt hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-ink-line bg-ink px-6 py-16 text-center">
        <ScrollReveal>
          <h2 className="mb-3 text-xl font-bold text-[#E8ECF4]">Questions we didn&apos;t answer here?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-on-ink">
            Ask directly, especially before a security review on your end.
          </p>
          <a
            href="mailto:hello@auditbenchai.com"
            className="inline-block rounded-lg bg-cobalt px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-cobalt-dark hover:shadow-lg"
          >
            Contact us
          </a>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
