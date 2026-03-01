import { Code2, Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 relative overflow-hidden text-center">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_20px,rgba(255,255,255,0.005)_20px,rgba(255,255,255,0.005)_21px)] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <a
          href="/"
          className="flex items-center gap-2 text-neutral-50 text-3xl tracking-tight lobster-two-bold mb-4"
        >
          <Code2 className="text-neutral-50" size={32} />
          CodeCript
        </a>

        <p className="text-neutral-400 max-w-lg mb-8 text-lg">
          An open-source platform empowering developers with world-class
          learning resources, completely free and community-driven.
        </p>

        <div className="flex items-center gap-6 mb-10">
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-50 font-medium transition-all duration-200"
          >
            <Github size={18} />
            <span>Contribute on GitHub</span>
          </a>
          <a
            href="#"
            className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800 transition-colors"
          >
            <Twitter size={20} />
          </a>
        </div>

        <div className="w-full h-px bg-neutral-900 mb-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between w-full text-sm text-neutral-500 tracking-widest gap-4">
          <p>© {new Date().getFullYear()} CodeCript Open Source.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Documentation
            </a>
            <span className="text-neutral-800">•</span>
            <a href="#" className="hover:text-neutral-300 transition-colors">
              Report an Issue
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
