import { githubOAuthUrl, gitlabOAuthUrl } from '@/lib/api';
import { GithubLogoIcon, GitlabLogoIcon } from './icons';

export function OAuthButtons() {
  return (
    <div className="mb-5 space-y-2.5">
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
