import { sql } from "drizzle-orm";
import { pgTableCreator } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-orm/zod";
import { nanoid } from "nanoid";
import { z } from "zod/v4";

// drizzle-orm v1 moved casing from the `drizzle()` config to table creation,
// so bind snake_case here to keep camelCase keys mapping to snake_case columns.
const pgTable = pgTableCreator((name) => name, "snake_case");

export const Post = pgTable("post", (t) => ({
  content: t.text().notNull(),
  createdAt: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
  id: t.text().notNull().primaryKey().$defaultFn(nanoid),
  title: t.varchar({ length: 256 }).notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  content: z.string().max(256),
  title: z.string().max(256),
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

// oxlint-disable-next-line no-barrel-file -- auto-generated auth schema
export * from "./auth-schema";
