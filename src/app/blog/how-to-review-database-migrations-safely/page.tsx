import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'how-to-review-database-migrations-safely')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function HowToReviewDatabaseMigrationsSafelyPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Most pull request checklists are built around application code: functions, endpoints, components, tests.
        Database migrations get treated as an afterthought, a file that runs once and disappears from view. That
        habit is exactly why migrations cause some of the worst production incidents a team will ever see. A bad
        migration does not just introduce a bug that gets caught and rolled back in the next deploy. It can lock a
        table for minutes under production load, silently drop data, or leave the schema in a state that no
        application version — old or new — can run against cleanly. Reviewing a migration well means reviewing it
        differently from a normal code change, because the failure modes are different and the blast radius is
        larger.
      </p>

      <h2>Why migrations deserve a separate review lens</h2>
      <p>
        A typical code change fails forward: you ship it, notice a bug, and ship a fix. A migration failure is
        often not that forgiving. Once a migration has run against production data, you cannot always just revert
        the commit. The schema has already changed, rows have already been rewritten or deleted, and a rollback
        migration has to undo real state, not just source code. Reviewers who treat a migration file like any other
        diff — reading it top to bottom for obvious typos — miss the questions that actually matter: what does this
        do to a table with real production volume, what happens if it fails halfway through, and what does the
        application look like during the window when the old code and the new schema exist at the same time.
      </p>

      <h2>Read the migration against production data volume, not the local database</h2>
      <p>
        A migration that runs instantly on a local database with a few hundred rows can behave completely
        differently against a table with tens of millions of rows in production. Reviewers should always ask what
        the target table actually looks like in production before approving a migration that touches it.
      </p>
      <ul>
        <li>Does this migration add a column with a default value on a large table, which can force a full table
        rewrite on some database engines?</li>
        <li>Does it add an index the normal way, which typically takes a lock for the duration of the build, or
        does it use a non-blocking / concurrent index creation path?</li>
        <li>Does it backfill data in a single statement, which can hold locks and generate a huge transaction log,
        or does it batch the backfill in small chunks?</li>
        <li>Does it change a column type, which usually means rewriting every row in the table?</li>
      </ul>
      <p>
        None of these are wrong to do. They are wrong to do without knowing the cost, and without a plan for
        running them safely against a table that real users are reading and writing to at the same time.
      </p>

      <h2>Locks are the real danger, not syntax errors</h2>
      <p>
        Syntax errors get caught immediately when a migration fails to run. The dangerous migrations are the ones
        that run successfully but hold a lock long enough to queue up every other query against that table,
        eventually exhausting connections or timing out requests across the whole application. A reviewer should
        specifically look for statements that acquire a lock on a hot table and ask how long that lock will be
        held under production load, not under test data.
      </p>
      <ol>
        <li>Identify every statement that touches an existing table with either DDL (adding, dropping, or altering
        columns and indexes) or a data rewrite.</li>
        <li>For each one, check whether the database engine and version being used requires a blocking lock for
        that operation, or supports a non-blocking equivalent.</li>
        <li>If a non-blocking equivalent exists and the table is large or frequently written to, that is the
        version that should ship, not the simpler blocking one.</li>
        <li>If a lock cannot be avoided, confirm the change is scheduled for low-traffic hours and that the team
        understands the expected duration.</li>
      </ol>

      <h2>Every migration needs a rollback path — and the rollback needs review too</h2>
      <p>
        A migration that adds a column is usually easy to reverse. A migration that drops a column, drops a table,
        or transforms data in place is not, because the rollback has to reconstruct information that may no longer
        exist. Reviewers should treat the down-migration, or the documented rollback plan, as part of the change
        being reviewed, not an optional extra. If the rollback plan is &quot;restore from backup,&quot; that should be stated
        explicitly, because it changes the acceptable blast radius and the incident response plan if something
        goes wrong after deploy.
      </p>

      <h2>The expand-and-contract pattern deserves its own checklist</h2>
      <p>
        The safest way to change a schema that is actively used by a running application is to avoid a moment where
        old code and new schema, or new code and old schema, are incompatible. This is usually done in stages: add
        the new column or table without removing the old one, deploy application code that writes to both, backfill
        existing data, deploy application code that reads from the new location, and only then remove the old
        column in a later migration. Reviewers should check which stage a given migration represents and confirm it
        does not skip ahead — for example, dropping an old column in the same deploy that starts writing to a new
        one, which breaks any instance of the application still running the previous version during a rolling
        deploy.
      </p>

      <h2>Data integrity questions the diff alone will not answer</h2>
      <ul>
        <li>Does this migration introduce a new constraint (NOT NULL, UNIQUE, a foreign key) that existing rows
        might already violate?</li>
        <li>If existing rows violate the new constraint, does the migration handle that data first, or will it fail
        outright when it runs?</li>
        <li>Does a data transformation step have a rollback, or is the original data lost the moment it runs?</li>
        <li>Is the migration idempotent — safe to re-run if a deploy is retried or partially applied — or will
        running it twice cause an error or duplicate data?</li>
      </ul>

      <h2>Review the migration and the application code together</h2>
      <p>
        A migration file rarely tells the whole story on its own. The application code in the same pull request, or
        a companion one, usually reveals whether the schema change is safe. If a column is being renamed, check
        whether the application code has a transition period where it reads from both the old and new name. If a
        table is being partitioned or sharded, check whether every query path in the codebase has been updated to
        route correctly, not just the ones the migration author remembered to change. A migration reviewed in
        isolation from its calling code is only half reviewed.
      </p>

      <h2>Questions worth asking before approving any migration</h2>
      <ol>
        <li>What is the size of the table in production right now, and how fast is it growing?</li>
        <li>Will this migration block reads, writes, or both, and for roughly how long?</li>
        <li>What happens if the migration fails halfway through — is it safe to retry, and is partial state
        recoverable?</li>
        <li>Is there a window during a rolling deploy where old and new application code both run against the
        changed schema, and does that window work correctly?</li>
        <li>What is the rollback plan, and has anyone verified it actually works, not just written it down?</li>
      </ol>

      <h2>Treat migrations as production changes, because they are</h2>
      <p>
        The most reliable teams do not review migrations more lightly because the file is short or the change looks
        simple. They review migrations more carefully, because the cost of getting a schema change wrong is paid in
        production incidents, not follow-up pull requests. A short migration file can carry more operational risk
        than a thousand-line application change, and the review process should reflect that, not the line count.
      </p>

      <p>
        <Link href="/blog/how-to-upgrade-dependencies-safely" className="font-semibold">
          Read about upgrading dependencies without breaking production →
        </Link>
      </p>

      <p>
        <Link href="/blog/how-to-spot-risk-in-pull-request-diffs" className="font-semibold">
          See how to spot risk in pull request diffs →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}