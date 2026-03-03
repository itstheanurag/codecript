import React, { useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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

  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-50 text-2xl tracking-tight lobster-two-bold"
            onClick={() => setIsMenuOpen(false)}
          >
            CodeCript
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-neutral-400 font-semibold tracking-wider">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`hover:text-neutral-50 transition-colors duration-200 decoration-2 underline-offset-4 ${
                      isActive ? "text-neutral-50 underline" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-6 py-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <ul className="flex flex-col gap-4 text-base text-neutral-400 font-medium">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`block py-2 hover:text-neutral-50 transition-colors ${
                      isActive ? "text-neutral-50" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
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
