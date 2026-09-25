import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { marked } from "marked";
import { getContentRoutes } from "./content-routes.mjs";
import {
  SECTION_META,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./site.mjs";

const DIST_DIR = join(process.cwd(), "dist");
const INDEX_PATH = join(DIST_DIR, "index.html");

marked.setOptions({ gfm: true });

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteUrl(path) {
  return `${SITE_URL}${path === "/" ? "/" : path}`;
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function applyHead(html, { title, description, canonical, ogType, jsonLd }) {
  const escTitle = escapeHtml(title);
  const escDescription = escapeAttr(description);
  const escCanonical = escapeAttr(canonical);

  let next = replaceTag(
    html,
    /<title>[^<]*<\/title>/i,
    `<title>${escTitle}</title>`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escDescription}" />`,
  );
  next = replaceTag(
    next,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escCanonical}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:type"[^>]*>/i,
    `<meta property="og:type" content="${ogType}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${escTitle}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${escDescription}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${escCanonical}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:title"[^>]*>/i,
    `<meta name="twitter:title" content="${escTitle}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${escDescription}" />`,
  );

  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,
    "",
  );
  next = next.replace(
    "</head>",
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
  );

  return next;
}

function injectRoot(html, inner) {
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${inner}</div>`,
  );
}

function breadcrumbHtml(crumbs) {
  const parts = crumbs
    .map((crumb, index) => {
      const last = index === crumbs.length - 1;
      const name = escapeHtml(crumb.name);
      if (last) return `<span>${name}</span>`;
      return `<a href="${crumb.path}">${name}</a>`;
    })
    .join(" / ");
  return `<nav aria-label="Breadcrumb">${parts}</nav>`;
}

function pageTitle(title) {
  return `${title} | ${SITE_NAME}`;
}

function writeRouteHtml(routePath, html) {
  const outputPath =
    routePath === "/"
      ? INDEX_PATH
      : join(DIST_DIR, routePath.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, "utf8");
}

const template = readFileSync(INDEX_PATH, "utf8");
const routes = getContentRoutes();

const homeCrumbs = [{ name: "Home", path: "/" }];
const homeLinks = Object.entries(SECTION_META)
  .map(
    ([dir, meta]) =>
      `<li><a href="/${dir}">${escapeHtml(meta.title)}</a> — ${escapeHtml(meta.description)}</li>`,
  )
  .join("");

const homeHtml = applyHead(template, {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  canonical: absoluteUrl("/"),
  ogType: "website",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  },
});

writeRouteHtml(
  "/",
  injectRoot(
    homeHtml,
    `<main>
      <h1>Master Software Engineering</h1>
      <p>${escapeHtml(SITE_DESCRIPTION)}</p>
      <nav aria-label="Curriculum">
        <ul>${homeLinks}</ul>
      </nav>
    </main>`,
  ),
);

for (const route of routes) {
  const canonical = absoluteUrl(route.path);
  const title = pageTitle(route.title);
  const crumbs = [
    ...homeCrumbs,
    { name: route.sectionTitle, path: `/${route.section}` },
  ];
  if (route.path !== `/${route.section}`) {
    crumbs.push({ name: route.title, path: route.path });
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: route.title,
      description: route.description,
      articleSection: route.sectionTitle,
      url: canonical,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/og-image.png"),
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
  ];

  const body = route.content
    ? marked.parse(route.content, { async: false })
    : `<p>${escapeHtml(route.description)}</p>`;

  const pageHtml = applyHead(template, {
    title,
    description: route.description,
    canonical,
    ogType: "article",
    jsonLd,
  });

  writeRouteHtml(
    route.path,
    injectRoot(
      pageHtml,
      `<article>
        ${breadcrumbHtml(crumbs)}
        <h1>${escapeHtml(route.title)}</h1>
        ${body}
      </article>`,
    ),
  );
}

console.log(`Prerendered ${routes.length + 1} HTML routes in ${DIST_DIR}`);
