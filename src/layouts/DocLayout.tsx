import { useRef, useState, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TableOfContents from "../components/TableOfContents";
import Breadcrumbs from "../components/Breadcrumbs";
import { getDocSections, resolveDocItem } from "../lib/content";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const slug = params["*"] || "index";
  const currentItem = section ? resolveDocItem(section, slug) : null;

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen h-dvh flex flex-col overflow-hidden bg-paper-100 text-ink">
      <Navbar />
      <div className="max-w-[96rem] mx-auto md:border-x border-paper-300 flex-1 w-full min-h-0 relative bg-paper-100">
        <div className="flex h-full">
          {/* Mobile Sidebar Toggle */}
          {section && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-3.5 rounded-full bg-ink border border-ink text-paper-50 shadow-2xl hover:bg-accent transition-all hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Toggle Table of Contents Sidebar"
            >
              {isSidebarOpen ? <X size={22} /> : <MenuIcon size={22} />}
            </button>
          )}

          {section && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block h-full shrink-0">
                <Sidebar
                  basePath={section.basePath}
                  items={section.items}
                  groups={section.groups}
                />
              </div>

              {/* Mobile Sidebar Overlay */}
              {isSidebarOpen && (
                <div
                  className="lg:hidden fixed inset-0 z-30 bg-ink/40 backdrop-blur-xs"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[min(20rem,86vw)] bg-paper-50 border-r border-paper-300 shadow-2xl animate-in slide-in-from-left duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Sidebar
                      basePath={section.basePath}
                      items={section.items}
                      groups={section.groups}
                      onItemClick={() => setIsSidebarOpen(false)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <main
            ref={mainRef}
            className="flex-1 min-w-0 overflow-y-auto w-full bg-paper-100"
          >
            <div className="px-6 sm:px-8 md:px-10 lg:px-12 py-6 max-w-4xl mx-auto overflow-x-hidden">
              <Breadcrumbs />
              <Outlet
                context={
                  { scrollContainerRef: mainRef } satisfies DocLayoutContext
                }
              />
            </div>
          </main>

          {currentItem && (
            <aside className="w-64 2xl:w-72 shrink-0 border-l border-paper-300 overflow-y-auto hidden xl:block bg-paper-100">
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
