import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'ai-generated-code-n-plus-one-queries')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function AiGeneratedCodeNPlusOneQueriesPage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        Ask an AI assistant to &quot;show each order with its customer&apos;s name&quot; and a large share of the
        time you&apos;ll get a loop: fetch all the orders, then for each order fetch its customer. It works. It
        passes a manual test with ten seed rows. It also issues one query to load the orders and N more queries
        to load each order&apos;s customer, and on a production table with ten thousand orders that&apos;s ten
        thousand and one round trips to the database for a single page load. This is the N+1 query problem, and
        it is one of the most reliably recurring architectural bugs in AI-generated code.
      </p>

      <h2>Why the loop reads as correct</h2>
      <p>
        At the level of a single function, the code is doing exactly what was asked, in an order that makes
        intuitive sense: get the list, then get details for each item in the list. There&apos;s no syntax error,
        no obvious logic bug, and the output is correct. The defect is entirely about <em>cost</em>, not
        correctness, and cost is invisible unless you&apos;re specifically counting queries or testing against a
        dataset large enough to make the pattern hurt. An assistant generating code from a prompt has no
        visibility into your production row counts — it optimizes for &quot;produces the right output,&quot; and
        a loop produces the right output.
      </p>

      <h2>ORMs make the pattern easier to write, not harder to have</h2>
      <p>
        Modern ORMs (Active Record, Eloquent, SQLAlchemy, Prisma, TypeORM) make this worse in a specific way:
        their default lazy-loading behavior means accessing a related object — <code>order.customer.name</code>{' '}
        — triggers a query automatically, invisibly, at the point of access. The code doesn&apos;t look like
        it&apos;s making a database call at all; it looks like a property access. An AI assistant reaching for the
        most natural-looking way to express &quot;get the customer for this order&quot; will reach for exactly
        this syntax, because it&apos;s the idiomatic way the ORM is designed to be used — and it&apos;s also the
        one that silently produces N extra round trips.
      </p>

      <h2>Why this pattern specifically recurs across AI-generated code</h2>
      <p>
        Eager-loading the right relationship (<code>include</code>, <code>joinedload</code>, <code>with()</code>,
        depending on the ORM) requires knowing in advance which related data the calling code will need — a piece
        of intent that lives in the developer&apos;s head, not in the immediate prompt. Absent an explicit
        instruction to eager-load, the assistant has no signal that this particular query will run in a loop
        rather than once, so it defaults to the simplest correct expression of the request. Multiply this across
        every list-with-related-data feature in an application built prompt by prompt, and N+1 becomes the
        default shape of the data layer rather than an occasional lapse.
      </p>

      <h2>How to catch it before it reaches production</h2>
      <p>
        The most reliable check doesn&apos;t require reading the ORM code carefully — it requires counting.
        Logging or asserting the number of queries executed during a test against a realistic (not single-row)
        dataset turns an invisible cost into an assertion that fails loudly: &quot;this request issued 41
        queries, expected 2.&quot; Several ORMs and frameworks ship a query-count assertion helper or a
        development-mode query logger for exactly this reason — the tool exists; it just has to be pointed at the
        endpoints that return lists.
      </p>

      <h2>Checklist for reviewing a diff that loads related data</h2>
      <ol>
        <li>Any loop that accesses a related object or makes a per-item database call is a candidate for eager
        loading — check for it explicitly rather than trusting that the loop &quot;looks fine.&quot;</li>
        <li>Test list endpoints against a seeded dataset of realistic size (dozens or hundreds of rows, not
        one or two), where an N+1 pattern is slow enough to notice.</li>
        <li>Where the ORM supports it, assert on query count in tests for endpoints that return a list with
        related data, so a regression fails the test suite instead of showing up as a latency spike later.</li>
        <li>Treat &quot;returns a list with nested related data&quot; as a standing prompt to ask explicitly for
        eager loading, rather than trusting the assistant to infer it.</li>
      </ol>

      <p>
        <Link href="/blog/how-to-review-database-migrations-safely" className="font-semibold">
          Read how to review database migrations safely →
        </Link>
      </p>

      <p>
        <Link href="/blog/security-review-patterns-for-large-codebases" className="font-semibold">
          See security review patterns for large codebases →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
