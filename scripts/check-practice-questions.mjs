/**
 * Verifies that every practice question's reference answer still runs against
 * the seeded Northwind dataset, and that the row counts shown in the schema
 * panel match the data. Wire into `prebuild` so a dataset change cannot ship
 * with stale answers.
 *
 * Usage: node scripts/check-practice-questions.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import {
  NORTHWIND_SCHEMA_REFERENCE,
  PRACTICE_QUESTIONS,
} from "../src/lib/playground/questions.ts";
import { SAMPLE_SCHEMA_SQL } from "../src/lib/playground/schema.ts";

const ROOT = process.cwd();
const northwindSql = readFileSync(
  join(ROOT, "src/lib/playground/northwind.sql"),
  "utf8",
);

const db = await PGlite.create();
await db.exec(SAMPLE_SCHEMA_SQL);
await db.exec(northwindSql);

const failures = [];

// 1. Schema reference row counts must match the seeded data.
for (const table of NORTHWIND_SCHEMA_REFERENCE) {
  const result = await db.query(
    `SELECT COUNT(*)::int AS n FROM northwind.${table.table}`,
  );
  const actual = result.rows[0].n;
  if (actual !== table.rows) {
    failures.push(
      `schema count for northwind.${table.table}: expected ${table.rows}, found ${actual}`,
    );
  }
}

// 2. Every reference answer must execute, return rows and be deterministic.
const seen = new Set();
for (const question of PRACTICE_QUESTIONS) {
  if (seen.has(question.id)) {
    failures.push(`duplicate question id: ${question.id}`);
    continue;
  }
  seen.add(question.id);

  try {
    const first = await db.query(question.solution);
    const second = await db.query(question.solution);
    if (first.rows.length === 0) {
      failures.push(`${question.id}: reference answer returned no rows`);
    } else if (JSON.stringify(first.rows) !== JSON.stringify(second.rows)) {
      failures.push(`${question.id}: reference answer is not deterministic`);
    } else if (question.ordered && !/\border\s+by\b/i.test(question.solution)) {
      failures.push(`${question.id}: marked ordered but has no ORDER BY`);
    }
  } catch (error) {
    failures.push(`${question.id}: ${String(error.message).split("\n")[0]}`);
    try {
      await db.exec("ROLLBACK");
    } catch {
      // Ignore: no transaction was open.
    }
  }
}

await db.close();

if (failures.length > 0) {
  console.error(`[fail] ${failures.length} practice question problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `[ok] ${PRACTICE_QUESTIONS.length} practice answers and ${NORTHWIND_SCHEMA_REFERENCE.length} schema counts verified`,
);
