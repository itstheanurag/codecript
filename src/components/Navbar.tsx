import React from "react";
import { Github } from "lucide-react";
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

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-white text-2xl tracking-tight lobster-two-bold"
          >
            CodeCript
          </Link>
          <ul className="hidden md:flex items-center gap-4 text-sm text-zinc-300 font-semibold tracking-wider">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`hover:text-white transition-colors duration-200 decoration-2 underline-offset-4 ${
                      isActive ? "text-white underline" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200">
          <Github size={18} />
          <span className="hidden sm:inline">Star on GitHub</span>
        </button>
      </div>
    </nav>
  );
});

export default Navbar;
