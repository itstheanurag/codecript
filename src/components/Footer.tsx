import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { GITHUB_ISSUES_URL, GITHUB_URL } from "../lib/site";

const Footer = () => {
  return (
    <footer className="border-t border-paper-300 bg-paper-200 py-10 relative overflow-hidden text-center mt-auto">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2.5 mb-3 text-ink">
          <div className="w-7 h-7 rounded-lg bg-ink text-paper-50 flex items-center justify-center shadow-xs">
            <BookOpen size={14} className="shrink-0" />
          </div>
          <span className="font-serif font-bold text-[18px] tracking-[-0.02em] text-ink">
            Code<span className="text-accent font-semibold">Cript</span>
          </span>
          <span className="text-xs font-mono text-ink-muted ml-1">
            • Compendium
          </span>
        </div>

        <p className="text-xs text-ink-secondary font-serif max-w-md mb-6 leading-relaxed">
          An open-source reading compendium built for focused, distraction-free
          study on software engineering and distributed systems.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between w-full text-xs text-ink-muted tracking-wider pt-6 border-t border-paper-300 gap-4 font-sans">
          <p>
            © {new Date().getFullYear()} CodeCript Open Source. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/fundamentals"
              className="hover:text-ink transition-colors"
            >
              Curriculum
            </Link>
            <span className="text-paper-400">•</span>
            <a
              href={GITHUB_ISSUES_URL}
              className="hover:text-ink transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Report an Issue
            </a>
            <span className="text-paper-400">•</span>
            <a
              href={GITHUB_URL}
              className="hover:text-ink transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
