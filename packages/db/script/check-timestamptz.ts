/**
 * Fails when the Drizzle schema has a `timestamp` column without a time zone.
 * Every column in this repo is `timestamptz`, including the ones
 * `pnpm auth:generate` writes to src/auth-schema.ts as bare `timestamp(...)`.
 *
 * It checks the SQL from `drizzle-kit export`, which is what `pnpm db:push`
 * would apply, so it needs no database. lefthook runs it on every commit;
 * run it by hand with `pnpm -F @acme/db check:timestamptz`.
 */
import { spawnSync } from "node:child_process";

const TIMESTAMP_COLUMN = /^\s*"(?<column>[^"]+)" timestamp\b/u;
// `timestamp`, `timestamp(3)` or `timestamp[]` not followed by "with time zone"
const BARE_TIMESTAMP_COLUMN =
  /^\s*"[^"]+" timestamp(?:\(\d+\))?(?! with time zone)(?:[\s,[]|$)/u;

function exportStatements(): string[] | undefined {
  const exported = spawnSync(
    "drizzle-kit",
    [
      "export",
      "--dialect",
      "postgresql",
      "--schema",
      "./src/schema.ts",
      "--output",
      "json",
    ],
    // drizzle-kit prints schema load errors on stderr; let them through
    { encoding: "utf-8", stdio: ["ignore", "pipe", "inherit"] }
  );
  if (exported.status !== 0) {
    return undefined;
  }
  const result = JSON.parse(exported.stdout) as {
    status?: string;
    statements?: string[];
  };
  return result.status === "ok" ? result.statements : undefined;
}

function check(): boolean {
  const statements = exportStatements();
  if (!statements) {
    console.error("drizzle-kit export failed, so the schema was not checked.");
    return false;
  }

  let checked = 0;
  const offenders: string[] = [];
  for (const statement of statements) {
    const table = /^CREATE TABLE (?<table>\S+)/u.exec(statement)?.groups?.table;
    if (!table) {
      continue;
    }
    for (const line of statement.split("\n")) {
      const column = TIMESTAMP_COLUMN.exec(line)?.groups?.column;
      if (!column) {
        continue;
      }
      checked += 1;
      if (BARE_TIMESTAMP_COLUMN.test(line)) {
        offenders.push(`${table}."${column}"`);
      }
    }
  }

  // Zero matches means the export format changed under the regexes, not that
  // the schema is clean.
  if (checked === 0) {
    console.error("Found no timestamp columns in the drizzle-kit export.");
    return false;
  }
  if (offenders.length > 0) {
    console.error(
      [
        `${offenders.length} of ${checked} timestamp columns have no time zone:`,
        ...offenders.map((name) => `  ${name}`),
        "Add { withTimezone: true } to each timestamp(...). If",
        "src/auth-schema.ts was just regenerated, re-apply the post-regen",
        "fixups in AGENTS.md.",
      ].join("\n")
    );
    return false;
  }
  console.log(`All ${checked} timestamp columns have a time zone.`);
  return true;
}

process.exitCode = check() ? 0 : 1;
