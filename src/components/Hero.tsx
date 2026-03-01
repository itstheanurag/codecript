import { ChevronRight, Terminal } from "lucide-react";

const stripe = (angle: number) => ({
  background: `repeating-linear-gradient(
    ${angle}deg,
    transparent,
    transparent 12px,
    rgba(255,255,255,0.08) 12px,
    rgba(255,255,255,0.08) 13px
  )`,
});

const BackgroundMesh = () => (
  <div className="absolute inset-0 z-0 overflow-hidden flex justify-center items-center opacity-40 pointer-events-none">
    <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_70%)]" />

    <div className="w-full max-w-[1400px] h-[800px] grid grid-cols-6 grid-rows-5 absolute top-[-50px]">
      <div className="col-span-2 row-span-2 border border-white/10" />

      <div className="col-span-1 row-span-1 border border-white/30 relative overflow-hidden bg-white/5">
        <div className="absolute inset-0" style={stripe(45)} />
      </div>

      <div className="col-span-2 row-span-1 border border-white/10" />

      <div className="col-span-1 row-span-3 border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0" style={stripe(-45)} />
      </div>

      <div className="col-span-1 row-span-2 border border-white/10" />

      <div className="col-span-2 row-span-2 border border-white/20 relative overflow-hidden bg-white/[0.03]">
        <div className="absolute inset-0" style={stripe(45)} />
      </div>

      <div className="col-span-1 row-span-1 border border-white/10" />

      <div className="col-span-1 row-span-1 border border-white/30 relative overflow-hidden">
        <div className="absolute inset-0" style={stripe(90)} />
      </div>

      <div className="col-span-2 row-span-1 border border-white/10 bg-white/[0.02]" />

      <div className="col-span-2 row-span-2 border border-white/10" />

      <div className="col-span-1 row-span-1 border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0" style={stripe(-45)} />
      </div>

      <div className="col-span-1 row-span-2 border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0" style={stripe(0)} />
      </div>

      <div className="col-span-2 row-span-1 border border-white/10" />
    </div>
  </div>
);

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-24 pb-32">
      <BackgroundMesh />

      <div className="relative max-w-7xl mx-auto px-6 text-center z-10 mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-white/10 text-zinc-100 text-sm font-bold mb-8 uppercase tracking-widest">
          <span className="flex h-2 w-2 bg-white animate-pulse"></span>
          System Design Courses Live
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-8 leading-tighter">
          Master Software <br className="hidden md:block" />
          <span className="text-white relative inline-block px-4 border border-white/10 bg-zinc-950 mt-2 lobster-two-bold">
            <span className="relative z-10">Engineering.</span>
            <div className="absolute inset-0 z-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_6px)]"></div>
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate platform to learn languages, data structures, algorithms,
          and system design. Build real-world projects and ace your technical
          interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="flex items-center gap-2 px-3  py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-md transition-transform hover:scale-101 font-sans">
            Start Learning
            <ChevronRight size={20} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-lg font-semibold text-sm italic transition-colors lobster-two-bold">
            <Terminal size={20} />
            <span>Explore Curriculum</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
