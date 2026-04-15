import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Github, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getDocSections } from "../lib/content";
import SearchOverlay from "./SearchOverlay";
import { Search } from "lucide-react";

const navGroups = [
  {
    label: "Languages",
    href: "/languages",
    isDynamic: true,
  },
  {
    label: "Core CS",
    children: [
      { label: "Data Structures", href: "/ds" },
      { label: "Algorithms", href: "/algo" },
      { label: "Building", href: "/building" },
    ],
  },
  {
    label: "Design",
    children: [
      { label: "System Design", href: "/sys-design" },
      { label: "LLD", href: "/lld" },
    ],
  },
  {
    label: "Interview Prep",
    children: [
      { label: "Behavioral", href: "/behavioral" },
      { label: "Fundamentals", href: "/fundamentals" },
    ],
  },
];

const Navbar = React.memo(() => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const [openMobileGroups, setOpenMobileGroups] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const languageMenuItems = useMemo(() => {
    const sections = getDocSections();
    const languageGroups = sections["/languages"]?.groups ?? [];

    return languageGroups
      .map((group) => {
        const firstItem = group.items[0];
        return {
          label: group.title,
          href: firstItem ? `/languages/${firstItem.slug}` : "/languages",
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const toggleMobileGroup = (label: string) => {
    setOpenMobileGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-50 text-2xl tracking-tight lobster-two-bold"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMobileGroups({});
            }}
          >
            CodeCript
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-neutral-400 font-semibold tracking-wider">
            {navGroups.map((group) => {
              const children = group.isDynamic ? languageMenuItems : group.children;
              const hasChildren = !!children?.length;
              const isGroupActive = group.href && location.pathname.startsWith(group.href) || 
                                   children?.some(child => location.pathname.startsWith(child.href));
              const isDropdownOpen = activeHoverMenu === group.label;

              return (
                <li
                  key={group.label}
                  className="relative"
                  onMouseEnter={() => {
                    if (hasChildren) setActiveHoverMenu(group.label);
                  }}
                  onMouseLeave={() => {
                    if (hasChildren) setActiveHoverMenu(null);
                  }}
                >
                  <div
                    className={`inline-flex items-center gap-1 cursor-pointer hover:text-neutral-50 transition-colors duration-200 decoration-2 underline-offset-4 ${
                      isGroupActive ? "text-neutral-50 underline" : ""
                    }`}
                  >
                    {group.label}
                    {hasChildren &&
                      (isDropdownOpen ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      ))}
                  </div>

                  {hasChildren && isDropdownOpen && (
                    <div className="absolute left-0 top-full pt-3">
                      <div className="w-56 rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-md shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <p className="px-2 pb-1 text-[10px] tracking-widest uppercase text-neutral-500 font-bold">
                          {group.label}
                        </p>
                        <ul className="flex flex-col gap-1">
                          {children.map((child) => (
                            <li key={child.href}>
                              <Link
                                to={child.href}
                                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                  location.pathname.startsWith(child.href) 
                                  ? "text-neutral-50 bg-white/5" 
                                  : "text-neutral-400 hover:text-neutral-50 hover:bg-neutral-900"
                                }`}
                                onClick={() => setActiveHoverMenu(null)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800 transition-all font-medium text-xs group"
          >
            <Search size={16} />
            <span className="hidden lg:inline">Search...</span>
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800 text-[9px] font-bold">
              <span className="group-hover:text-white">⌘</span>
              <span className="group-hover:text-white">K</span>
            </div>
          </button>

          <a
            href="https://github.com/itstheanurag/codecript"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-50 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
          >
            <Github size={18} />
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>

          <button
            className="md:hidden p-2 text-neutral-400 hover:text-neutral-50 transition-colors"
            onClick={() => {
              setIsMenuOpen((prev) => {
                const next = !prev;
                if (!next) setOpenMobileGroups({});
                return next;
              });
            }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl overflow-y-auto max-h-[80vh]">
          <ul className="flex flex-col gap-4 text-base text-neutral-400 font-medium">
            {navGroups.map((group) => {
              const children = group.isDynamic ? languageMenuItems : group.children;
              const isGroupActive = group.href && location.pathname.startsWith(group.href) || 
                                   children?.some(child => location.pathname.startsWith(child.href));
              const isOpen = openMobileGroups[group.label];

              return (
                <li key={group.label} className="flex flex-col">
                  <button
                    type="button"
                    className={`inline-flex items-center justify-between py-2 hover:text-neutral-50 transition-colors ${
                      isGroupActive ? "text-neutral-50" : ""
                    }`}
                    onClick={() => toggleMobileGroup(group.label)}
                  >
                    <span>{group.label}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isOpen && (
                    <ul className="mt-1 ml-2 pl-3 border-l border-neutral-800 flex flex-col gap-1">
                      {children?.map((child) => (
                        <li key={child.href}>
                          <Link
                            to={child.href}
                            className={`block rounded-md px-2 py-2 text-sm transition-colors ${
                              location.pathname.startsWith(child.href)
                              ? "text-neutral-50 bg-white/5"
                              : "text-neutral-400 hover:text-neutral-50 hover:bg-neutral-900/70"
                            }`}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setOpenMobileGroups({});
                            }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
});

export default Navbar;
