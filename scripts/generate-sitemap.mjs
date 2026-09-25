import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getContentRoutes } from "./content-routes.mjs";
import { SITE_URL } from "./site.mjs";

const OUTPUT_PATH = join(process.cwd(), "public", "sitemap.xml");

const routes = getContentRoutes();
const homeLastmod = routes.reduce(
  (latest, route) => (route.lastmod > latest ? route.lastmod : latest),
  "1970-01-01",
);

const urls = [
  { loc: `${SITE_URL}/`, lastmod: homeLastmod },
  ...routes.map((route) => ({
    loc: `${SITE_URL}${route.path}`,
    lastmod: route.lastmod,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(OUTPUT_PATH, xml, "utf8");
console.log(`Generated sitemap with ${urls.length} routes at ${OUTPUT_PATH}`);
