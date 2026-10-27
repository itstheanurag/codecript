import { Play, Loader2, RotateCcw } from "lucide-react";
import CodeBlock from "./CodeBlock";
import SqlResultTable from "./SqlResultTable";
import { pickDisplayResult } from "../lib/playground/engine";
import { useSqlRunner } from "../lib/playground/useSqlRunner";

interface RunnableSqlProps {
  code: string;
  language?: string;
}

/**
 * A SQL code block with an inline "Run" button. The PostgreSQL WASM engine is
 * only downloaded the first time the reader clicks Run, so articles stay
 * lightweight.
 */
const RunnableSql = ({ code, language = "sql" }: RunnableSqlProps) => {
  const { run, running, response, clear } = useSqlRunner();
  const displayResult = response?.ok ? pickDisplayResult(response.results) : null;

  return (
    <div className="my-6 rounded-lg border border-paper-300/80 bg-paper-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-300/80 bg-paper-200/60 px-3 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
          {language} · runnable
        </span>
        <div className="flex items-center gap-1.5">
          {response || running ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold font-sans text-ink-muted transition-colors hover:bg-paper-300/60 hover:text-ink"
              aria-label="Clear result"
            >
              <RotateCcw size={12} />
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void run(code)}
            disabled={running}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded bg-ink px-2.5 py-1 text-[11px] font-semibold font-sans text-paper-50 transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-70"
          >
            {running ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {running ? "Running" : "Run"}
          </button>
        </div>
      </div>

      <div className="[&>div]:my-0 [&>div]:rounded-none [&>div]:border-0">
        <CodeBlock code={code} language={language} />
      </div>

      {(running || response) && (
        <div className="border-t border-paper-300/80 p-3">
          {running && (
            <p className="font-sans text-xs text-ink-muted">
              Booting PostgreSQL (WASM) on first run — this takes a second…
            </p>
          )}

          {response?.ok && (
            <div className="space-y-2">
              {displayResult ? (
                <SqlResultTable result={displayResult} maxRows={50} compact />
              ) : (
                <p className="font-sans text-xs text-ink-muted">
                  {response.results.length} statement
                  {response.results.length === 1 ? "" : "s"} executed
                  successfully.
                </p>
              )}
              <p className="font-mono text-[10px] text-ink-muted">
                {response.durationMs.toFixed(1)} ms
              </p>
            </div>
          )}

          {response && !response.ok && (
            <div className="rounded-md border-l-2 border-red-600 bg-red-50/50 px-3 py-2">
              <p className="font-mono text-[12px] text-red-700">
                {response.message}
              </p>
              {response.hint && (
                <p className="mt-1 font-sans text-[11px] text-ink-secondary">
                  Hint: {response.hint}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RunnableSql;
