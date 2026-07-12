import type { NextConfig } from "next";

// @monaco-editor/react loads the actual Monaco assets from jsdelivr at
// runtime by default (no local loader.config() call in this app) — the CSP
// has to explicitly allow that CDN or the code editor breaks entirely.
const MONACO_CDN = "https://cdn.jsdelivr.net";

function apiOrigin(): string {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL ||
        "https://audit-bench-backend-git-242355763105.europe-west1.run.app",
    ).origin;
  } catch {
    return "";
  }
}

function contentSecurityPolicy(): string {
  // React/webpack dev-mode tooling (HMR, stack-trace reconstruction) uses
  // eval() — never in a production build, so this only loosens local dev.
  const devEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
  return [
    `default-src 'self'`,
    // 'unsafe-inline' is required for Next.js App Router's own hydration
    // payload scripts (streamed inline, no nonce support wired up here) —
    // a real gap from a zero-unsafe-inline ideal, but still a large
    // improvement over no CSP at all.
    `script-src 'self' 'unsafe-inline'${devEval} ${MONACO_CDN}`,
    `style-src 'self' 'unsafe-inline' ${MONACO_CDN}`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data: ${MONACO_CDN}`,
    `worker-src 'self' blob: ${MONACO_CDN}`,
    `connect-src 'self' ${MONACO_CDN} ${apiOrigin()}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ');
}

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
