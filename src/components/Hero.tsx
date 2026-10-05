import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-paper-300 bg-paper-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Subtle Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper-300 bg-paper-200/70 text-ink-muted text-[11px] font-mono tracking-[0.22em] uppercase font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span>The Engineer&apos;s Reading Library</span>
        </div>

        {/* Primary Hero Statement */}
        <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-bold font-sans tracking-[-0.04em] text-ink leading-[1.08] max-w-3xl mx-auto mb-7">
          Master the Art <br className="hidden sm:inline" />
          <span className="font-serif font-normal italic text-ink-secondary">
            of
          </span>{" "}
          <span className="text-ink">Software.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg lg:text-[19px] text-ink-secondary font-serif leading-[1.7] max-w-2xl mx-auto mb-10">
          Deep, carefully structured guides on computer science, software
          engineering, systems, and the ideas behind the tools we build with.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-16 sm:mb-20">
          <Link
            to="/fundamentals"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-ink hover:bg-ink-secondary text-paper-50 text-sm font-medium transition-all shadow-sm hover:shadow font-sans group w-full sm:w-auto"
          >
            <BookOpen size={16} />
            <span>Start Reading</span>
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>

          <a
            href="#curriculum"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-paper-200 text-ink-secondary hover:text-ink border border-paper-300 text-sm font-medium transition-colors font-sans w-full sm:w-auto"
          >
            <Layers size={15} className="text-ink-muted" />
            <span>Browse Volumes</span>
          </a>
        </div>

        {/* Editorial Pillars Footnote */}
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 pt-10 border-t border-paper-300 text-left max-w-3xl mx-auto">
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold">
              01 / Foundations
            </div>
            <p className="text-xs sm:text-[13px] text-ink-secondary font-serif leading-relaxed">
              First-principles explanations of data structures, algorithms, and
              computing models.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold">
              02 / Architecture
            </div>
            <p className="text-xs sm:text-[13px] text-ink-secondary font-serif leading-relaxed">
              Production distributed systems, concurrency paradigms, and storage
              internals.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-ink-muted font-semibold">
              03 / Craft
            </div>
            <p className="text-xs sm:text-[13px] text-ink-secondary font-serif leading-relaxed">
              Calm, distraction-free reading designed for sustained engineering
              focus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
