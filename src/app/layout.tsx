import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import { Navbar } from "@/components/Navbar";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI code review before it ships`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI code review",
    "code audit",
    "static analysis",
    "security review",
    "security vulnerability scanner",
    "pull request review",
    "PR review bot",
    "GitHub PR review",
    "GitLab MR review",
    "merge request review",
    "code quality",
    "architecture review",
    "performance review",
    "test coverage analysis",
    "technical debt",
    "code review CLI",
    "CI/CD code review",
    "VS Code code review extension",
    "AI code security scanner",
    "CodeRabbit alternative",
    "CodeRabbit AI code review",
    "Qodo alternative",
    "Qodo AI code review",
    "Greptile alternative",
    "Codacy alternative",
    "DeepSource alternative",
    "SonarQube alternative",
    "Semgrep alternative",
    "Cursor AI",
    "code review AI",
    "AI code reviewer",
    "AI-powered code review",
    "AI powered code review tool",
    "AI powered code review tools",
    "best AI code review tools",
    "AI code review tools 2026",
    "GitHub AI code review",
    "GitLab AI code review",
    "code audit tools free",
    "code audit tools github",
    "best code audit tools",
    "free code analysis tools",
    "SAST tools",
    "free AI code review tools",
    "static code analysis tools",
    "static code analysis tools free",
    "AI code review tool",
    "automated code review",
    "AI security scanner",
    "AI pull request review",
    "secure code review software",
    "AuditBench alternatives",
    "AI code review vs manual review",
    "static analysis vs AI code review",
    "OWASP Top 10",
    "secure coding practices",
    "code review checklist",
    "DevSecOps guide",
    "software security testing",
    "AI code review for React",
    "AI code review for Node.js",
    "AI code review for Python",
    "AI code review for Java",
    "AI code review for C#",
    "linter",
    "code review",
    "GitHub",
    "AI alignment auditing",
    "AI red teaming",
    "hidden behavior detection",
    "LLM evaluation",
    "audit bench",
    "auditbench",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI code review before it ships`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI code review before it ships`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#10141c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <WebVitalsReporter />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
