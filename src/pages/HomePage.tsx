import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Code2,
  Cpu,
  Globe2,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Hero from "../components/Hero";
import SEO from "../components/SEO";
import { getDocSections } from "../lib/content";
import { buildWebsiteJsonLd } from "../lib/seo";
import { SITE_DESCRIPTION } from "../lib/site";

interface VolumeDefinition {
  volume: string;
  title: string;
  subtitle: string;
  icon: typeof BookMarked;
  paths: string[];
}

const VOLUMES: VolumeDefinition[] = [
  {
    volume: "Volume I",
    title: "Computer Science & Core Foundations",
    subtitle:
      "Mental models, asymptotic complexity, memory hierarchies, concurrency, and persistence engines.",
    icon: Cpu,
    paths: ["/fundamentals", "/ds", "/algo", "/concurrency", "/databases"],
  },
  {
    volume: "Volume II",
    title: "System Architecture & Scalability",
    subtitle:
      "Distributed systems, architectural patterns, clean low-level design, and high-throughput APIs.",
    icon: Globe2,
    paths: ["/sys-design", "/lld", "/api-design", "/building"],
  },
  {
    volume: "Volume III",
    title: "Programming Languages & Runtimes",
    subtitle:
      "Execution engines, type systems, memory management, garbage collectors, and idiomatic concurrency.",
    icon: Code2,
    paths: ["/languages"],
  },
  {
    volume: "Volume IV",
    title: "Production Engineering & Craft",
    subtitle:
      "Testing rigor, CI/CD pipelines, Linux internals, observability, and behavioral tradecraft.",
    icon: ShieldCheck,
    paths: ["/devops", "/testing", "/behavioral"],
  },
];

const READING_TRACKS = [
  {
    title: "The Distributed Systems Architect",
    tag: "Staff Track",
    description:
      "From CAP theorem and consensus protocols to caching strategies, replication, and production failure modes.",
    link: "/sys-design",
    topics: ["System Design", "Databases", "Concurrency", "API Design"],
  },
  {
    title: "The Problem Solver & Algorithmist",
    tag: "Core Foundations",
    description:
      "Master graph traversals, dynamic programming, tree balancing, amortized analysis, and time-space tradeoffs.",
    link: "/algo",
    topics: ["Data Structures", "Algorithms", "Fundamentals"],
  },
  {
    title: "The Polyglot & Runtime Specialist",
    tag: "Language Internals",
    description:
      "Understand how compilers, GC algorithms, event loops, and goroutine schedulers operate behind the syntax.",
    link: "/languages",
    topics: ["Go", "Rust", "Python", "TypeScript", "C++"],
  },
];

const HomePage = () => {
  const sections = getDocSections();

  return (
    <>
      <SEO description={SITE_DESCRIPTION} jsonLd={buildWebsiteJsonLd()} />

      {/* Editorial Hero */}
      <Hero />

      {/* Featured Reading Tracks */}
      <section className="px-6 py-14 max-w-5xl mx-auto border-b border-paper-300">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-1.5 font-sans">
              <Sparkles size={14} />
              <span>Curated Study Pathways</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-sans text-ink tracking-tight">
              Recommended Reading Tracks
            </h2>
          </div>
          <p className="text-sm text-ink-muted max-w-md font-sans">
            Sequential pathways engineered to guide your focus from fundamental
            concepts to production-grade mastery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {READING_TRACKS.map((track) => (
            <Link
              key={track.title}
              to={track.link}
              className="p-6 rounded-2xl bg-paper-50 border border-paper-300 hover:border-paper-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-paper-200 text-accent text-[11px] font-bold tracking-wide uppercase font-sans">
                    {track.tag}
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-ink-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                  />
                </div>
                <h3 className="text-base font-bold font-sans text-ink mb-2 group-hover:text-accent transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4 font-sans">
                  {track.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-paper-300">
                {track.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded bg-paper-200 text-ink-secondary font-medium font-sans"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Volumes Catalog */}
      <section id="curriculum" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-accent font-bold text-xs uppercase tracking-widest mb-2 font-sans">
            <BookMarked size={14} />
            <span>The Complete Collection</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans text-ink mb-3 tracking-tight">
            Browse the Compendium
          </h2>
          <p className="text-ink-muted font-sans text-sm sm:text-base">
            Thirteen carefully structured volumes designed for long-term
            reference and deep understanding.
          </p>
        </div>

        <div className="space-y-8">
          {VOLUMES.map((vol) => {
            const Icon = vol.icon;
            const volumeSections = vol.paths
              .map((path) => sections[path])
              .filter(Boolean);

            return (
              <div
                key={vol.volume}
                className="p-6 md:p-7 rounded-3xl bg-paper-200 border border-paper-300 shadow-2xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-5 border-b border-paper-300 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-paper-50 text-accent border border-paper-300 flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent font-sans">
                          {vol.volume}
                        </span>
                        <span className="text-paper-400">•</span>
                        <span className="text-xs text-ink-muted font-sans">
                          {volumeSections.length}{" "}
                          {volumeSections.length === 1 ? "Section" : "Sections"}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold font-sans text-ink">
                        {vol.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted max-w-md font-sans">
                    {vol.subtitle}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {volumeSections.map((section) => (
                    <Link
                      key={section.basePath}
                      to={section.basePath}
                      className="group p-4 rounded-xl bg-paper-50 border border-paper-300 hover:border-paper-400 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-sm text-ink group-hover:text-accent transition-colors font-sans">
                            {section.title}
                          </h4>
                          <ArrowRight
                            size={14}
                            className="text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                        <p className="text-xs text-ink-secondary leading-relaxed font-sans line-clamp-2">
                          {section.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-paper-200 flex items-center justify-between text-[11px] text-ink-muted">
                        <span className="font-mono text-ink-muted">
                          {section.basePath}
                        </span>
                        <span className="font-medium text-accent group-hover:underline font-sans">
                          Read Guide →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reading Philosophy Manifesto */}
      <section className="px-6 py-12 max-w-4xl mx-auto my-4">
        <div className="p-8 md:p-10 rounded-3xl bg-paper-200 border border-paper-300 text-center relative overflow-hidden shadow-xs">
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-ink text-paper-50 flex items-center justify-center mx-auto mb-4">
              <Star size={18} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold font-sans text-ink mb-3">
              The Paper Reading Philosophy
            </h3>
            <blockquote className="font-sans text-sm md:text-base text-ink-secondary max-w-2xl mx-auto mb-5 leading-relaxed">
              &ldquo;True mastery of complex software engineering comes from
              calm, uninterrupted reading. We replaced glare and noise with warm
              paper tones so you can study code, algorithms, and systems
              architecture with deep, enduring focus.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-wider text-accent font-sans">
              <span>100% Free</span>
              <span>•</span>
              <span>Open Source</span>
              <span>•</span>
              <span>Community Driven</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
