import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getDocSections } from "../lib/content";

export const DocLayout = () => {
  const location = useLocation();
  const sections = getDocSections();
  const sectionKey = "/" + location.pathname.split("/")[1];
  const section = sections[sectionKey];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        {section && (
          <Sidebar basePath={section.basePath} items={section.items} />
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DocLayout;
