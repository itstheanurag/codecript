import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocItem } from "../lib/content";
import { docHref } from "../lib/seo";

interface DocPaginationProps {
  prev: DocItem | null;
  next: DocItem | null;
  basePath: string;
}

const DocPagination = ({ prev, next, basePath }: DocPaginationProps) => {
  return (
    <nav
      aria-label="Page navigation"
      className="mt-16 pt-8 border-t border-paper-300 flex items-stretch justify-between gap-4 font-sans"
    >
      {prev ? (
        <Link
          to={docHref(basePath, prev.slug)}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-paper-300 bg-paper-50 hover:border-paper-400 hover:shadow-xs transition-all duration-200 max-w-[48%]"
        >
          <ArrowLeft
            size={18}
            className="shrink-0 text-ink-muted group-hover:text-accent transition-colors group-hover:-translate-x-1 duration-200"
          />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Previous Chapter
            </span>
            <span className="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate w-full">
              {prev.meta.title}
            </span>
          </div>
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-5 py-4 rounded-xl border border-paper-300/50 bg-paper-200/40 max-w-[48%] cursor-not-allowed opacity-40 select-none">
          <ArrowLeft size={18} className="shrink-0 text-ink-muted" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-[11px] text-ink-muted uppercase tracking-wider font-medium">
              Previous Chapter
            </span>
          </div>
        </span>
      )}

      {next ? (
        <Link
          to={docHref(basePath, next.slug)}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-paper-300 bg-paper-50 hover:border-paper-400 hover:shadow-xs transition-all duration-200 max-w-[48%] ml-auto"
        >
          <div className="flex flex-col items-end min-w-0">
            <span className="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">
              Next Chapter
            </span>
            <span className="text-sm font-semibold text-ink group-hover:text-accent transition-colors truncate w-full text-right">
              {next.meta.title}
            </span>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-ink-muted group-hover:text-accent transition-colors group-hover:translate-x-1 duration-200"
          />
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-5 py-4 rounded-xl border border-paper-300/50 bg-paper-200/40 max-w-[48%] ml-auto cursor-not-allowed opacity-40 select-none">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-[11px] text-ink-muted uppercase tracking-wider font-medium">
              Next Chapter
            </span>
          </div>
          <ArrowRight size={18} className="shrink-0 text-ink-muted" />
        </span>
      )}
    </nav>
  );
};

export default DocPagination;
