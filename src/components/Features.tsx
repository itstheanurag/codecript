import { Code, Database, Cpu, Layout, BookOpen, Layers } from "lucide-react";

const features = [
  {
    title: "Programming Languages",
    description:
      "Master modern languages from Python and JavaScript to Rust and Go with interactive exercises.",
    icon: Code,
  },
  {
    title: "Data Structures",
    description:
      "Deep dive into arrays, trees, graphs, and hash tables. Understand the building blocks of efficient software.",
    icon: Database,
  },
  {
    title: "Algorithms",
    description:
      "Learn sorting, searching, dynamic programming, and greedy algorithms to solve complex problems.",
    icon: Cpu,
  },
  {
    title: "System Design",
    description:
      "Design scalable distributed systems. Learn about microservices, caching, load balancing, and databases.",
    icon: Layers,
  },
  {
    title: "Architecture Patterns",
    description:
      "Study MVC, MVVM, Clean Architecture, and domain-driven design principles for enterprise applications.",
    icon: Layout,
  },
  {
    title: "Comprehensive Blogs",
    description:
      "Read in-depth articles, tutorials, and interview experiences from top engineers in the industry.",
    icon: BookOpen,
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(255,255,255,0.02)_40px,rgba(255,255,255,0.02)_41px)] z-0"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 lobster-two-bold">
            Everything you need to excel
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            A comprehensive curriculum designed by industry experts to take you
            from a beginner to a senior engineer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-white/20 bg-zinc-950 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center mb-6 text-white group-hover:scale-110 transition-transform">
                  <Icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
