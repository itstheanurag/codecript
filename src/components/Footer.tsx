import { Link } from "react-router-dom";
import { GITHUB_ISSUES_URL, GITHUB_URL } from "../lib/site";

const Footer = () => {
  return (
    <footer className="sticky bottom-0 z-40 border-t border-neutral-900 bg-neutral-950 py-8 relative overflow-hidden text-center">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_20px,rgba(255,255,255,0.005)_20px,rgba(255,255,255,0.005)_21px)] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-between w-full text-sm text-neutral-500 tracking-widest gap-4">
          <p>© {new Date().getFullYear()} CodeCript Open Source.</p>
          <div className="flex gap-4">
            <Link to="/ds" className="hover:text-neutral-300 transition-colors">
              Documentation
            </Link>
            <span className="text-neutral-800">•</span>
            <a
              href={GITHUB_ISSUES_URL}
              className="hover:text-neutral-300 transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Report an Issue
            </a>
            <span className="text-neutral-800">•</span>
            <a
              href={GITHUB_URL}
              className="hover:text-neutral-300 transition-colors"
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
