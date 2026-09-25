import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import SEO from "../components/SEO";
import { getDocSections } from "../lib/content";
import { buildWebsiteJsonLd } from "../lib/seo";
import { SITE_DESCRIPTION } from "../lib/site";

const HomePage = () => {
  const sections = Object.values(getDocSections());

  return (
    <>
      <SEO description={SITE_DESCRIPTION} jsonLd={buildWebsiteJsonLd()} />
      <Hero />
      <section className="relative z-10 border-t border-neutral-800 px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-3">
            Browse the curriculum
          </h2>
          <p className="text-neutral-400 mb-8 max-w-2xl">
            Structured paths covering languages, computer science, system
            design, and the engineering practices used in interviews.
          </p>
          <nav aria-label="Curriculum">
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section) => (
                <li key={section.basePath}>
                  <Link
                    to={section.basePath}
                    className="block h-full rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-600 hover:bg-neutral-900/70 transition-colors"
                  >
                    <span className="block text-neutral-100 font-semibold mb-1">
                      {section.title}
                    </span>
                    <span className="block text-sm text-neutral-400 leading-relaxed">
                      {section.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
};

export default HomePage;
