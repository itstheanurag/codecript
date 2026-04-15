import { useState, useEffect, useRef, useMemo } from "react";
import { Search as SearchIcon, X, FileText, ChevronRight, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { getDocSections } from "../lib/content";

const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo(() => {
    const sections = getDocSections();
    const allDocs: any[] = [];

    Object.entries(sections).forEach(([path, section]) => {
      section.items.forEach((doc) => {
        allDocs.push({
          sectionTitle: section.title,
          sectionPath: path,
          doc,
        });
      });
    });

    return new Fuse(allDocs, {
      keys: ["doc.meta.title", "sectionTitle", "doc.slug"],
      threshold: 0.3,
      includeMatches: true,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    return searchIndex.search(query).slice(0, 8);
  }, [query, searchIndex]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (result: any) => {
    const { sectionPath, doc } = result.item;
    navigate(`${sectionPath}/${doc.slug}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-neutral-950/40 backdrop-blur-md flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-800">
          <SearchIcon className="text-neutral-500 shrink-0" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes, algorithms, patterns..."
            className="flex-1 bg-transparent border-none outline-none text-neutral-100 placeholder:text-neutral-600 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 text-[10px] text-neutral-500 font-bold tracking-tighter sm:flex hidden">
            <Command size={10} />
            <span>K</span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={`${result.item.sectionPath}-${result.item.doc.slug}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left ${
                  index === selectedIndex ? "bg-white/5 border-neutral-700" : "bg-transparent border-transparent"
                } border`}
              >
                <div className={`p-2 rounded-lg ${index === selectedIndex ? "bg-white text-neutral-950" : "bg-neutral-800 text-neutral-400"} transition-colors`}>
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${index === selectedIndex ? "text-neutral-50" : "text-neutral-300"}`}>
                    {result.item.doc.meta.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium mt-0.5">
                    <span>{result.item.sectionTitle}</span>
                    <ChevronRight size={10} />
                    <span className="truncate">{result.item.doc.slug}</span>
                  </div>
                </div>
                {index === selectedIndex && (
                  <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest hidden sm:block">Open</span>
                )}
              </button>
            ))
          ) : query ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500 text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-8 px-4">
              <p className="text-neutral-600 text-[11px] font-bold uppercase tracking-widest mb-4">Quick Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(getDocSections()).slice(0, 4).map(section => (
                  <button 
                    key={section.basePath}
                    onClick={() => { navigate(section.basePath); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 transition-all text-left group"
                  >
                    <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-50">{section.title}</span>
                    <ChevronRight size={14} className="text-neutral-600 group-hover:text-neutral-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="p-1 rounded bg-neutral-800">ENT</span> SELECT</span>
            <span className="flex items-center gap-1"><span className="p-1 rounded bg-neutral-800">↑↓</span> NAVIGATE</span>
          </div>
          <span className="flex items-center gap-1"><span className="p-1 rounded bg-neutral-800">ESC</span> CLOSE</span>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
