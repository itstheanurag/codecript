import { useRef } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TableOfContents from "../components/TableOfContents";
import { getDocSections } from "../lib/content";

export interface DocLayoutContext {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

export const DocLayout = () => {
  const location = useLocation();
  const params = useParams();
  const sections = getDocSections();
  const sectionKey = "/" + location.pathname.split("/")[1];
  const section = sections[sectionKey];
  const mainRef = useRef<HTMLElement | null>(null);

  const slug = params["*"];
  const currentItem = slug ? section?.items.find((i) => i.slug === slug) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="max-w-[90rem] mx-auto border-x border-neutral-800 flex-1 w-full min-h-0">
        <div className="flex h-full">
          {section && (
            <Sidebar
              basePath={section.basePath}
              items={section.items}
              groups={section.groups}
            />
          )}
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            <div className="px-8 py-4">
              <Outlet
                context={
                  { scrollContainerRef: mainRef } satisfies DocLayoutContext
                }
              />
            </div>
          </main>
          {currentItem && (
            <aside className="w-56 shrink-0 border-l border-neutral-800 overflow-y-auto hidden xl:block">
              <TableOfContents
                content={currentItem.content}
                scrollContainerRef={mainRef}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocLayout;
