import { githubOAuthUrl, gitlabOAuthUrl, googleOAuthUrl } from '@/lib/api';
import { GithubLogoIcon, GitlabLogoIcon } from './icons';

function GoogleBadge() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#4285F4_0_25%,#34A853_25%_50%,#FBBC05_50%_75%,#EA4335_75%_100%)] p-[2px]"
    >
      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0F1318] text-[11px] font-black leading-none text-white">
        G
      </span>
    </span>
  );
}

export function OAuthButtons() {
  return (
    <div className="mb-5 space-y-2.5">
      <a
        href={googleOAuthUrl()}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm font-bold text-[#E8ECF4] transition-colors hover:border-muted-on-ink hover:bg-ink-line"
      >
        <GoogleBadge />
        Continue with Google
      </a>
      <a
        href={githubOAuthUrl()}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm font-bold text-[#E8ECF4] transition-colors hover:border-muted-on-ink hover:bg-ink-line"
      >
        <GithubLogoIcon className="h-[18px] w-[18px] shrink-0" />
        Continue with GitHub
      </a>
      <a
        href={gitlabOAuthUrl()}
        className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm font-bold text-[#E8ECF4] transition-colors hover:border-muted-on-ink hover:bg-ink-line"
      >
        <GitlabLogoIcon className="h-[18px] w-[18px] shrink-0" />
        Continue with GitLab
      </a>

      <div className="flex items-center gap-3 pt-1.5">
        <div className="h-px flex-1 bg-ink-line" />
        <span className="font-mono text-[10px] font-bold tracking-wide text-muted-on-ink uppercase">
          or use email
        </span>
        <div className="h-px flex-1 bg-ink-line" />
      </div>
    </div>
  );
}
