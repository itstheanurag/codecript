import { useRef, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const slug = params["*"];
  const currentItem = slug ? section?.items.find((i) => i.slug === slug) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="max-w-[90rem] mx-auto border-x border-neutral-800 flex-1 w-full min-h-0 relative">
        <div className="flex h-full">
          {/* Mobile Sidebar Toggle */}
          {section && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 z-40 p-4 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 shadow-2xl hover:text-neutral-50 transition-all hover:scale-110 active:scale-95"
            >
              {isSidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          )}

          {section && (
            <>
              {/* Desktop Sidebar */}
              <div className="hidden lg:block h-full">
                <Sidebar
                  basePath={section.basePath}
                  items={section.items}
                  groups={section.groups}
                />
              </div>

              {/* Mobile Sidebar Overlay */}
              {isSidebarOpen && (
                <div
                  className="lg:hidden fixed inset-0 z-30 bg-neutral-950/80 backdrop-blur-sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-950 border-r border-neutral-800 animate-in slide-in-from-left duration-300"
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

          <main ref={mainRef} className="flex-1 overflow-y-auto w-full">
            <div className="px-4 md:px-8 py-4 max-w-full overflow-x-hidden">
              <Outlet
                context={
                  { scrollContainerRef: mainRef } satisfies DocLayoutContext
                }
              />
            </div>
          </main>
          {currentItem && (
            <aside className="w-64 shrink-0 border-l border-neutral-800 overflow-y-auto hidden xl:block">
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
