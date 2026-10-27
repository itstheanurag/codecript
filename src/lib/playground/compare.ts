import type { SqlResultSet } from "./engine";

export interface ComparisonResult {
  correct: boolean;
  /** Rows match as a multiset, but the required ordering is wrong. */
  orderMismatch?: boolean;
  reason?: string;
  actualRows: number;
  expectedRows: number;
}

const NULL_TOKEN = "\u0000NULL";
const SEPARATOR = "\u0001";

const roundTo = (value: number, digits = 6) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) return NULL_TOKEN;

  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (!Number.isFinite(value)) return String(value);
    return String(roundTo(value));
  }

  if (typeof value === "boolean") return value ? "true" : "false";

  if (value instanceof Date) return value.toISOString();

  if (typeof value === "string") {
    // PostgreSQL returns numeric/bigint columns as strings; compare them as
    // numbers so 12.5 and "12.50" are treated as equal.
    if (/^-?\d+(\.\d+)?$/.test(value)) return String(roundTo(Number(value)));
    return value;
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

export function serializeRow(
  row: Record<string, unknown>,
  columns: string[],
): string {
  return columns.map((column) => normalizeValue(row[column])).join(SEPARATOR);
}

export function compareResults(
  actual: SqlResultSet,
  expected: SqlResultSet,
  ordered = false,
): ComparisonResult {
  const base: ComparisonResult = {
    correct: false,
    actualRows: actual.rows.length,
    expectedRows: expected.rows.length,
  };

  if (actual.columns.length !== expected.columns.length) {
    return {
      ...base,
      reason: `Expected ${expected.columns.length} column${
        expected.columns.length === 1 ? "" : "s"
      }, got ${actual.columns.length}.`,
    };
  }

  const actualRows = actual.rows.map((row) =>
    serializeRow(row, actual.columns),
  );
  const expectedRows = expected.rows.map((row) =>
    serializeRow(row, expected.columns),
  );

  if (ordered) {
    const same =
      actualRows.length === expectedRows.length &&
      actualRows.every((row, index) => row === expectedRows[index]);

    if (same) return { ...base, correct: true };

    const sameMultiset =
      [...actualRows].sort().join("\n") === [...expectedRows].sort().join("\n");

    return {
      ...base,
      orderMismatch: sameMultiset,
      reason: sameMultiset
        ? "The rows are right, but the order is different. Check your ORDER BY."
        : undefined,
    };
  }

  const actualSorted = [...actualRows].sort();
  const expectedSorted = [...expectedRows].sort();

  if (actualSorted.join("\n") === expectedSorted.join("\n")) {
    return { ...base, correct: true };
  }

  return base;
}
