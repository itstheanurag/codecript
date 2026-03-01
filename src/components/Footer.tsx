import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_20px,rgba(255,255,255,0.01)_20px,rgba(255,255,255,0.01)_21px)] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <a
              href="/"
              className="flex items-center gap-2 text-white text-2xl tracking-tight lobster-two-bold mb-4"
            >
              CodeCript
            </a>
            <p className="text-zinc-400 max-w-sm mb-6">
              Empowering the next generation of software engineers with
              world-class learning resources and community.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm border-b-2 border-white/10 pb-2 inline-block">
              Resources
            </h3>
            <ul className="space-y-3 mt-2">
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white hover:underline transition-all"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white hover:underline transition-all"
                >
                  Interactive Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white hover:underline transition-all"
                >
                  Interview Prep
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white hover:underline transition-all"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500 font-bold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} CodeCript.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Made with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
