import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Audit Bench Ai collects, uses and protects personal data and source code, including cookies, Google Analytics and Google AdSense advertising.',
  alternates: { canonical: '/privacy' },
};

const CONTACT = 'noumanqureshi15@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      intro="What we collect when you use auditbenchai.com and the Audit Bench Ai app, why we collect it, who we share it with, and the choices you have."
      updated="October 11, 2026"
    >
      <p>
        This policy applies to the Audit Bench Ai website at auditbenchai.com, the web app, the command-line tool, the
        VS Code extension and the GitHub and GitLab integrations (together, the “Service”). “We”, “us” and “our” mean
        Audit Bench Ai. Questions about this policy can be sent to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li>
          <strong>Account details:</strong> your name, email address and password (stored only as a one-way hash), or
          your profile details if you sign in with GitHub, GitLab or Google.
        </li>
        <li>
          <strong>Team details:</strong> organization names, member roles and the email addresses you invite.
        </li>
        <li>
          <strong>Code you submit:</strong> files you paste or upload, repositories and pull requests you ask us to
          scan, and archives you upload for a scan.
        </li>
        <li>
          <strong>Git provider tokens:</strong> personal access tokens you connect for GitHub or GitLab.
        </li>
        <li>
          <strong>Billing and correspondence:</strong> plan requests, payment records and anything you send us by email.
        </li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>
          <strong>Usage data:</strong> the audits and scans you run, which features you use, AI usage and token counts,
          and sign-in times.
        </li>
        <li>
          <strong>Device and log data:</strong> IP address, browser type, pages visited and timestamps, collected by our
          servers and by the analytics and advertising services described below.
        </li>
        <li>
          <strong>Performance data:</strong> page-load timing measurements (Web Vitals) used to keep the site fast.
        </li>
        <li>
          <strong>Free public scans:</strong> if you scan a public repository without an account, we keep a one-way hash
          of your IP address to enforce rate limits. We do not store the IP address itself.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>
          To provide the Service: run audits and scans, show reports, post pull request reviews and commit fixes you
          approve.
        </li>
        <li>To operate accounts, teams, plans and usage limits.</li>
        <li>
          To keep the Service secure, prevent abuse and enforce our <Link href="/terms">Terms of Service</Link>.
        </li>
        <li>To understand how the site is used and improve it.</li>
        <li>To show advertising on our public website (see section 4).</li>
        <li>To reply to you and send messages about your account, such as invitations and plan changes.</li>
      </ul>
      <p>We do not sell your personal information. We do not use your code to train AI models.</p>

      <h2>3. Your source code</h2>
      <ul>
        <li>
          <strong>Analysis:</strong> code is analysed with local static checks first. For a pull request review, the
          changed lines (with surrounding code and short excerpts of code that uses them) are sent to an AI model
          provider; for a repository scan, only the functions those checks flag as risky and a short sample of core
          files. Code is read, never executed. Details are on our <Link href="/security">Security &amp; Trust</Link>{' '}
          page.
        </li>
        <li>
          <strong>What we keep:</strong> findings, verdicts, file paths and short code excerpts needed to display and
          explain findings. Results are cached by a hash of the code so unchanged code is not re-sent to an AI provider.
        </li>
        <li>
          <strong>Tokens:</strong> GitHub and GitLab tokens are encrypted at rest (AES-256-GCM) and used only to read
          repositories, post reviews and commit fixes you request. You can disconnect them at any time.
        </li>
        <li>
          <strong>Shared reports:</strong> a report becomes public only when you, or a teammate with access, create a
          share link, and stops being public when sharing is turned off. Shared reports never show where secrets are or
          who wrote the code.
        </li>
      </ul>
      <p>
        More detail is on our <Link href="/security">Security &amp; Trust</Link> page.
      </p>

      <h2>4. Cookies, analytics and advertising</h2>
      <p>
        We use a small amount of browser storage to keep you signed in. We also use the following third-party services,
        which set their own cookies or similar identifiers:
      </p>
      <ul>
        <li>
          <strong>Google Analytics</strong> to measure visits and how pages are used. See{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
            how Google uses information from sites that use its services
          </a>
          .
        </li>
        <li>
          <strong>Google AdSense</strong> to show advertising on our public website.
        </li>
      </ul>
      <p>About advertising specifically:</p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or
          other websites.
        </li>
        <li>
          Google’s use of advertising cookies enables it and its partners to serve ads to you based on your visit to
          this site and/or other sites on the Internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
            Google Ads Settings
          </a>
          . You can also opt out of some third-party vendors’ use of cookies for personalized advertising at{' '}
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noreferrer">
            www.aboutads.info
          </a>
          .
        </li>
        <li>
          Where the law requires your consent for these cookies, for example in the European Economic Area, the United
          Kingdom and Switzerland, Google’s consent message asks for it before personalized ads are shown.
        </li>
      </ul>
      <p>
        You can also block or delete cookies in your browser settings; parts of the site may then not work as intended.
      </p>

      <h2>5. Who we share information with</h2>
      <ul>
        <li>
          <strong>AI model providers</strong> (for example Anthropic, OpenAI or Google), which receive only the code
          excerpts sent for AI review, under their API terms.
        </li>
        <li>
          <strong>GitHub and GitLab</strong>, when you connect an account and ask us to read code, post reviews or
          commit fixes.
        </li>
        <li>
          <strong>Hosting, database, email and analytics providers</strong> that run the Service on our behalf.
        </li>
        <li>
          <strong>Google</strong>, for analytics and advertising as described above.
        </li>
        <li>
          <strong>Your team</strong>: members of an organization can see that organization’s audits, scans and usage.
        </li>
        <li>
          <strong>Legal reasons</strong>: when required by law, or to protect the rights, safety and security of our
          users, the public or the Service.
        </li>
        <li>
          <strong>Business transfers</strong>: as part of a merger, acquisition or sale of assets, subject to this
          policy.
        </li>
      </ul>

      <h2>6. How long we keep information</h2>
      <p>
        We keep account information for as long as your account is active. Audits, scans and reports are kept until you
        or your organization delete them or close the account. When an account is deleted we delete its audits, scans
        and connected tokens, except where we must keep records (for example payment records) to meet legal obligations.
      </p>

      <h2>7. Security</h2>
      <p>
        We use encryption in transit, encrypted storage for git provider tokens, hashed passwords, access controls and
        rate limiting. No method of transmission or storage is completely secure, so we cannot guarantee absolute
        security. Please report suspected vulnerabilities to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>8. Your rights and choices</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>access the personal information we hold about you and get a copy of it;</li>
        <li>correct inaccurate information;</li>
        <li>delete your information or your account;</li>
        <li>object to or restrict some processing, including direct marketing;</li>
        <li>withdraw consent where processing is based on consent;</li>
        <li>complain to your local data protection authority.</li>
      </ul>
      <p>
        California residents have the right to know what personal information is collected, to delete it, to correct it,
        and not to be discriminated against for exercising these rights. We do not sell personal information. To use any
        of these rights, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>; we may need to confirm your identity first.
      </p>

      <h2>9. International transfers</h2>
      <p>
        Our service providers may process information in countries other than yours. Where required, we rely on
        appropriate safeguards such as standard contractual clauses for those transfers.
      </p>

      <h2>10. Children</h2>
      <p>
        The Service is for professional use and is not directed to children under 16. We do not knowingly collect
        personal information from children. If you believe a child has given us information, contact us and we will
        delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will change the date at the top and, for significant changes,
        notify account holders by email or in the app.
      </p>

      <h2>12. Contact</h2>
      <p>
        Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> or use our <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
