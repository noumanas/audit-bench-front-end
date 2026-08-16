import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BLOG_POSTS } from '@/lib/blog';

const POST = BLOG_POSTS.find((p) => p.slug === 'sql-injection-code-review-guide')!;

export const metadata: Metadata = {
  title: POST.title,
  description: POST.description,
  alternates: { canonical: `/blog/${POST.slug}` },
};

export default function SqlInjectionCodeReviewGuidePage() {
  return (
    <BlogArticleLayout slug={POST.slug} title={POST.title} publishedAt={POST.publishedAt} readingTime={POST.readingTime} image={POST.image}>
      <p>
        SQL injection has been a known, well-documented vulnerability for more than two decades, and it still shows
        up in modern codebases. Not because engineers do not know it exists, but because it hides in places that do
        not look like the classic textbook example. Nobody writes{' '}
        <code>&quot;SELECT * FROM users WHERE id = &quot; + userInput</code> on purpose anymore. Injection risk today
        lives in ORM escape hatches, dynamic sorting logic, report builders, and code that was written quickly to
        support a feature, not to withstand hostile input. Reviewing for it means knowing where those places are,
        not just recognizing the obvious pattern.
      </p>

      <h2>Where injection hides in modern codebases</h2>
      <ul>
        <li>Raw query strings built with string concatenation, f-strings, template literals, or the
        <code>%</code>/<code>.format()</code> operators, especially in one-off admin scripts or internal tools.</li>
        <li>ORM &quot;escape hatches&quot; — <code>.raw()</code>, <code>.execute()</code>, or a native query builder
        call used because the ORM&apos;s normal query API could not express what the developer needed.</li>
        <li>Dynamic sorting and filtering, where a column name or sort direction comes from a query parameter and is
        inserted directly into an <code>ORDER BY</code> or <code>WHERE</code> clause.</li>
        <li>Dynamic table or schema names, common in multi-tenant systems that shard data by client, where the table
        name itself is built from user-controlled input.</li>
        <li>Stored procedures and views that concatenate parameters internally, which reviewers often skip because
        the vulnerable code lives outside the application repository.</li>
      </ul>

      <h2>The one question that catches most injection bugs</h2>
      <p>
        For every query touched in a diff, a reviewer should be able to answer one question clearly: does any part
        of this query string get built by combining a fixed template with a value that ultimately came from a user
        — a request body, a query parameter, a header, or even a value pulled from the database that originated as
        user input earlier. If the answer is yes, the very next question is whether that value passes through a
        parameterized placeholder or gets inserted as literal text into the query. If it is inserted as text, that
        is an injection risk regardless of how unlikely the specific input seems today.
      </p>

      <h2>ORMs reduce risk but do not eliminate it</h2>
      <p>
        Teams that use an ORM often assume injection is solved by default, and for standard query construction that
        is largely true — most ORMs parameterize values automatically when you use their normal query-building API.
        The risk reappears in exactly the places where the ORM&apos;s abstraction runs out: raw SQL fragments passed
        to a <code>.raw()</code> or <code>.literal()</code> helper, dynamic column or table names (which most ORMs
        cannot parameterize the same way as values, because identifiers are not values), and complex filtering logic
        assembled from multiple optional conditions where a developer drops down to string building to keep the
        code simple.
      </p>

      <h2>Second-order injection is easy to miss</h2>
      <p>
        Not every injection risk is obvious at the point where user input enters the system. Second-order injection
        happens when a value is stored safely — as plain data, with no immediate query risk — and is later read back
        and used to build a different query without the same care. A username or display name stored safely on
        signup can become an injection vector months later if a reporting job builds a query by concatenating it
        into a filter. Reviewers should trace where stored values are reused in query construction, not only where
        they first enter the system.
      </p>

      <h2>Checklist before approving a PR that touches queries</h2>
      <ol>
        <li>Every value that varies per request is passed through a parameter placeholder, never concatenated or
        interpolated into the query string.</li>
        <li>Any raw SQL fragment has been checked specifically for concatenated user input, not just skimmed.</li>
        <li>Dynamic column, table, or sort-field names are validated against an explicit allow list, not passed
        through directly.</li>
        <li>Stored procedures or views involved in the change have been reviewed too, not assumed safe because they
        live outside the main codebase.</li>
        <li>Values that were previously stored as plain data and are now being reused in a new query have been
        checked for second-order risk.</li>
      </ol>

      <h2>Input validation is not a substitute for parameterization</h2>
      <p>
        Validating that an input looks like a reasonable username or a plausible number is good practice, but it is
        not the control that stops injection. Validation reduces the shape of bad input; parameterization removes
        the ability for input to change the structure of the query at all. A reviewer who sees strong validation but
        string-concatenated queries should still flag the query construction, because a sufficiently motivated
        attacker will find input that passes the validation and still breaks the query.
      </p>

      <p>
        <Link href="/blog/owasp-top-10-explained" className="font-semibold">
          Read the OWASP Top 10:2025, explained →
        </Link>
      </p>

      <p>
        <Link href="/blog/secure-code-review-for-api-changes" className="font-semibold">
          See how to review API changes for security risk →
        </Link>
      </p>
    </BlogArticleLayout>
  );
}
