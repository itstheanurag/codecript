import { useMemo } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import {
  getDocSections,
  getAdjacentDocItems,
  resolveDocItem,
} from "../lib/content";
import MarkdownRenderer from "../components/MarkdownRenderer";
import DocPagination from "../components/DocPagination";
import SEO from "../components/SEO";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  canonicalPath,
  docDescription,
  docHref,
} from "../lib/seo";

const DocContentPage = () => {
  const params = useParams();
  const location = useLocation();
  const canonicalPathname = canonicalPath(location.pathname);
  const slug = params["*"] || "index";
  const sectionKey = "/" + location.pathname.split("/")[1];
  const sections = getDocSections();
  const section = sections[sectionKey];

  const item = useMemo(() => {
    return section ? resolveDocItem(section, slug) : null;
  }, [section, slug]);

  const { prev, next } = useMemo(
    () => getAdjacentDocItems(sectionKey, item?.slug ?? slug),
    [sectionKey, item, slug],
  );

  if (canonicalPathname !== location.pathname) {
    return <Navigate to={canonicalPathname} replace />;
  }

  if (!section) {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-sans text-ink mb-4">
          Section not found
        </h1>
        <Link
          to="/"
          className="text-xs font-semibold text-accent hover:underline transition-colors font-sans"
        >
          ← Return to Compendium Home
        </Link>
      </div>
    );
  }

  // If there's no slug AND no index file, show placeholder
  if (!slug && !item) {
    return (
      <div className="w-full max-w-[740px] py-4">
        <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2 font-sans">
          Curriculum Overview
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-ink mb-4 tracking-tight">
          {section.title}
        </h1>
        <p className="text-ink-secondary font-serif text-[17px] leading-[1.78] mb-8">
          {section.description}
        </p>
        <div className="py-3 px-4 rounded-md border-l-2 border-paper-400 bg-paper-200 text-ink-muted text-sm font-sans">
          ← Select a topic from the sidebar table of contents to start reading.
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h1 className="text-xl sm:text-2xl font-bold font-sans text-ink mb-4">
          Topic not found
        </h1>
        <Link
          to={section.basePath}
          className="text-xs font-semibold text-accent hover:underline transition-colors font-sans"
        >
          ← Back to {section.title}
        </Link>
      </div>
    );
  }

  const description = docDescription({
    frontmatterDescription: item.meta.description,
    content: item.content,
    title: item.meta.title,
    sectionTitle: section.title,
  });
  const canonical = docHref(section.basePath, item.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: section.title, path: section.basePath },
  ];
  if (canonical !== section.basePath) {
    crumbs.push({ name: item.meta.title, path: canonical });
  }

  const jsonLd = [
    buildArticleJsonLd({
      title: item.meta.title,
      description,
      canonical: absoluteUrl(canonical),
      sectionTitle: section.title,
    }),
    buildBreadcrumbJsonLd(crumbs),
  ];

  return (
    <article className="w-full max-w-[740px] py-2">
      <SEO
        title={item.meta.title}
        description={description}
        canonical={canonical}
        ogType="article"
        jsonLd={jsonLd}
      />
      <header className="mb-7">
        <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2 font-sans">
          {section.title}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans text-ink tracking-tight leading-tight">
          {item.meta.title}
        </h1>
      </header>
      <MarkdownRenderer content={item.content} />
      <DocPagination prev={prev} next={next} basePath={section.basePath} />
    </article>
  );
};

export default DocContentPage;
