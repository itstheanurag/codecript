import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DocItem, DocGroup } from "../lib/content";

interface SidebarProps {
  basePath: string;
  items: DocItem[];
  groups?: DocGroup[];
}

const Sidebar = ({ basePath, items, groups }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 overflow-y-auto">
      <div className="p-6">
        <nav className="flex flex-col gap-1">
          {items
            .filter((item) => !item.slug.includes("/"))
            .map((item) => (
              <SidebarLink
                key={item.slug}
                to={`${basePath}/${item.slug}`}
                title={item.meta.title}
                isActive={location.pathname === `${basePath}/${item.slug}`}
              />
            ))}

          {groups?.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              basePath={basePath}
              pathname={location.pathname}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

const SidebarGroup = ({
  group,
  basePath,
  pathname,
}: {
  group: DocGroup;
  basePath: string;
  pathname: string;
}) => {
  const isAnyActive = group.items.some(
    (item) => pathname === `${basePath}/${item.slug}`,
  );
  const [isOpen, setIsOpen] = useState<boolean>(isAnyActive || true);

  return (
    <div className="flex flex-col gap-1 mt-4 first:mt-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1.5 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors group"
      >
        {group.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          } group-hover:text-white`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 ml-2 border-l border-white/5 pl-2">
          {group.items.map((item) => (
            <SidebarLink
              key={item.slug}
              to={`${basePath}/${item.slug}`}
              title={item.meta.title}
              isActive={pathname === `${basePath}/${item.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({
  to,
  title,
  isActive,
}: {
  to: string;
  title: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-white/10 text-white"
        : "text-zinc-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {title}
  </Link>
);

export default Sidebar;
