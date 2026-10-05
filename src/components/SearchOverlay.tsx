import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search as SearchIcon,
  X,
  FileText,
  ChevronRight,
  Command,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Fuse, { type FuseResult } from "fuse.js";
import { getDocSections, type DocItem } from "../lib/content";

interface SearchEntry {
  sectionTitle: string;
  sectionPath: string;
  doc: DocItem;
}

const SearchOverlay = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState("");
  const [rawSelectedIndex, setRawSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo(() => {
    const sections = getDocSections();
    const allDocs: SearchEntry[] = [];

    Object.entries(sections).forEach(([path, section]) => {
      section.items.forEach((doc) => {
        allDocs.push({
          sectionTitle: section.title,
          sectionPath: path,
          doc,
        });
      });
    });

    return new Fuse<SearchEntry>(allDocs, {
      keys: ["doc.meta.title", "sectionTitle", "doc.slug"],
      threshold: 0.3,
      includeMatches: true,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    return searchIndex.search(query).slice(0, 8);
  }, [query, searchIndex]);

  const selectedIndex =
    rawSelectedIndex < results.length ? rawSelectedIndex : 0;

  const handleClose = useCallback(() => {
    setQuery("");
    setRawSelectedIndex(0);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (result: FuseResult<SearchEntry>) => {
      const { sectionPath, doc } = result.item;
      navigate(`${sectionPath}/${doc.slug}`);
      handleClose();
    },
    [navigate, handleClose],
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setRawSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setRawSelectedIndex(
          (prev) => (prev - 1 + results.length) % (results.length || 1),
        );
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, handleClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-ink/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-paper-50 border border-paper-300 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-paper-300">
          <SearchIcon className="text-ink-muted shrink-0" size={19} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search guides, algorithms, system patterns..."
            className="flex-1 bg-transparent border-none outline-none text-ink placeholder:text-ink-muted font-medium text-sm font-sans"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRawSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-paper-200 text-[10px] text-ink-muted font-bold tracking-tighter sm:flex hidden font-sans">
            <Command size={10} />
            <span>K</span>
          </div>
          <button
            onClick={handleClose}
            className="text-ink-muted hover:text-ink transition-colors cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={resultsRef}
          className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1"
        >
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={`${result.item.sectionPath}-${result.item.doc.slug}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setRawSelectedIndex(index)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left cursor-pointer ${
                  index === selectedIndex
                    ? "bg-paper-200 border-paper-400 shadow-2xs"
                    : "bg-transparent border-transparent"
                } border`}
              >
                <div
                  className={`p-2 rounded-lg ${index === selectedIndex ? "bg-ink text-paper-50" : "bg-paper-200 text-accent"} transition-colors`}
                >
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-semibold truncate ${index === selectedIndex ? "text-ink" : "text-ink-secondary"} font-sans`}
                  >
                    {result.item.doc.meta.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-ink-muted font-medium mt-0.5 font-sans">
                    <span>{result.item.sectionTitle}</span>
                    <ChevronRight size={10} className="text-paper-400" />
                    <span className="truncate text-ink-muted font-mono">
                      {result.item.doc.slug}
                    </span>
                  </div>
                </div>
                {index === selectedIndex && (
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest hidden sm:block font-sans">
                    Open
                  </span>
                )}
              </button>
            ))
          ) : query ? (
            <div className="py-12 text-center">
              <p className="text-ink-muted text-sm font-serif">
                No guides found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <div className="py-6 px-3">
              <p className="text-ink-muted text-[11px] font-bold uppercase tracking-widest mb-3 font-sans">
                Quick Navigation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(getDocSections())
                  .slice(0, 4)
                  .map((section) => (
                    <button
                      key={section.basePath}
                      onClick={() => {
                        navigate(section.basePath);
                        handleClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-paper-100 hover:bg-paper-200 border border-paper-300 transition-all text-left group cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-ink-secondary group-hover:text-ink font-sans">
                        {section.title}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-ink-muted group-hover:text-ink"
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-paper-300 bg-paper-200 flex items-center justify-between text-[10px] text-ink-muted font-bold uppercase tracking-widest px-5 font-sans">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-paper-300 text-ink-secondary">
                ENT
              </span>{" "}
              SELECT
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-paper-300 text-ink-secondary">
                ↑↓
              </span>{" "}
              NAVIGATE
            </span>
          </div>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-paper-300 text-ink-secondary">
              ESC
            </span>{" "}
            CLOSE
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SearchOverlay;
