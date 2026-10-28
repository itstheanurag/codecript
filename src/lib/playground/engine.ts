import type { Results } from "@electric-sql/pglite";
import { SAMPLE_SCHEMA_SQL } from "./schema";

export interface SqlResultSet {
  columns: string[];
  rows: Record<string, unknown>[];
  affectedRows: number;
  command: string;
}

export interface SqlRunSuccess {
  ok: true;
  results: SqlResultSet[];
  durationMs: number;
}

export interface SqlRunFailure {
  ok: false;
  message: string;
  detail?: string;
  hint?: string;
  position?: string;
  durationMs: number;
}

export type SqlRunResponse = SqlRunSuccess | SqlRunFailure;

export interface RunSqlOptions {
  /** Also load the Northwind schema used by the practice questions. */
  practice?: boolean;
}

type PgliteInstance = import("@electric-sql/pglite").PGlite;

let dbPromise: Promise<PgliteInstance> | null = null;
let practicePromise: Promise<void> | null = null;

/**
 * Lazily boots a full PostgreSQL instance compiled to WebAssembly.
 * The ~3 MB engine chunk (and the seed) only loads when a query is actually
 * executed, so readers who never open the playground pay nothing.
 */
export function getDatabase(): Promise<PgliteInstance> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { PGlite } = await import("@electric-sql/pglite");
      const db = await PGlite.create();
      await db.exec(SAMPLE_SCHEMA_SQL);
      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

export async function isDatabaseReady(): Promise<boolean> {
  return dbPromise !== null;
}

function toResultSet(result: Results): SqlResultSet {
  return {
    columns: result.fields.map((field) => field.name),
    rows: result.rows as Record<string, unknown>[],
    affectedRows: result.affectedRows ?? result.rowCount ?? 0,
    command: result.command ?? "QUERY",
  };
}

interface PgError {
  message?: string;
  detail?: string;
  hint?: string;
  position?: string | number;
  code?: string;
}

const VALUE_CONTEXT_KEYWORDS = new Set([
  "and",
  "between",
  "else",
  "ilike",
  "in",
  "is",
  "like",
  "not",
  "or",
  "then",
  "values",
  "when",
]);

/**
 * Reads the identifier at a PostgreSQL error position (1-based). Returns null
 * when the position does not point at a plain or double-quoted identifier.
 */
function identifierAt(sql: string, position: unknown) {
  const start = Number(position) - 1;
  if (!Number.isInteger(start) || start < 0 || start >= sql.length) {
    return null;
  }

  if (sql[start] === '"') {
    let index = start + 1;
    let name = "";
    while (index < sql.length) {
      if (sql[index] === '"') {
        if (sql[index + 1] === '"') {
          name += '"';
          index += 2;
          continue;
        }
        return {
          start,
          text: sql.slice(start, index + 1),
          name,
          quoted: true,
        };
      }
      name += sql[index];
      index += 1;
    }
    return null;
  }

  const word = /^[A-Za-z_][A-Za-z0-9_$]*/.exec(sql.slice(start));
  if (!word) return null;

  return {
    start,
    text: word[0],
    name: word[0],
    quoted: false,
  };
}

/** Whether an identifier sits where a value (not a column name) is expected. */
function isValuePosition(sql: string, offset: number): boolean {
  const before = sql.slice(0, offset).trimEnd();
  if (!before) return false;

  const previousChar = before[before.length - 1];
  if ("=<>!()".includes(previousChar)) return true;

  const previousWord = /([A-Za-z_]+)$/.exec(before)?.[1].toLowerCase();
  return previousWord !== undefined && VALUE_CONTEXT_KEYWORDS.has(previousWord);
}

/**
 * PostgreSQL reports `column "Germany" does not exist` when a learner writes
 * `WHERE country = "Germany"`. The error is technically correct — double
 * quotes mean "identifier" — but the fix is not obvious to beginners, so
 * translate it into an actionable hint.
 */
function stringLiteralHint(sql: string, error: PgError): string | undefined {
  if (error.code !== "42703") return undefined;

  const missing = /^column "((?:[^"]|"")*)" does not exist$/m
    .exec(error.message ?? "")?.[1]
    ?.replace(/""/g, '"');
  if (missing === undefined) return undefined;

  const token = identifierAt(sql, error.position);
  if (!token || !isValuePosition(sql, token.start)) return undefined;
  const sameName = token.quoted
    ? token.name === missing
    : token.name.toLowerCase() === missing.toLowerCase();
  if (!sameName) return undefined;

  if (token.quoted) {
    const identifier = `"${token.name.replace(/"/g, '""')}"`;
    const literal = `'${token.name.replace(/'/g, "''")}'`;
    return `PostgreSQL treated ${identifier} as a column name. Double quotes are for identifiers; use single quotes for text values: ${literal}.`;
  }

  return `PostgreSQL treated ${token.text} as a column name. Text values need single quotes: '${token.name}'.`;
}

function formatError(error: unknown, sql: string): SqlRunFailure {
  const err = (error ?? {}) as PgError;

  return {
    ok: false,
    message: err.message ?? "The query failed.",
    detail: err.detail,
    hint: err.hint ?? stringLiteralHint(sql, err),
    position: err.position === undefined ? undefined : String(err.position),
    durationMs: 0,
  };
}

/** Executes one or many statements and returns every result set. */
export async function runSql(
  sql: string,
  options: RunSqlOptions = {},
): Promise<SqlRunResponse> {
  const startedAt = performance.now();

  try {
    if (options.practice) await ensurePracticeSchema();
    const db = await getDatabase();

    let results: Awaited<ReturnType<typeof db.exec>>;
    if (options.practice) {
      // Practice queries run with Northwind as the default schema, so
      // `SELECT * FROM customers` works as well as `northwind.customers`.
      await db.exec("SET search_path = northwind, public");
      try {
        results = await db.exec(sql);
      } finally {
        // A learner may have opened a transaction manually; close it so the
        // session is never left in an aborted state.
        try {
          await db.exec("ROLLBACK");
        } catch {
          // Ignore: there was no open transaction.
        }
        try {
          await db.exec("SET search_path = public");
        } catch {
          // Ignore: the session may already be unusable.
        }
      }
    } else {
      results = await db.exec(sql);
    }

    return {
      ok: true,
      results: results.map(toResultSet),
      durationMs: performance.now() - startedAt,
    };
  } catch (error) {
    return {
      ...formatError(error, sql),
      durationMs: performance.now() - startedAt,
    };
  }
}

/**
 * Loads the Northwind sample database (practice questions) on demand. The SQL
 * dump is a separate chunk, so readers who never open practice never pay for it.
 */
export function ensurePracticeSchema(): Promise<void> {
  if (!practicePromise) {
    practicePromise = (async () => {
      const [{ default: northwindSql }, db] = await Promise.all([
        import("./northwind.sql?raw"),
        getDatabase(),
      ] as const);
      await db.exec(northwindSql);
    })().catch((error) => {
      practicePromise = null;
      throw error;
    });
  }
  return practicePromise;
}

/** Throws away the database and rebuilds it with fresh seed data. */
export async function resetDatabase(): Promise<void> {
  if (dbPromise) {
    const current = dbPromise;
    dbPromise = null;
    practicePromise = null;
    try {
      const db = await current;
      await db.close();
    } catch {
      // The instance never finished booting; nothing to close.
    }
  }
  await getDatabase();
}

/** The result set worth showing: the last statement that returned columns. */
export function pickDisplayResult(
  results: SqlResultSet[],
): SqlResultSet | null {
  for (let index = results.length - 1; index >= 0; index--) {
    if (results[index].columns.length > 0) return results[index];
  }
  return null;
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
