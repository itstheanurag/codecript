import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import CodeBlock from "../CodeBlock";
import SqlEditor from "../SqlEditor";
import SqlResultTable from "../SqlResultTable";
import {
  pickDisplayResult,
  resetDatabase,
  runSql,
  type SqlResultSet,
} from "../../lib/playground/engine";
import { compareResults } from "../../lib/playground/compare";
import {
  NORTHWIND_SCHEMA_REFERENCE,
  PRACTICE_QUESTIONS,
  QUESTION_BY_ID,
  TOPIC_ORDER,
  expectedOrderBy,
  tablesForQuestion,
  type QuestionDifficulty,
} from "../../lib/playground/questions";
import { usePracticeProgress } from "../../lib/playground/usePracticeProgress";

type OutcomeStatus =
  | "idle"
  | "running"
  | "run"
  | "correct"
  | "wrong"
  | "order"
  | "error";

interface Outcome {
  status: OutcomeStatus;
  message?: string;
  actual?: SqlResultSet | null;
  expected?: SqlResultSet | null;
  durationMs?: number;
}

const DIFFICULTY_STYLES: Record<QuestionDifficulty, string> = {
  easy: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  hard: "text-red-700 bg-red-50 border-red-200",
};

const CUSTOMERS_ROWS =
  NORTHWIND_SCHEMA_REFERENCE.find((table) => table.table === "customers")
    ?.rows ?? 0;
const ORDERS_ROWS =
  NORTHWIND_SCHEMA_REFERENCE.find((table) => table.table === "orders")?.rows ??
  0;

const SchemaList = ({ tables }: { tables?: string[] }) => {
  const visible = tables
    ? NORTHWIND_SCHEMA_REFERENCE.filter((table) =>
        tables.includes(table.table),
      )
    : NORTHWIND_SCHEMA_REFERENCE;

  return (
    <div className="space-y-2.5">
      {visible.map((table) => (
        <div
          key={table.table}
          className="overflow-hidden rounded-md border border-paper-300 bg-paper-50"
        >
          <div className="flex items-baseline justify-between gap-2 border-b border-paper-300 bg-paper-200/70 px-2 py-1">
            <code className="font-mono text-[10.5px] font-semibold text-ink">
              northwind.{table.table}
            </code>
            <span className="shrink-0 font-mono text-[9px] text-ink-muted">
              {table.rows} rows
            </span>
          </div>
          <div className="py-0.5">
            {table.columns.map((column) => (
              <div
                key={column.name}
                className="flex items-baseline justify-between gap-2 px-2 py-0.5"
              >
                <span className="min-w-0 break-words font-mono text-[10px] leading-snug text-ink-secondary">
                  {column.name}
                  {column.key && (
                    <span className="ml-1 rounded-sm border border-paper-300 bg-paper-200 px-1 text-[8px] font-semibold uppercase tracking-wide text-ink-muted">
                      {column.key}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-[9px] text-ink-muted">
                  {column.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const PracticeView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { solved, answers, markSolved, saveAnswer, resetProgress } =
    usePracticeProgress();

  const [currentId, setCurrentId] = useState(() => {
    const fromUrl = searchParams.get("question");
    if (fromUrl && QUESTION_BY_ID.has(fromUrl)) return fromUrl;
    return (
      PRACTICE_QUESTIONS.find((question) => !solved.has(question.id))?.id ??
      PRACTICE_QUESTIONS[0].id
    );
  });

  const question = QUESTION_BY_ID.get(currentId) ?? PRACTICE_QUESTIONS[0];

  const [query, setQuery] = useState(
    () => answers[question.id] ?? "",
  );
  const [outcome, setOutcome] = useState<Outcome>({ status: "idle" });
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showExpected, setShowExpected] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showAllSchema, setShowAllSchema] = useState(false);
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);

  const solvedCount = PRACTICE_QUESTIONS.filter((item) =>
    solved.has(item.id),
  ).length;

  const grouped = useMemo(
    () =>
      TOPIC_ORDER.map((topic) => ({
        topic,
        questions: PRACTICE_QUESTIONS.filter((item) => item.topic === topic),
      })).filter((group) => group.questions.length > 0),
    [],
  );

  const questionNumber =
    PRACTICE_QUESTIONS.findIndex((item) => item.id === question.id) + 1;

  const syncUrl = (id: string) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("question", id);
        return next;
      },
      { replace: true },
    );
  };

  const selectQuestion = (id: string) => {
    if (id === currentId) return;
    saveAnswer(currentId, query);
    const next = QUESTION_BY_ID.get(id);
    if (!next) return;
    setCurrentId(id);
    setQuery(answers[id] ?? "");
    setOutcome({ status: "idle" });
    setShowHint(false);
    setShowSolution(false);
    setShowExpected(false);
    setShowAllSchema(false);
    syncUrl(id);
  };

  const nextQuestion = () => {
    const index = PRACTICE_QUESTIONS.findIndex(
      (item) => item.id === question.id,
    );
    const next = PRACTICE_QUESTIONS[index + 1];
    if (next) selectQuestion(next.id);
  };

  const execute = async (check: boolean) => {
    if (!query.trim() || running) return;
    setRunning(true);
    setOutcome({ status: "running" });
    setShowExpected(false);
    saveAnswer(currentId, query);

    const startedAt = performance.now();
    const response = await runSql(query, { practice: true });

    if (!response.ok) {
      setOutcome({ status: "error", message: response.message });
      setRunning(false);
      return;
    }

    const actual = pickDisplayResult(response.results);
    if (!actual) {
      setOutcome({
        status: "error",
        message:
          "Your statement ran, but returned no result set. Practice answers must return rows (a SELECT).",
      });
      setRunning(false);
      return;
    }

    const durationMs = performance.now() - startedAt;

    if (!check) {
      setOutcome({ status: "run", actual, durationMs });
      setRunning(false);
      return;
    }

    const solutionResponse = await runSql(question.solution, {
      practice: true,
    });
    const expected = solutionResponse.ok
      ? pickDisplayResult(solutionResponse.results)
      : null;

    if (!expected) {
      setOutcome({
        status: "error",
        message: "The reference answer could not be evaluated.",
      });
      setRunning(false);
      return;
    }

    const comparison = compareResults(actual, expected, question.ordered);

    if (comparison.correct) {
      markSolved(currentId);
      setOutcome({ status: "correct", actual, expected, durationMs });
    } else if (comparison.orderMismatch) {
      setOutcome({
        status: "order",
        message: comparison.reason,
        actual,
        expected,
        durationMs,
      });
    } else {
      setOutcome({
        status: "wrong",
        message: comparison.reason,
        actual,
        expected,
        durationMs,
      });
    }
    setRunning(false);
  };

  const handleResetQuery = () => {
    setQuery("");
    setOutcome({ status: "idle" });
    setShowSolution(false);
    setShowExpected(false);
  };

  const handleResetData = async () => {
    setResetting(true);
    setOutcome({ status: "idle" });
    try {
      await resetDatabase();
    } finally {
      setResetting(false);
    }
  };

  const busy = running || resetting;
  const isCorrect = outcome.status === "correct";
  const schemaTables = showAllSchema
    ? undefined
    : tablesForQuestion(question);
  const expectedOrder = question.ordered
    ? expectedOrderBy(question.solution)
    : null;

  return (
    <div className="flex min-h-full w-full flex-col px-4 py-6 sm:px-6 lg:h-full lg:min-h-0 lg:px-8 lg:py-4">
      <div className="grid flex-1 gap-6 lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_280px]">
        {/* Question navigator */}
        <aside className="hidden lg:block lg:min-h-0">
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-paper-300 bg-paper-100 p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Practice sheet
              </h2>
              <span className="font-mono text-[10px] text-ink-muted">
                {solvedCount}/{PRACTICE_QUESTIONS.length}
              </span>
            </div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-paper-300">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{
                  width: `${(solvedCount / PRACTICE_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {grouped.map((group) => (
                <div key={group.topic}>
                  <p className="mb-1 px-1 font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    {group.topic}
                  </p>
                  <ul className="space-y-0.5">
                    {group.questions.map((item) => {
                      const isActive = item.id === question.id;
                      const isSolved = solved.has(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => selectQuestion(item.id)}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-sans text-[12px] transition-colors ${
                              isActive
                                ? "bg-paper-200 font-semibold text-ink"
                                : "text-ink-secondary hover:bg-paper-200/60 hover:text-ink"
                            }`}
                          >
                            <span
                              className="w-3 shrink-0 text-emerald-600"
                              aria-hidden
                            >
                              {isSolved ? <Check size={12} /> : null}
                            </span>
                            <span className="truncate">{item.title}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-paper-300 pt-2">
              <button
                type="button"
                onClick={resetProgress}
                className="cursor-pointer font-sans text-[10px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Reset progress
              </button>
              <button
                type="button"
                onClick={() => void handleResetData()}
                disabled={busy}
                className="cursor-pointer font-sans text-[10px] text-ink-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
              >
                {resetting ? "Resetting…" : "Reset data"}
              </button>
            </div>
          </div>
        </aside>

        {/* Active question */}
        <section className="flex min-w-0 flex-col lg:min-h-0">
          <div className="mb-4 flex flex-wrap items-center gap-2 lg:hidden">
            <select
              value={currentId}
              onChange={(event) => selectQuestion(event.target.value)}
              className="w-full cursor-pointer rounded-md border border-paper-300 bg-paper-50 px-2 py-2 font-sans text-xs text-ink"
              aria-label="Choose a question"
            >
              {grouped.map((group) => (
                <optgroup key={group.topic} label={group.topic}>
                  {group.questions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {solved.has(item.id) ? "[solved] " : ""}
                      {item.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="font-mono text-[10px] text-ink-muted">
              {solvedCount}/{PRACTICE_QUESTIONS.length} solved
            </span>
          </div>

          <div className="rounded-lg border border-paper-300 bg-paper-50 p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-paper-300 bg-paper-200 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                {question.topic}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${
                  DIFFICULTY_STYLES[question.difficulty]
                }`}
              >
                {question.difficulty}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${
                  question.ordered
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-paper-300 bg-paper-200 text-ink-muted"
                }`}
              >
                {question.ordered ? "Order matters" : "Any order"}
              </span>
              <span className="ml-auto font-mono text-[10px] text-ink-muted">
                Question {questionNumber} / {PRACTICE_QUESTIONS.length}
              </span>
            </div>

            <h2 className="font-sans text-lg font-bold tracking-tight text-ink sm:text-xl">
              {question.title}
              {solved.has(question.id) && (
                <CheckCircle2
                  size={16}
                  className="ml-2 inline-block text-emerald-600"
                  aria-label="Solved"
                />
              )}
            </h2>
            <p className="mt-1.5 max-w-3xl font-serif text-[15px] leading-relaxed text-ink-secondary">
              {question.prompt}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowHint((value) => !value)}
                className="inline-flex cursor-pointer items-center gap-1.5 font-sans text-[11px] font-semibold text-accent hover:underline"
              >
                <Lightbulb size={13} />
                {showHint ? "Hide hint" : "Show hint"}
              </button>
              <button
                type="button"
                onClick={() => setShowSchema((value) => !value)}
                className="inline-flex cursor-pointer items-center gap-1.5 font-sans text-[11px] font-semibold text-ink-muted hover:text-ink xl:hidden"
              >
                <ChevronDown
                  size={13}
                  className={showSchema ? "rotate-180" : ""}
                />
                Schema
              </button>
              <span className="font-mono text-[10px] text-ink-muted">
                dataset: northwind ({CUSTOMERS_ROWS} customers, {ORDERS_ROWS} orders)
              </span>
            </div>

            {showHint && (
              <p className="mt-2 rounded-md border-l-2 border-emerald-600 bg-emerald-50/40 px-3 py-2 font-serif text-[13px] leading-relaxed text-ink-secondary">
                {question.hint}
              </p>
            )}

            {showSchema && (
              <div className="mt-3 rounded-md border border-paper-300 bg-paper-100 p-3 xl:hidden">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Schema
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllSchema((value) => !value)}
                    className="cursor-pointer font-sans text-[10px] font-semibold text-accent hover:underline"
                  >
                    {showAllSchema ? "Only this question" : "All tables"}
                  </button>
                </div>
                <SchemaList tables={schemaTables} />
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="mt-4 overflow-hidden rounded-lg border border-paper-300 bg-paper-50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-300 bg-paper-200/70 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void execute(true)}
                  disabled={busy}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-sans text-xs font-semibold text-paper-50 transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-70"
                >
                  {running ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Check size={13} />
                  )}
                  {running ? "Checking…" : "Check answer"}
                </button>
                <button
                  type="button"
                  onClick={() => void execute(false)}
                  disabled={busy}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-paper-300 bg-paper-50 px-2.5 py-1.5 font-sans text-[11px] font-semibold text-ink-secondary transition-colors hover:bg-paper-200 hover:text-ink disabled:cursor-wait disabled:opacity-70"
                >
                  <Play size={12} />
                  Run
                </button>
                <button
                  type="button"
                  onClick={handleResetQuery}
                  disabled={busy}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 font-sans text-[11px] font-semibold text-ink-muted transition-colors hover:bg-paper-200 hover:text-ink disabled:opacity-60"
                >
                  <RotateCcw size={12} />
                  Clear
                </button>
              </div>
              <span className="font-sans text-[10px] text-ink-muted">
                Ctrl/⌘ + Enter to check
              </span>
            </div>

            <SqlEditor
              value={query}
              onChange={setQuery}
              onRun={() => void execute(true)}
              height="clamp(150px, 24vh, 220px)"
              placeholder="Write your SQL here — unqualified table names resolve to the northwind schema. Press Ctrl/⌘ + Enter to check."
            />
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 lg:overflow-y-auto lg:pr-1">
          {outcome.status === "idle" && !running && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-paper-300 bg-paper-100 px-6 py-10 text-center">
              <p className="max-w-md font-serif text-sm leading-relaxed text-ink-muted">
                Write your query above, then press{" "}
                <strong className="font-sans text-[12px] font-semibold text-ink-secondary">
                  Check answer
                </strong>
                . The result is compared with the reference answer row by row.
              </p>
            </div>
          )}

          {/* Outcome */}
          {(outcome.status !== "idle" || running) && (
            <div className="space-y-3">
              {outcome.status === "running" && (
                <div className="flex items-center gap-2 rounded-lg border border-paper-300 bg-paper-100 px-4 py-3 font-sans text-sm text-ink-muted">
                  <Loader2 size={15} className="animate-spin text-accent" />
                  Booting PostgreSQL and loading the Northwind dataset…
                </div>
              )}

              {outcome.status === "correct" && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50/60 px-4 py-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div>
                    <p className="font-sans text-sm font-semibold text-emerald-800">
                      Correct — {outcome.actual?.rows.length} row
                      {outcome.actual?.rows.length === 1 ? "" : "s"} matched the
                      expected result.
                    </p>
                    <p className="font-mono text-[10px] text-emerald-700/80">
                      {outcome.durationMs?.toFixed(1)} ms
                    </p>
                  </div>
                </div>
              )}

              {outcome.status === "order" && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50/60 px-4 py-3">
                  <TriangleAlert
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm text-amber-800">
                      {outcome.message ??
                        "The rows are right, but the order is different."}
                    </p>
                    {expectedOrder && (
                      <p className="mt-1 break-words font-mono text-[11px] text-amber-800/90">
                        Expected: ORDER BY {expectedOrder}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {outcome.status === "wrong" && (
                <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50/50 px-4 py-3">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-red-800">
                      {outcome.message?.startsWith("Expected")
                        ? `Not quite — ${outcome.message}`
                        : `Not quite — expected ${
                            outcome.expected?.rows.length ?? 0
                          } row${
                            outcome.expected?.rows.length === 1 ? "" : "s"
                          }, got ${outcome.actual?.rows.length ?? 0}.`}
                    </p>
                    {outcome.message &&
                      !outcome.message.startsWith("Expected") && (
                        <p className="mt-0.5 font-sans text-[12px] text-red-700/90">
                          {outcome.message}
                        </p>
                      )}
                  </div>
                </div>
              )}

              {outcome.status === "error" && (
                <div className="rounded-lg border border-red-300 border-l-2 border-l-red-600 bg-red-50/50 px-4 py-3">
                  <p className="mb-1 font-sans text-[10px] font-bold uppercase tracking-wider text-red-700">
                    Query failed
                  </p>
                  <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-red-800">
                    {outcome.message}
                  </p>
                </div>
              )}

              {outcome.status === "run" && (
                <p className="font-sans text-xs text-ink-muted">
                  Query executed — press “Check answer” to compare it with the
                  expected result.
                </p>
              )}

              {outcome.actual && outcome.status !== "error" && (
                <div>
                  <p className="mb-1.5 font-sans text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                    Your result
                  </p>
                  <SqlResultTable result={outcome.actual} maxRows={60} />
                </div>
              )}

              {outcome.expected &&
                (outcome.status === "wrong" || outcome.status === "order") && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowExpected((value) => !value)}
                      className="inline-flex cursor-pointer items-center gap-1.5 font-sans text-[11px] font-semibold text-accent hover:underline"
                    >
                      <Eye size={12} />
                      {showExpected
                        ? "Hide expected result"
                        : "Show expected result"}
                    </button>
                    {showExpected && (
                      <div className="mt-2">
                        <SqlResultTable
                          result={outcome.expected}
                          maxRows={60}
                        />
                      </div>
                    )}
                  </div>
                )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSolution((value) => !value)}
                  className="cursor-pointer font-sans text-[11px] font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  {showSolution
                    ? "Hide reference answer"
                    : "Show reference answer"}
                </button>
                {isCorrect && questionNumber < PRACTICE_QUESTIONS.length && (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 font-sans text-[11px] font-semibold text-paper-50 hover:bg-ink"
                  >
                    Next question
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>

              {showSolution && (
                <div className="[&>div]:my-0">
                  <CodeBlock code={question.solution} language="sql" />
                </div>
              )}
            </div>
          )}
          </div>

          <p className="mt-3 shrink-0 border-t border-paper-300 pt-2 font-sans text-[10.5px] leading-relaxed text-ink-muted">
            Practice questions are adapted from the MIT-licensed{" "}
            <a
              href="https://github.com/eirkostop/SQL-Northwind-exercises"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink"
            >
              SQL-Northwind-exercises
            </a>{" "}
            sheet; reference answers are written for PostgreSQL. Dataset:{" "}
            <a
              href="https://github.com/pthom/northwind_psql"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink"
            >
              Northwind for Postgres
            </a>{" "}
            (Ms-PL, originally Microsoft). Progress is stored in this browser
            only.
          </p>
        </section>

        {/* Persistent schema reference on wide screens */}
        <aside className="hidden xl:block xl:min-h-0">
          <div className="flex h-full min-h-0 flex-col rounded-lg border border-paper-300 bg-paper-100 p-3">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-sans text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                Schema
              </h2>
              <button
                type="button"
                onClick={() => setShowAllSchema((value) => !value)}
                className="cursor-pointer font-sans text-[10px] font-semibold text-accent hover:underline"
              >
                {showAllSchema ? "Only this question" : "All tables"}
              </button>
            </div>
            <p className="mb-2 font-serif text-[12px] leading-relaxed text-ink-muted">
              {showAllSchema
                ? "All tables in the practice dataset."
                : "Only the tables this question needs."}
            </p>
            <p className="mb-2 border-b border-paper-300 pb-2 font-serif text-[11.5px] leading-relaxed text-ink-muted">
              Unqualified names resolve to{" "}
              <code className="font-mono text-[11px]">northwind</code>.
            </p>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <SchemaList tables={schemaTables} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PracticeView;
