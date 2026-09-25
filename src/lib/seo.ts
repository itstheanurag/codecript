import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site";

export function canonicalPath(pathname: string): string {
  let path = pathname.split("?")[0].split("#")[0];
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (path.endsWith("/index")) {
    path = path.slice(0, -"/index".length);
  }
  return path || "/";
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = canonicalPath(path.startsWith("/") ? path : `/${path}`);
  return new URL(normalized, SITE_URL).toString();
}

export function docHref(basePath: string, slug: string): string {
  const cleaned = slug.replace(/\/index$/, "").replace(/^index$/, "");
  return cleaned ? `${basePath}/${cleaned}` : basePath;
}

export function pageTitle(title?: string): string {
  if (!title) return SITE_TITLE;
  if (title === SITE_TITLE || title === SITE_NAME) return SITE_TITLE;
  return `${title} | ${SITE_NAME}`;
}

export function excerptFromMarkdown(
  markdown: string,
  maxLength = 160,
): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~#>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return SITE_DESCRIPTION;
  if (text.length <= maxLength) return text;

  const sliced = text.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const cutoff = lastSpace > 80 ? lastSpace : maxLength - 1;
  return `${sliced.slice(0, cutoff)}…`;
}

export function docDescription(options: {
  frontmatterDescription?: string;
  content: string;
  title: string;
  sectionTitle: string;
}): string {
  if (options.frontmatterDescription?.trim()) {
    return options.frontmatterDescription.trim();
  }
  const excerpt = excerptFromMarkdown(options.content);
  if (excerpt && excerpt !== SITE_DESCRIPTION) return excerpt;
  return `Learn ${options.title} in ${options.sectionTitle} on ${SITE_NAME}.`;
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/og-image.png"),
      },
    },
  };
}

export function buildArticleJsonLd(options: {
  title: string;
  description: string;
  canonical: string;
  sectionTitle: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: options.title,
    description: options.description,
    articleSection: options.sectionTitle,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": options.canonical,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/og-image.png"),
      },
    },
    url: options.canonical,
  };
}

export function buildBreadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
