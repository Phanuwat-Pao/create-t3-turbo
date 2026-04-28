import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import { relations } from "./relations";
import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

export const db: NodePgDatabase<typeof schema, typeof relations> = drizzle(
  process.env.POSTGRES_URL,
  {
    casing: "snake_case",
    relations,
    schema,
  }
);

// Reusable Transaction type derived from db.transaction's callback parameter
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Union type for db or transaction - useful for context typing
export type Database = typeof db | Transaction;
