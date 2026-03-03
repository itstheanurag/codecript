import { useEffect, useState, useRef } from "react";
import { slugify } from "../lib/slugify";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  /** Raw markdown string to extract headings from */
  content: string;
  /** The scrollable container to observe — must be provided so IntersectionObserver works */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

const parseHeadings = (markdown: string): TocHeading[] => {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocHeading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].trim();
    headings.push({
      id: slugify(text),
      text,
      level: match[1].length,
    });
  }

  return headings;
};

const TableOfContents = ({
  content,
  scrollContainerRef,
}: TableOfContentsProps) => {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const scrollRoot = scrollContainerRef.current;
    if (!scrollRoot || headings.length === 0) return;

    // Small delay to let headings render with IDs
    const timeout = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Find the first entry that is intersecting from the top
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            );

          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        {
          root: scrollRoot,
          rootMargin: "0px 0px -70% 0px",
          threshold: 0.1,
        },
      );

      headings.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observerRef.current?.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observerRef.current?.disconnect();
    };
  }, [content, headings, scrollContainerRef]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    const scrollRoot = scrollContainerRef.current;
    if (el && scrollRoot) {
      const top =
        el.getBoundingClientRect().top -
        scrollRoot.getBoundingClientRect().top +
        scrollRoot.scrollTop -
        20;
      scrollRoot.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="py-6 px-4">
      <div className="sticky top-6">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
          On this page
        </p>
        <ul className="space-y-1 border-l border-neutral-800">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={`block w-full text-left text-sm py-1 transition-colors duration-150 border-l-2 -ml-px ${
                  heading.level === 3 ? "pl-6" : "pl-4"
                } ${
                  activeId === heading.id
                    ? "border-neutral-50 text-neutral-50"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents;
