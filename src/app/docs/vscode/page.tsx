import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { DocPage, docMetadata } from '@/components/docs/DocPage';
import { Callout, H2, Kbd, Table } from '@/components/docs/blocks';

export const metadata = docMetadata('vscode');

const INSTALL = `git clone https://github.com/noumanas/audit-bench-vscode-extenstion.git
cd audit-bench-vscode-extenstion
npm install
npm run compile
npm run package
code --install-extension auditbench-vscode-0.1.0.vsix`;

export default function VscodeDocs() {
  return (
    <DocPage slug="vscode" updated="November 1, 2026">
      <p>
        The VS Code extension reviews the file you’re working on and shows findings where you’d see compiler errors:
        underlined in the editor and listed in the Problems panel. Fix things before they reach a pull request.
      </p>

      <H2>Install</H2>
      <Callout type="note">
        The extension isn’t on the VS Code Marketplace yet. Build and install it from source; it needs VS Code 1.85 or
        later.
      </Callout>
      <CodeBlock label="Terminal" code={INSTALL} />

      <H2>Sign in</H2>
      <ol>
        <li>
          In the app, open <Link href="/app/repository">Repository scan</Link> and copy your <strong>CLI / CI-CD API key</strong>{' '}
          (it starts with <code>abk_</code>).
        </li>
        <li>
          In VS Code, open the Command Palette (<Kbd>⌘</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd> on Mac, <Kbd>Ctrl</Kbd>{' '}
          <Kbd>Shift</Kbd> <Kbd>P</Kbd> elsewhere) and run <strong>Audit Bench Ai: Set API Key</strong>.
        </li>
        <li>Paste the key. It’s kept in VS Code’s secure storage, not in your settings.</li>
      </ol>

      <H2>Commands</H2>
      <Table
        head={['Command', 'What it does']}
        rows={[
          ['Audit Current File', 'Review the open file. Also in the editor’s right-click menu and title bar'],
          ['Fix All Issues with AI', 'Apply fixes for the file’s findings, then recheck. Needs a plan with repository scanning; up to three AI calls'],
          ['Clear Findings', 'Remove the current findings from the editor'],
          ['Account & Usage', 'Your plan and remaining usage'],
          ['Show Logs', 'The extension’s log, for troubleshooting'],
          ['Set API Key', 'Sign in or switch accounts'],
        ]}
      />
      <p>
        Findings appear as diagnostics; hover one for the full explanation and suggested fix. The status bar shows the
        verdict, what the review cost, and your plan’s remaining usage.
      </p>

      <H2>Settings</H2>
      <Table
        head={['Setting', 'Default', 'Meaning']}
        rows={[
          [<code key="s">auditbench.auditOnSave</code>, 'Off', 'Review a file every time you save it'],
          [<code key="w">auditbench.warnAboveChars</code>, '20000', 'Ask before sending a file larger than this (0 turns the warning off)'],
          [<code key="p">auditbench.provider</code>, 'Account default', 'Use a specific AI provider'],
          [<code key="u">auditbench.apiUrl</code>, 'Audit Bench Ai cloud', 'Point at a different server (self-hosted setups)'],
        ]}
      />

      <H2>Privacy in the editor</H2>
      <ul>
        <li>
          The extension sends the <strong>whole file</strong> you review, not just a diff. The first time, it explains
          this and asks you to confirm.
        </li>
        <li>It warns you before sending files that look like secrets, such as <code>.env</code> files or keys.</li>
        <li>Nothing is sent until you run a review, unless you turn on review on save.</li>
      </ul>
      <p>
        See <Link href="/docs/security">Security and data</Link> for what happens to the code after that.
      </p>
    </DocPage>
  );
}
