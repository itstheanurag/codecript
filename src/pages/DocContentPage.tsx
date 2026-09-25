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

  // If there's no slug AND no index file, show placeholder
  if (!slug && !item) {
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
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 md:px-4 py-4 sm:py-6 md:py-8 lg:py-10">
      <SEO
        title={item.meta.title}
        description={description}
        canonical={canonical}
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
