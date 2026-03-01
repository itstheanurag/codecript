import { ChevronRight, Terminal } from "lucide-react";

const BackgroundMesh = () => (
  <div className="absolute inset-0 z-0 overflow-hidden flex justify-center items-center opacity-30 pointer-events-none">
    <div className="w-full max-w-[1400px] h-[800px] grid grid-cols-6 grid-rows-5 gap-0 absolute top-[-50px]">
      <div className="col-span-2 row-span-2 border border-white/20"></div>
      <div className="col-span-1 row-span-1 border border-white/20 relative overflow-hidden bg-white/5">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.2) 10px, rgba(255,255,255,0.2) 12px)",
          }}
        ></div>
      </div>
      <div className="col-span-2 row-span-1 border border-white/20"></div>
      <div className="col-span-1 row-span-3 border border-white/20 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 9px)",
          }}
        ></div>
      </div>
      <div className="col-span-1 row-span-2 border border-white/20"></div>
      <div className="col-span-2 row-span-2 border border-white/20 relative overflow-hidden bg-white/5">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.2) 15px, rgba(255,255,255,0.2) 17px)",
          }}
        ></div>
      </div>
      <div className="col-span-1 row-span-1 border border-white/20"></div>
      <div className="col-span-1 row-span-1 border border-white/20 relative">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 12px)",
          }}
        ></div>
      </div>
      <div className="col-span-2 row-span-1 border border-white/20 bg-white/[0.02]"></div>
      <div className="col-span-2 row-span-2 border border-white/20"></div>
      <div className="col-span-1 row-span-1 border border-white/20 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 12px)",
          }}
        ></div>
      </div>
      <div className="col-span-1 row-span-2 border border-white/20 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.1) 12px, rgba(255,255,255,0.1) 14px)",
          }}
        ></div>
      </div>
      <div className="col-span-2 row-span-1 border border-white/20"></div>
    </div>
  </div>
);

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-24 pb-32">
      <BackgroundMesh />

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10 mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border-2 border-white text-zinc-100 text-sm font-bold mb-8 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <span className="flex h-2 w-2 bg-white animate-pulse"></span>
          System Design Courses Live
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-8 leading-tight lobster-two-bold">
          Master Software <br className="hidden md:block" />
          <span className="text-white relative inline-block px-4 border-2 border-white bg-zinc-950 mt-2 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <span className="relative z-10">Engineering.</span>
            <div className="absolute inset-0 z-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_6px)]"></div>
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed bg-zinc-950/90 p-6 border-2 border-white/20 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          The ultimate platform to learn languages, data structures, algorithms,
          and system design. Build real-world projects and ace your technical
          interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-full font-bold text-lg transition-transform hover:scale-105">
            Start Learning
            <ChevronRight size={20} />
          </button>
          <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-full font-bold text-lg transition-colors">
            <Terminal size={20} />
            <span>Explore Curriculum</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
