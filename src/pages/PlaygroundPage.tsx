import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Github } from "lucide-react";
import SEO from "../components/SEO";
import PracticeView from "../components/practice/PracticeView";
import { PRACTICE_QUESTIONS } from "../lib/playground/questions";

const PlaygroundPage = () => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper-100 text-ink">
      <SEO
        title="SQL Playground"
        description={`Practice ${PRACTICE_QUESTIONS.length} SQL exercises with instant feedback. A real PostgreSQL 17 database compiled to WebAssembly runs entirely in your browser — no server, no signup.`}
        canonical="/playground"
      />

      {/* Standalone app bar: the playground is a tool, not a content page. */}
      <header className="z-30 shrink-0 border-b border-paper-300 bg-paper-100/95 backdrop-blur-md">
        <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2 select-none">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-paper-50 transition-colors group-hover:bg-accent">
              <BookOpen size={14} />
            </div>
            <span className="font-serif text-[17px] font-bold tracking-[-0.02em] text-ink">
              Code<span className="font-semibold text-accent">Cript</span>
            </span>
          </Link>

          <span className="hidden h-5 w-px bg-paper-300 sm:block" />

          <div className="min-w-0">
            <p className="font-sans text-[13px] font-bold tracking-tight text-ink">
              SQL Playground
            </p>
            <p className="hidden font-mono text-[9.5px] uppercase tracking-wider text-ink-muted sm:block">
              {PRACTICE_QUESTIONS.length} questions · PostgreSQL 17
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/databases/sql"
              className="hidden items-center gap-1.5 rounded-md px-2 py-1.5 font-sans text-[11px] font-semibold text-ink-muted transition-colors hover:bg-paper-200 hover:text-ink sm:inline-flex"
            >
              <ArrowLeft size={12} />
              SQL course
            </Link>
            <a
              href="https://github.com/itstheanurag/codecript"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-paper-300 bg-paper-50 px-2 py-1.5 font-sans text-[11px] font-semibold text-ink-secondary transition-colors hover:bg-paper-200 hover:text-ink"
            >
              <Github size={12} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <PracticeView />
      </main>
    </div>
  );
};

export default PlaygroundPage;
