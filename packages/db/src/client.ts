import type { EmptyRelations } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm/_relations";
import {
  type NodePgDatabase,
  type NodePgTransaction,
  drizzle,
} from "drizzle-orm/node-postgres";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

export const db: NodePgDatabase<typeof schema> = drizzle(
  process.env.POSTGRES_URL,
  {
    casing: "snake_case",
    schema,
  }
);

// Define the structure of your schema and its relations
type Schema = typeof schema;

// Define the reusable Transaction type
export type Transaction = NodePgTransaction<
  Schema,
  EmptyRelations,
  ExtractTablesWithRelations<Schema>
>;

// Union type for db or transaction - useful for context typing
export type Database = typeof db | Transaction;
