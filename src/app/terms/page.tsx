import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that apply when you use the Audit Bench Ai website, app, CLI, VS Code extension and integrations.',
  alternates: { canonical: '/terms' },
};

const CONTACT = 'noumanqureshi15@gmail.com';

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Service"
      intro="The agreement between you and Audit Bench Ai when you use our website, app and tools. Please read it before using the Service."
      updated="October 11, 2026"
    >
      <h2>1. Agreement</h2>
      <p>
        These Terms govern your use of auditbenchai.com, the Audit Bench Ai web app, command-line tool, VS Code
        extension, GitHub and GitLab integrations and related services (the “Service”). By creating an account or using
        the Service you agree to these Terms and to our <Link href="/privacy">Privacy Policy</Link>. If you use the
        Service for an organization, you confirm you are authorised to accept these Terms on its behalf.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must give accurate information and keep your password and API keys secure.</li>
        <li>You are responsible for activity under your account and your organization.</li>
        <li>You must be at least 16 years old and able to form a binding contract.</li>
        <li>Tell us promptly at {CONTACT} if you believe your account has been compromised.</li>
      </ul>

      <h2>3. Your code and content</h2>
      <ul>
        <li>
          You keep all rights to the code and content you submit. You give us permission to process it only to provide
          the Service, as described in the Privacy Policy.
        </li>
        <li>
          You must have the right to submit the code you scan. Do not scan repositories you are not authorised to
          access.
        </li>
        <li>
          Free public scans may only be run on public repositories. Reports you choose to share are visible to anyone
          with the link until you turn sharing off.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the Service to break the law or infringe anyone’s rights;</li>
        <li>attempt to access accounts, repositories or data that are not yours;</li>
        <li>interfere with or overload the Service, or get around rate limits or plan limits;</li>
        <li>reverse engineer the Service except where the law allows it;</li>
        <li>resell the Service or use it to build a competing product without our written permission;</li>
        <li>submit malware or content designed to harm the Service or other users.</li>
      </ul>

      <h2>5. Plans, usage limits and payment</h2>
      <ul>
        <li>
          Plans, prices and usage limits are shown on our <Link href="/pricing">pricing page</Link> and in the app, and
          may change. We will give notice before a price change affects a plan you are paying for.
        </li>
        <li>Paid plans run in 30-day terms and return to the Free plan at the end of a term unless renewed.</li>
        <li>
          Technical due diligence engagements are priced and scoped separately in writing; those terms take precedence
          for that engagement.
        </li>
        <li>Except where the law requires otherwise, fees already paid are not refundable.</li>
      </ul>

      <h2>6. AI-generated output</h2>
      <p>
        Findings, risk ratings, cost estimates and suggested fixes are produced by automated analysis and AI models.
        They can be incomplete or wrong. They are not legal, financial, investment or security certification advice.
        Review them before relying on them, and test any fix before you deploy it. Remediation cost estimates are
        planning estimates, not quotes.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service works with third parties such as GitHub, GitLab and AI model providers. Your use of those services
        is governed by their own terms, and we are not responsible for them.
      </p>

      <h2>8. Our intellectual property</h2>
      <p>
        The Service, including its software, design and content (other than your code and content), belongs to Audit
        Bench Ai and its licensors. We give you a limited, non-exclusive, non-transferable right to use the Service
        under these Terms.
      </p>

      <h2>9. Suspension and termination</h2>
      <p>
        You can stop using the Service and close your account at any time. We may suspend or end access if you break
        these Terms, if required by law, or to protect the Service or other users. Where reasonable we will give notice
        first.
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available”. To the extent permitted by law, we disclaim all warranties,
        express or implied, including merchantability, fitness for a particular purpose and non-infringement. We do not
        promise the Service will be uninterrupted, error-free, or that it will find every issue in your code.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the extent permitted by law, Audit Bench Ai will not be liable for indirect, incidental, special,
        consequential or punitive damages, or for lost profits, revenue, data or goodwill. Our total liability for any
        claim relating to the Service is limited to the amount you paid us for the Service in the 12 months before the
        claim, or US$100 if you have not paid us. Some jurisdictions do not allow these limits, so they may not apply to
        you.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You agree to indemnify Audit Bench Ai against claims arising from code or content you submit without the right
        to do so, or from your breach of these Terms.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms. We will change the date at the top and, for material changes, notify account holders
        before they take effect. Continuing to use the Service after that means you accept the updated Terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms: <a href={`mailto:${CONTACT}`}>{CONTACT}</a> or our{' '}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
