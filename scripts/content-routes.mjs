import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  SECTION_DIRS,
  SECTION_META,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "./site.mjs";

const ROOT_DIR = process.cwd();
const CONTENT_DIR = join(ROOT_DIR, "content");

export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data = {};
  for (const line of match[1].split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (/^\d+$/.test(value)) {
      value = Number.parseInt(value, 10);
    } else {
      value = value.replace(/^["']|["']$/g, "");
    }
    data[key] = value;
  }

  return { data, content: match[2] };
}

export function excerptFromMarkdown(markdown, maxLength = 160) {
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

function toRoute(basePath, slug) {
  const cleaned = slug.replace(/\/index$/, "").replace(/^index$/, "");
  return cleaned ? `${basePath}/${cleaned}` : basePath;
}

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

export function getContentRoutes() {
  const routes = [];
  const seen = new Set();

  for (const section of SECTION_DIRS) {
    const basePath = `/${section}`;
    const sectionDir = join(CONTENT_DIR, section);
    const sectionMeta = SECTION_META[section];

    if (!seen.has(basePath)) {
      seen.add(basePath);
      routes.push({
        path: basePath,
        section,
        sectionTitle: sectionMeta.title,
        title: sectionMeta.title,
        description: sectionMeta.description,
        content: "",
        lastmod: new Date().toISOString().split("T")[0],
        isSectionHub: true,
      });
    }

    let files = [];
    try {
      files = getMarkdownFiles(sectionDir);
    } catch {
      continue;
    }

    for (const file of files) {
      const rel = relative(sectionDir, file).replaceAll("\\", "/");
      const slug = rel.replace(/\.md$/, "");
      const path = toRoute(basePath, slug);
      const raw = readFileSync(file, "utf8");
      const { data, content } = parseFrontmatter(raw);
      const lastmod = statSync(file).mtime.toISOString().split("T")[0];
      const title = data.title || sectionMeta.title;
      const description =
        (typeof data.description === "string" && data.description.trim()) ||
        excerptFromMarkdown(content) ||
        `Learn ${title} in ${sectionMeta.title} on ${SITE_NAME}.`;

      const existing = routes.find((route) => route.path === path);
      if (existing) {
        existing.title = title;
        existing.description = description;
        existing.content = content;
        existing.lastmod = lastmod;
        existing.slug = slug;
        existing.isSectionHub = path === basePath;
        continue;
      }

      seen.add(path);
      routes.push({
        path,
        section,
        sectionTitle: sectionMeta.title,
        title,
        description,
        content,
        lastmod,
        slug,
        isSectionHub: path === basePath,
      });
    }
  }

  return routes.sort((a, b) => a.path.localeCompare(b.path));
}
