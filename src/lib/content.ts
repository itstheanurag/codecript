import { parseFrontmatter } from "./frontmatter";

// --- Blog types and loader ---

export interface BlogMeta {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface BlogPost {
  slug: string;
  meta: BlogMeta;
  content: string;
}

const blogModules = import.meta.glob<string>("/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export function getAllBlogs(): BlogPost[] {
  return Object.entries(blogModules)
    .map(([path, raw]) => {
      const slug = path.split("/").pop()!.replace(".md", "");
      const { data, content } = parseFrontmatter<BlogMeta>(raw);
      return { slug, meta: data, content };
    })
    .sort((a, b) => (b.meta.date ?? "").localeCompare(a.meta.date ?? ""));
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return getAllBlogs().find((b) => b.slug === slug);
}

// --- Doc types and loader ---

export interface DocMeta {
  title: string;
  order: number;
}

export interface DocItem {
  slug: string;
  meta: DocMeta;
  content: string;
}

export interface DocGroup {
  title: string;
  items: DocItem[];
}

export interface DocSection {
  title: string;
  description: string;
  basePath: string;
  items: DocItem[];
  groups?: DocGroup[];
}

const docModules = import.meta.glob<string>(
  "/content/{languages,ds,algo,sys-design,building}/**/*.md",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

function loadDocSection(section: string): DocItem[] {
  return Object.entries(docModules)
    .filter(([path]) => path.startsWith(`/content/${section}/`))
    .map(([path, raw]) => {
      // Robust slug extraction: get everything after /content/[section]/
      const parts = path.split(`/content/${section}/`);
      const slug = parts[parts.length - 1].replace(".md", "");
      const { data, content } = parseFrontmatter<DocMeta>(raw);
      return { slug, meta: data, content };
    })
    .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
}

function loadGroupedDocSection(section: string): DocGroup[] {
  const items = loadDocSection(section);
  const groups: Record<string, DocItem[]> = {};

  items.forEach((item) => {
    const parts = item.slug.split("/");
    if (parts.length > 1) {
      const groupName = parts[0];
      // Capitalize first letter of groupName
      const groupTitle = groupName.charAt(0).toUpperCase() + groupName.slice(1);
      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(item);
    }
  });

  return Object.entries(groups).map(([title, items]) => ({
    title,
    items,
  }));
}

let cachedSections: Record<string, DocSection> | null = null;

export function getDocSections(): Record<string, DocSection> {
  if (cachedSections) return cachedSections;

  cachedSections = {
    "/languages": {
      title: "Languages",
      description: "Learn programming languages from the ground up.",
      basePath: "/languages",
      items: loadDocSection("languages"),
      groups: loadGroupedDocSection("languages"),
    },
    "/ds": {
      title: "Data Structures",
      description: "Core data structures every developer should know.",
      basePath: "/ds",
      items: loadDocSection("ds"),
    },
    "/algo": {
      title: "Algorithms",
      description: "Essential algorithms for problem solving and interviews.",
      basePath: "/algo",
      items: loadDocSection("algo"),
    },
    "/sys-design": {
      title: "System Design",
      description: "Concepts and patterns for designing scalable systems.",
      basePath: "/sys-design",
      items: loadDocSection("sys-design"),
    },
    "/building": {
      title: "Building Projects",
      description: "Step-by-step guides to building real-world applications.",
      basePath: "/building",
      items: loadDocSection("building"),
    },
  };

  return cachedSections;
}

export interface AdjacentDocItems {
  prev: DocItem | null;
  next: DocItem | null;
}

export function getAdjacentDocItems(
  sectionKey: string,
  currentSlug: string,
): AdjacentDocItems {
  const section = getDocSections()[sectionKey];
  if (!section) return { prev: null, next: null };

  // Determine the group prefix (e.g. "javascript/" from "javascript/introduction")
  const slugParts = currentSlug.split("/");
  const groupPrefix =
    slugParts.length > 1 ? slugParts.slice(0, -1).join("/") + "/" : "";

  // Filter to only items in the same subdirectory
  const scopedItems = groupPrefix
    ? section.items.filter((item) => item.slug.startsWith(groupPrefix))
    : section.items;

  const currentIndex = scopedItems.findIndex(
    (item) => item.slug === currentSlug,
  );

  if (currentIndex === -1) return { prev: null, next: null };

  return {
    prev: currentIndex > 0 ? scopedItems[currentIndex - 1] : null,
    next:
      currentIndex < scopedItems.length - 1
        ? scopedItems[currentIndex + 1]
        : null,
  };
}
