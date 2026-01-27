import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";

import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

export const db = drizzle(process.env.POSTGRES_URL, {
  casing: "snake_case",
  schema,
});

// Define the structure of your schema and its relations
type Schema = typeof schema;

// Define the reusable Transaction type
export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

// Union type for db or transaction - useful for context typing
export type Database = typeof db | Transaction;
