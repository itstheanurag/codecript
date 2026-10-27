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

function formatError(error: unknown): SqlRunFailure {
  const err = (error ?? {}) as {
    message?: string;
    detail?: string;
    hint?: string;
    position?: string | number;
  };

  return {
    ok: false,
    message: err.message ?? "The query failed.",
    detail: err.detail,
    hint: err.hint,
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
      ...formatError(error),
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
