import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Github, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getDocSections } from "../lib/content";

const navItems = [
  { label: "Languages", href: "/languages" },
  { label: "Data Structures", href: "/ds" },
  { label: "Algorithms", href: "/algo" },
  { label: "System Design", href: "/sys-design" },
  { label: "Building", href: "/building" },
  { label: "Blog", href: "/blog" },
];

const Navbar = React.memo(() => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const [isMobileLanguagesOpen, setIsMobileLanguagesOpen] = useState(false);

  const languageMenuItems = useMemo(() => {
    const sections = getDocSections();
    const languageGroups = sections["/languages"]?.groups ?? [];

    return languageGroups
      .map((group) => {
        const firstItem = group.items[0];
        return {
          title: group.title,
          href: firstItem ? `/languages/${firstItem.slug}` : "/languages",
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-50 text-2xl tracking-tight lobster-two-bold"
            onClick={() => {
              setIsMenuOpen(false);
              setIsMobileLanguagesOpen(false);
            }}
          >
            CodeCript
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-neutral-400 font-semibold tracking-wider">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const isLanguages = item.href === "/languages";
              const isDropdownOpen = activeHoverMenu === item.href;
              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => {
                    if (isLanguages) setActiveHoverMenu(item.href);
                  }}
                  onMouseLeave={() => {
                    if (isLanguages) setActiveHoverMenu(null);
                  }}
                >
                  <Link
                    to={item.href}
                    className={`inline-flex items-center gap-1 hover:text-neutral-50 transition-colors duration-200 decoration-2 underline-offset-4 ${
                      isActive ? "text-neutral-50 underline" : ""
                    }`}
                  >
                    {item.label}
                    {isLanguages &&
                      (isDropdownOpen ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      ))}
                  </Link>
                  {isLanguages && isDropdownOpen && (
                    <div className="absolute left-0 top-full pt-3">
                      <div className="w-56 rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-md shadow-2xl p-2">
                        <p className="px-2 pb-1 text-[11px] tracking-widest uppercase text-neutral-500 font-bold">
                          Languages
                        </p>
                        <ul className="flex flex-col gap-1">
                          {languageMenuItems.map((language) => (
                            <li key={language.href}>
                              <Link
                                to={language.href}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 hover:text-neutral-50 hover:bg-neutral-900 transition-colors"
                              >
                                {language.title}
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

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-50 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
            <Github size={18} />
            <span className="hidden sm:inline">Star on GitHub</span>
          </button>

          <button
            className="md:hidden p-2 text-neutral-400 hover:text-neutral-50 transition-colors"
            onClick={() => {
              setIsMenuOpen((prev) => {
                const next = !prev;
                if (!next) setIsMobileLanguagesOpen(false);
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
        <div className="md:hidden absolute top-full left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-md px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl">
          <ul className="flex flex-col gap-4 text-base text-neutral-400 font-medium">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const isLanguages = item.href === "/languages";

              if (isLanguages) {
                return (
                  <li key={item.href} className="flex flex-col">
                    <button
                      type="button"
                      className={`inline-flex items-center justify-between py-2 hover:text-neutral-50 transition-colors ${
                        isActive ? "text-neutral-50" : ""
                      }`}
                      onClick={() =>
                        setIsMobileLanguagesOpen((prev) => !prev)
                      }
                    >
                      <span>{item.label}</span>
                      {isMobileLanguagesOpen ? (
                        <ChevronUp size={14} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={14} aria-hidden="true" />
                      )}
                    </button>

                    {isMobileLanguagesOpen && (
                      <ul className="mt-1 ml-2 pl-3 border-l border-neutral-800 flex flex-col gap-1">
                        {languageMenuItems.map((language) => (
                          <li key={language.href}>
                            <Link
                              to={language.href}
                              className="block rounded-md px-2 py-1.5 text-sm text-neutral-400 hover:text-neutral-50 hover:bg-neutral-900/70 transition-colors"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsMobileLanguagesOpen(false);
                              }}
                            >
                              {language.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`inline-flex items-center gap-1 py-2 hover:text-neutral-50 transition-colors ${
                      isActive ? "text-neutral-50" : ""
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsMobileLanguagesOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
});

export default Navbar;
