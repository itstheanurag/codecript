import { readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const SITE_URL = "https://codecript.pages.dev";
const ROOT_DIR = process.cwd();
const CONTENT_DIR = join(ROOT_DIR, "content");
const OUTPUT_PATH = join(ROOT_DIR, "public", "sitemap.xml");

const SECTION_BASE = {
  algo: "/algo",
  blog: "/blog",
  building: "/building",
  ds: "/ds",
  languages: "/languages",
  "sys-design": "/sys-design",
};

function getMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function toUrl(pathname) {
  return `${SITE_URL}${pathname}`;
}

const markdownFiles = getMarkdownFiles(CONTENT_DIR);
const routes = new Set([
  "/",
  "/blog",
  "/languages",
  "/ds",
  "/algo",
  "/sys-design",
  "/building",
]);

for (const file of markdownFiles) {
  const rel = relative(CONTENT_DIR, file).replaceAll("\\", "/");
  const [section, ...rest] = rel.split("/");
  const base = SECTION_BASE[section];
  if (!base) continue;

  const slug = rest.join("/").replace(/\.md$/, "");
  if (section === "blog") {
    routes.add(`/blog/${slug}`);
  } else {
    routes.add(`${base}/${slug}`);
  }
}

const lastmod = new Date().toISOString().split("T")[0];
const urlEntries = [...routes]
  .sort((a, b) => a.localeCompare(b))
  .map(
    (route) => `  <url>
    <loc>${toUrl(route)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(OUTPUT_PATH, xml, "utf8");
console.log(`Generated sitemap with ${routes.size} routes at ${OUTPUT_PATH}`);
