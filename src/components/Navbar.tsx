import React, { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Github,
  Menu,
  X,
  BookOpen,
} from "lucide-react";
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
      { label: "Fundamentals", href: "/fundamentals" },
      { label: "Data Structures", href: "/ds" },
      { label: "Algorithms", href: "/algo" },
      { label: "Databases", href: "/databases" },
      { label: "Concurrency", href: "/concurrency" },
    ],
  },
  {
    label: "Design",
    children: [
      { label: "API Design", href: "/api-design" },
      { label: "LLD", href: "/lld" },
      { label: "System Design", href: "/sys-design" },
      { label: "Building", href: "/building" },
    ],
  },
  {
    label: "Engineering",
    children: [
      { label: "Testing", href: "/testing" },
      { label: "DevOps", href: "/devops" },
      { label: "Behavioral", href: "/behavioral" },
    ],
  },
];

const Navbar = React.memo(() => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const [openMobileGroups, setOpenMobileGroups] = useState<
    Record<string, boolean>
  >({});
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
    setOpenMobileGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <nav className="sticky top-0 z-50 bg-paper-100/90 backdrop-blur-md border-b border-paper-300 shadow-xs">
      <div className="flex items-center justify-between px-6 py-2.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink group select-none"
            onClick={() => {
              setIsMenuOpen(false);
              setOpenMobileGroups({});
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-ink text-paper-50 flex items-center justify-center shadow-xs group-hover:bg-accent transition-colors">
              <BookOpen size={16} className="shrink-0" />
            </div>
            <span className="font-serif font-bold text-[19px] tracking-[-0.02em] text-ink">
              Code<span className="text-accent font-semibold">Cript</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-5 text-sm text-ink-muted font-medium tracking-wide">
            {navGroups.map((group) => {
              const children = group.isDynamic
                ? languageMenuItems
                : group.children;
              const hasChildren = !!children?.length;
              const isGroupActive =
                (group.href && location.pathname.startsWith(group.href)) ||
                children?.some((child) =>
                  location.pathname.startsWith(child.href),
                );
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
                    className={`inline-flex items-center gap-1 cursor-pointer py-1 hover:text-ink transition-colors duration-200 ${
                      isGroupActive
                        ? "text-ink font-semibold border-b-2 border-accent"
                        : ""
                    }`}
                  >
                    <span>{group.label}</span>
                    {hasChildren &&
                      (isDropdownOpen ? (
                        <ChevronUp size={13} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={13} aria-hidden="true" />
                      ))}
                  </div>

                  {hasChildren && isDropdownOpen && (
                    <div className="absolute left-0 top-full pt-2">
                      <div className="w-56 rounded-xl border border-paper-300 bg-paper-50 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <p className="px-2 pb-1 text-[10px] tracking-widest uppercase text-ink-muted font-bold font-sans">
                          {group.label}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                          {children.map((child) => (
                            <li key={child.href}>
                              <Link
                                to={child.href}
                                className={`block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                  location.pathname.startsWith(child.href)
                                    ? "text-ink bg-paper-200 font-semibold"
                                    : "text-ink-secondary hover:text-ink hover:bg-paper-100"
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

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-200 border border-paper-300 text-ink-muted hover:text-ink hover:bg-paper-300 transition-all font-medium text-xs group cursor-pointer"
            aria-label="Search curriculum"
          >
            <Search size={15} />
            <span className="hidden lg:inline font-sans">
              Search reading guides...
            </span>
            <span className="lg:hidden inline font-sans">Search</span>
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-paper-300 text-[10px] font-bold text-ink-muted">
              <span>⌘</span>
              <span>K</span>
            </div>
          </button>

          <a
            href="https://github.com/itstheanurag/codecript"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-ink hover:bg-ink-secondary text-paper-50 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all shadow-xs"
          >
            <Github size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button
            className="md:hidden p-1.5 text-ink-muted hover:text-ink transition-colors rounded-md hover:bg-paper-200"
            onClick={() => {
              setIsMenuOpen((prev) => {
                const next = !prev;
                if (!next) setOpenMobileGroups({});
                return next;
              });
            }}
            aria-label="Toggle Navigation"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-paper-300 bg-paper-50 px-6 py-4 shadow-xl overflow-y-auto max-h-[80vh]">
          <ul className="flex flex-col gap-3 text-base text-ink-secondary font-medium">
            {navGroups.map((group) => {
              const children = group.isDynamic
                ? languageMenuItems
                : group.children;
              const isGroupActive =
                (group.href && location.pathname.startsWith(group.href)) ||
                children?.some((child) =>
                  location.pathname.startsWith(child.href),
                );
              const isOpen = openMobileGroups[group.label];

              return (
                <li key={group.label} className="flex flex-col">
                  <button
                    type="button"
                    className={`inline-flex items-center justify-between py-2 text-left hover:text-ink transition-colors ${
                      isGroupActive ? "text-ink font-bold" : ""
                    }`}
                    onClick={() => toggleMobileGroup(group.label)}
                  >
                    <span>{group.label}</span>
                    {isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {isOpen && (
                    <ul className="mt-1 ml-2 pl-3 border-l border-paper-300 flex flex-col gap-1">
                      {children?.map((child) => (
                        <li key={child.href}>
                          <Link
                            to={child.href}
                            className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                              location.pathname.startsWith(child.href)
                                ? "text-ink bg-paper-200 font-semibold"
                                : "text-ink-muted hover:text-ink hover:bg-paper-100"
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

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </nav>
  );
});

export default Navbar;
