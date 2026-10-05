import { Link, useLocation } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { DocItem, DocGroup } from "../lib/content";
import { docHref } from "../lib/seo";

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
    <aside className="w-64 h-full shrink-0 border-r border-paper-300 overflow-y-auto bg-paper-100">
      <div className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-muted px-2 mb-3 font-sans">
          Curriculum Index
        </div>
        <nav className="flex flex-col gap-1">
          {items
            .filter((item) => !item.slug.includes("/"))
            .map((item) => {
              const to = docHref(basePath, item.slug);
              const isActive =
                location.pathname === to ||
                location.pathname === `${basePath}/${item.slug}`;
              return (
                <SidebarLink
                  key={item.slug}
                  to={to}
                  title={item.meta.title}
                  isActive={isActive}
                  onClick={onItemClick}
                />
              );
            })}

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
  const isAnyActive = group.items.some((item, index) => {
    const itemHref = docHref(basePath, item.slug);
    const groupRootHref = `${basePath}/${item.slug.split("/")[0]}`;
    return pathname === itemHref || (pathname === groupRootHref && index === 0);
  });
  const [isOpen, setIsOpen] = useState<boolean>(isAnyActive || true);

  return (
    <div className="flex flex-col mt-4 first:mt-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1.5 text-xs font-bold text-ink-secondary tracking-widest uppercase hover:text-ink transition-colors group cursor-pointer font-sans"
      >
        <span>{group.title}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          } text-ink-muted group-hover:text-ink`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-0.5 ml-1 border-l border-paper-300 pl-2 mt-1">
          {group.items.map((item, index) => {
            const itemHref = docHref(basePath, item.slug);
            const groupRootHref = `${basePath}/${item.slug.split("/")[0]}`;
            const isActive =
              pathname === itemHref ||
              (pathname === groupRootHref && index === 0);

            return (
              <SidebarLink
                key={item.slug}
                to={itemHref}
                title={item.meta.title}
                isActive={isActive}
                onClick={onItemClick}
              />
            );
          })}
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
}) => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      event.preventDefault();
    }
    onClick?.();
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-paper-200 text-ink font-semibold shadow-2xs border-l-2 border-accent"
          : "text-ink-muted hover:text-ink hover:bg-paper-200/60"
      }`}
    >
      {title}
    </Link>
  );
};

export default Sidebar;
