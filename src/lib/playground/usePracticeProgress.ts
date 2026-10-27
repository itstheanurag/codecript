import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "codecript:sql-practice:v2";
// v1 could contain the old (invalid) starter scaffolds as saved answers.
const LEGACY_STORAGE_KEY = "codecript:sql-practice:v1";

interface PracticeProgress {
  solved: string[];
  answers: Record<string, string>;
}

const EMPTY: PracticeProgress = { solved: [], answers: {} };

const isLegacyScaffold = (sql: string) =>
  sql.includes("Tables live in the northwind schema") ||
  /(^|\n)\s*SELECT\s*\n\s*FROM\s+northwind\.?\s*$/i.test(sql);

function parseProgress(raw: string): PracticeProgress {
  try {
    const parsed = JSON.parse(raw) as Partial<PracticeProgress>;
    const answers: Record<string, string> = {};
    if (parsed.answers && typeof parsed.answers === "object") {
      for (const [id, answer] of Object.entries(parsed.answers)) {
        if (
          typeof answer === "string" &&
          answer.trim().length > 0 &&
          !isLegacyScaffold(answer)
        ) {
          answers[id] = answer;
        }
      }
    }
    return {
      solved: Array.isArray(parsed.solved) ? parsed.solved : [],
      answers,
    };
  } catch {
    return EMPTY;
  }
}

function readProgress(): PracticeProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseProgress(raw);

    // Preserve solved progress from v1, but never restore its saved answers:
    // those may be the old invalid starter snippets.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return EMPTY;
    const { solved } = parseProgress(legacy);
    return { solved, answers: {} };
  } catch {
    return EMPTY;
  }
}

export function usePracticeProgress() {
  const [progress, setProgress] = useState<PracticeProgress>(readProgress);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Storage can be unavailable (private mode); progress becomes session-only.
    }
  }, [progress]);

  const markSolved = useCallback((id: string) => {
    setProgress((current) =>
      current.solved.includes(id)
        ? current
        : { ...current, solved: [...current.solved, id] },
    );
  }, []);

  const saveAnswer = useCallback((id: string, sql: string) => {
    setProgress((current) => ({
      ...current,
      answers: { ...current.answers, [id]: sql },
    }));
  }, []);

  const resetProgress = useCallback(() => setProgress(EMPTY), []);

  return {
    solved: new Set(progress.solved),
    answers: progress.answers,
    markSolved,
    saveAnswer,
    resetProgress,
  };
}
