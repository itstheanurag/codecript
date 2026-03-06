import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DocItem, DocGroup } from "../lib/content";

interface SidebarProps {
  basePath: string;
  items: DocItem[];
  groups?: DocGroup[];
  onItemClick?: () => void;
}

const Sidebar = ({ basePath, items, groups, onItemClick }: SidebarProps) => {
  const location = useLocation();
  const selectedLanguage =
    basePath === "/languages"
      ? location.pathname.replace("/languages/", "").split("/")[0] || null
      : null;

  const visibleGroups =
    basePath === "/languages" && selectedLanguage
      ? groups?.filter(
          (group) =>
            group.items[0]?.slug.split("/")[0]?.toLowerCase() ===
            selectedLanguage.toLowerCase(),
        )
      : groups;

  return (
    <aside className="w-64 h-full shrink-0 border-r border-neutral-800 overflow-y-auto bg-neutral-950 lg:bg-transparent">
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
                onClick={onItemClick}
              />
            ))}

          {visibleGroups?.map((group) => (
            <SidebarGroup
              key={group.title}
              group={group}
              basePath={basePath}
              pathname={location.pathname}
              onItemClick={onItemClick}
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
  onItemClick,
}: {
  group: DocGroup;
  basePath: string;
  pathname: string;
  onItemClick?: () => void;
}) => {
  const isAnyActive = group.items.some(
    (item) => pathname === `${basePath}/${item.slug}`,
  );
  const [isOpen, setIsOpen] = useState<boolean>(isAnyActive || true);

  return (
    <div className="flex flex-col mt-4 first:mt-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1.5 text-xs font-bold text-neutral-500 tracking-widest hover:text-neutral-50 transition-colors group"
      >
        {group.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          } group-hover:text-neutral-50`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 ml-2 border-l border-neutral-900 pl-2">
          {group.items.map((item) => (
            <SidebarLink
              key={item.slug}
              to={`${basePath}/${item.slug}`}
              title={item.meta.title}
              isActive={pathname === `${basePath}/${item.slug}`}
              onClick={onItemClick}
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
  onClick,
}: {
  to: string;
  title: string;
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-neutral-900 text-neutral-50"
        : "text-neutral-400 hover:text-neutral-50 hover:bg-neutral-900"
    }`}
  >
    {title}
  </Link>
);

export default Sidebar;
