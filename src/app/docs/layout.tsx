import { Footer } from '@/components/Footer';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsToc } from '@/components/docs/DocsToc';

/** Docs shell: navigation on the left, the page in the middle, "On this page" on the right (wide screens). */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto flex w-full max-w-[90rem] flex-col bg-ink lg:flex-row">
        <DocsSidebar />
        {/* data-app-content: page transitions animate this column, not the sidebar. */}
        <div data-app-content className="flex min-w-0 flex-1 justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-3xl min-w-0">{children}</div>
          <aside className="hidden w-56 shrink-0 pl-10 xl:block">
            <div className="sticky top-10">
              <DocsToc />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
