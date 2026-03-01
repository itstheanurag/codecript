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

export interface DocSection {
  title: string;
  description: string;
  basePath: string;
  items: DocItem[];
}

const docModules = import.meta.glob<string>(
  "/content/{languages,ds,algo,sys-design,building}/*.md",
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
      const slug = path.split("/").pop()!.replace(".md", "");
      const { data, content } = parseFrontmatter<DocMeta>(raw);
      return { slug, meta: data, content };
    })
    .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
}

export function getDocSections(): Record<string, DocSection> {
  return {
    "/languages": {
      title: "Languages",
      description: "Learn programming languages from the ground up.",
      basePath: "/languages",
      items: loadDocSection("languages"),
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
}
