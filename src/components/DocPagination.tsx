import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DocItem } from "../lib/content";

interface DocPaginationProps {
  prev: DocItem | null;
  next: DocItem | null;
  basePath: string;
}

const DocPagination = ({ prev, next, basePath }: DocPaginationProps) => {
  return (
    <nav
      aria-label="Page navigation"
      className="mt-16 pt-8 border-t border-neutral-800 flex items-stretch justify-between gap-4"
    >
      {prev ? (
        <Link
          to={`${basePath}/${prev.slug}`}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-200 max-w-[45%]"
        >
          <ArrowLeft
            size={18}
            className="shrink-0 text-neutral-500 group-hover:text-neutral-300 transition-colors group-hover:-translate-x-0.5 duration-200"
          />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-neutral-500 font-medium">
              Previous
            </span>
            <span className="text-sm font-semibold text-neutral-300 group-hover:text-neutral-100 transition-colors truncate w-full">
              {prev.meta.title}
            </span>
          </div>
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 max-w-[45%] cursor-not-allowed opacity-40 select-none">
          <ArrowLeft size={18} className="shrink-0 text-neutral-600" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-neutral-600 font-medium">
              Previous
            </span>
          </div>
        </span>
      )}

      {next ? (
        <Link
          to={`${basePath}/${next.slug}`}
          className="group flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all duration-200 max-w-[45%] ml-auto"
        >
          <div className="flex flex-col items-end min-w-0">
            <span className="text-xs text-neutral-500 font-medium">Next</span>
            <span className="text-sm font-semibold text-neutral-300 group-hover:text-neutral-100 transition-colors truncate w-full text-right">
              {next.meta.title}
            </span>
          </div>
          <ArrowRight
            size={18}
            className="shrink-0 text-neutral-500 group-hover:text-neutral-300 transition-colors group-hover:translate-x-0.5 duration-200"
          />
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-5 py-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 max-w-[45%] ml-auto cursor-not-allowed opacity-40 select-none">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-xs text-neutral-600 font-medium">Next</span>
          </div>
          <ArrowRight size={18} className="shrink-0 text-neutral-600" />
        </span>
      )}
    </nav>
  );
};

export default DocPagination;
