import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/AuthContext";
import { Navbar } from "@/components/Navbar";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { StructuredData } from "@/components/StructuredData";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/blog?page={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI code review before it ships`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'AI code review',
    'auditbench',
    'audit bench',
    'audit ai code',
    'ai code audit',
    'ai audit for code quality',
    'ai code security checklist',
    'secure code review',
    'secure code review checklist',
    'secure coding checklist',
    'secure coding practices checklist',
    'pull request review',
    'pull request approval',
    'merge request review',
    'repository scan',
    'static analysis',
    'file-level code review',
    'secret scanning',
    'dependency vulnerability scanning',
    'code quality checks',
    'ai code review tools for large codebases',
    'ai code quality checker',
    'ai audit pricing',
    'building and evaluating alignment auditing agents',
    'align auditor',
    'owasp top 10',
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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FEK7GDD0FH"
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FEK7GDD0FH');
          `}
        </Script>
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <StructuredData data={[ORGANIZATION_SCHEMA, WEBSITE_SCHEMA]} />
        <WebVitalsReporter />
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
