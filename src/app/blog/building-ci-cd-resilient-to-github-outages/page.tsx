import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'building-ci-cd-resilient-to-github-outages')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function BuildingCiCdResilientToGithubOutagesPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Most teams build their entire deploy pipeline inside GitHub — Actions triggered by a push or merge,
        deploy gated on a GitHub-reported check status, secrets stored in GitHub&apos;s own secret store. It
        works well, right up until GitHub Actions has an incident. When that happens, deploys freeze completely,
        even though the application, the cloud infrastructure, and the team are all perfectly fine. The outage
        that actually stops you from shipping is not in your product — it is in the tool you used to automate
        shipping it.
      </p>

      <h2>The hidden dependency in most pipelines</h2>
      <p>
        A typical setup has the entire release path — build, test, and deploy — living inside a single GitHub
        Actions workflow. That workflow is dispatched, scheduled, and run by GitHub&apos;s own infrastructure. If
        that control plane degrades, it does not matter that your build would succeed and your deploy target is
        healthy — the step that kicks the process off never runs. Reviewing your pipeline with this in mind means
        asking a specific question: if GitHub Actions were unavailable right now, is there any way at all to ship
        a critical fix?
      </p>

      <h2>Decoupling build and test from deploy</h2>
      <p>
        Self-hosted runners reduce part of the risk — the actual build and test execution happens on infrastructure
        you control — but the workflow is still dispatched by GitHub, so a control-plane incident can still block
        it. A more resilient setup treats deploy as a separate, independently triggerable step from build and
        test, so that even if the automated trigger path is unavailable, deploy can be invoked directly against
        your own infrastructure without waiting on GitHub to schedule anything.
      </p>

      <h2>A manual override path for deploys</h2>
      <p>
        The most valuable thing you can build before you need it is a documented, tested way to deploy a specific
        commit without going through GitHub Actions at all — a script that pulls a known-good artifact and runs
        the same deploy steps a workflow would, gated by the same checks a human can verify manually, with a clear
        sign-off requirement. This should not be a shortcut that skips safety controls; it should be the same
        release process with a different trigger, exercised occasionally so it is not untested state waiting to
        fail during a real incident.
      </p>

      <h2>Artifacts and mirrors reduce blast radius</h2>
      <ul>
        <li>Store build artifacts in a registry that is not solely gated by GitHub Packages, so a past build
        remains retrievable even during a GitHub incident.</li>
        <li>Mirror critical repositories to a secondary git host or a self-hosted git server for read access —
        it does not need to be actively used day to day, just present and current for the day you need it.</li>
        <li>Keep deploy credentials and secrets in a secret manager independent of GitHub-hosted secrets, so a
        manual deploy path does not itself depend on the system that is degraded.</li>
        <li>Document which specific steps in your pipeline call out to GitHub&apos;s API versus your own
        infrastructure, so the dependency is visible instead of implicit.</li>
      </ul>

      <h2>Checklist for evaluating your own pipeline&apos;s resilience</h2>
      <ol>
        <li>Can you identify a specific commit&apos;s build artifact without going through the GitHub UI or API?</li>
        <li>Is there a tested, documented way to trigger a deploy that does not depend on Actions being
        available?</li>
        <li>Do your deploy credentials live somewhere reachable even if GitHub-hosted secrets are unavailable?</li>
        <li>Has anyone actually run the manual deploy path recently, or does it only exist as an untested
        assumption?</li>
      </ol>

      <h2>This is not about distrust of GitHub</h2>
      <p>
        None of this is an argument against using GitHub Actions as your primary pipeline — it is a well-built,
        widely used system, and for most teams most of the time it is the right default. The point is narrower:
        any single vendor, however reliable, will occasionally have an incident, and the cost of building one
        tested manual path is far lower than the cost of being unable to ship a critical fix during the one
        window when it matters most.
      </p>

      <p>
        <Link href="/blog/automate-pr-reviews-with-ai" className="font-semibold">
          Read about automating PR reviews with AI →
        </Link>
      </p>

      <p>
        <Link href="/blog/secrets-in-ci-cd" className="font-semibold">
          See what usually goes wrong with secrets in CI/CD →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
