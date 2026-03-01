import { Link, useLocation } from "react-router-dom";
import type { DocItem } from "../lib/content";

interface SidebarProps {
  basePath: string;
  items: DocItem[];
}

const Sidebar = ({ basePath, items }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 overflow-y-auto">
      <div className="p-6">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const itemPath = `${basePath}/${item.slug}`;
            const isActive = location.pathname === itemPath;

            return (
              <Link
                key={item.slug}
                to={itemPath}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.meta.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
