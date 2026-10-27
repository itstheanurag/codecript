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
  STATIC_PAGES,
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
    `<title data-rh="true">${escTitle}</title>`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="description"[^>]*>/i,
    `<meta data-rh="true" name="description" content="${escDescription}" />`,
  );
  next = replaceTag(
    next,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link data-rh="true" rel="canonical" href="${escCanonical}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:type"[^>]*>/i,
    `<meta data-rh="true" property="og:type" content="${ogType}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:title"[^>]*>/i,
    `<meta data-rh="true" property="og:title" content="${escTitle}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:description"[^>]*>/i,
    `<meta data-rh="true" property="og:description" content="${escDescription}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta data-rh="true" property="og:url" content="${escCanonical}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:title"[^>]*>/i,
    `<meta data-rh="true" name="twitter:title" content="${escTitle}" />`,
  );
  next = replaceTag(
    next,
    /<meta\s+name="twitter:description"[^>]*>/i,
    `<meta data-rh="true" name="twitter:description" content="${escDescription}" />`,
  );

  next = next.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g,
    "",
  );
  next = next.replace(
    "</head>",
    `    <script data-rh="true" type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
  );

  return next;
}

function injectRoot(html, inner) {
  // Keep the static content in the HTML for crawlers and no-JS clients, but
  // mark it so the inline CSS in index.html can hide it as soon as JS is
  // available. React replaces the whole container on mount, so this markup
  // must never be visible to JS-enabled visitors (it would flash the raw,
  // unstyled SEO text until the SPA bundle finishes loading).
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root"><div data-prerender>${inner}</div></div>`,
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
const homeLinks = [
  ...Object.entries(SECTION_META).map(
    ([dir, meta]) =>
      `<li><a href="/${dir}">${escapeHtml(meta.title)}</a> — ${escapeHtml(meta.description)}</li>`,
  ),
  `<li><a href="/playground">SQL Playground</a> — practice SQL in your browser with instant feedback.</li>`,
].join("");

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

for (const page of STATIC_PAGES) {
  const canonical = absoluteUrl(page.path);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "SQL Playground",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      url: canonical,
      description: page.description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "In-browser PostgreSQL 17 (WebAssembly)",
        "64 graded SQL practice questions",
        "Instant result comparison",
        "No signup or server",
      ],
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "SQL Playground",
          item: canonical,
        },
      ],
    },
  ];

  const pageHtml = applyHead(template, {
    title: pageTitle(page.title),
    description: page.description,
    canonical,
    ogType: "website",
    jsonLd,
  });

  writeRouteHtml(
    page.path,
    injectRoot(
      pageHtml,
      `<main>
        <h1>SQL Playground</h1>
        <p>${escapeHtml(page.description)}</p>
        <h2>What you can practise</h2>
        <ul>
          <li>64 exercises on the Northwind dataset, grouped by topic.</li>
          <li>Filtering, joins, aggregation, subqueries, window functions, CTEs, set operations, and date/string functions.</li>
          <li>Instant row-level comparison with the reference answer.</li>
          <li>A real PostgreSQL 17 database compiled to WebAssembly, running entirely in the browser.</li>
        </ul>
        <p><a href="/databases/sql">Read the SQL deep dive</a> or <a href="/playground">open the practice sheet</a>.</p>
      </main>`,
    ),
  );
}

console.log(
  `Prerendered ${routes.length + 1 + STATIC_PAGES.length} HTML routes in ${DIST_DIR}`,
);
