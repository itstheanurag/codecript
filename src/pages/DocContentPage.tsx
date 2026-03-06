import { useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getDocSections, getAdjacentDocItems } from "../lib/content";
import MarkdownRenderer from "../components/MarkdownRenderer";
import DocPagination from "../components/DocPagination";
import SEO from "../components/SEO";

const DocContentPage = () => {
  const params = useParams();
  const slug = params["*"];
  const location = useLocation();

  const sectionKey = "/" + location.pathname.split("/")[1];
  const sections = getDocSections();
  const section = sections[sectionKey];

  const item = useMemo(
    () => (slug ? (section?.items.find((i) => i.slug === slug) ?? null) : null),
    [section, slug],
  );

  const { prev, next } = useMemo(
    () =>
      slug ? getAdjacentDocItems(sectionKey, slug) : { prev: null, next: null },
    [sectionKey, slug],
  );

  if (!section) {
    return (
      <div className="px-4 sm:px-6 py-10 sm:py-14 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-300 mb-4">
          Section not found
        </h1>
        <Link
          to="/"
          className="text-neutral-400 hover:text-neutral-50 transition-colors"
        >
          Go home
        </Link>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 md:px-4 py-6 sm:py-8 md:py-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-300 mb-4">
          {section.title}
        </h1>
        <p className="text-neutral-400 text-base mb-8 leading-relaxed">
          {section.description}
        </p>
        <p className="text-neutral-500">
          ← Select a topic from the sidebar to get started.
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-4 sm:px-6 py-10 sm:py-14 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-300 mb-4">
          Topic not found
        </h1>
        <Link
          to={section.basePath}
          className="text-neutral-400 hover:text-neutral-50 transition-colors"
        >
          Back to {section.title}
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": item.meta.title,
    "description": `Learn ${item.meta.title} in the ${section.title} section. Master ${section.title.toLowerCase()} concepts with our detailed guides.`,
    "articleSection": section.title,
    "publisher": {
      "@type": "Organization",
      "name": "codecript",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/og-image.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 md:px-4 py-4 sm:py-6 md:py-8 lg:py-10">
      <SEO
        title={item.meta.title}
        description={`Learn ${item.meta.title} in the ${section.title} section. Master ${section.title.toLowerCase()} concepts with our detailed guides.`}
        ogType="article"
        jsonLd={jsonLd}
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-300 mb-6 sm:mb-8">
        {item.meta.title}
      </h1>
      <MarkdownRenderer content={item.content} />
      <DocPagination prev={prev} next={next} basePath={section.basePath} />
    </div>
  );
};

export default DocContentPage;
