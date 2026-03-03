/**
 * Converts a heading string into a URL-friendly slug.
 * Used by both MarkdownRenderer (to set heading IDs) and
 * TableOfContents (to generate matching anchor links).
 */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
