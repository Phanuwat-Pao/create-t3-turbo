/**
 * The contract of the web's data tables. A paged list takes a page (from 1),
 * a page size, one sort column and a search, and returns one page of rows
 * with the size of the whole searched list. The server sorts, searches and
 * pages; the browser never holds more than one page.
 */
import { z } from "zod/v4";

/** Page sizes the tables offer; the API refuses anything above the last. */
export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const SEARCH_MAX_LENGTH = 100;

type Columns = readonly [string, ...string[]];

export interface SortOf<T extends Columns> {
  desc: boolean;
  id: T[number];
}

/** One sort column out of `columns` and its direction. */
export function sortSchema<const T extends Columns>(
  columns: T,
  fallback: SortOf<T>
) {
  return z.object({ desc: z.boolean(), id: z.enum(columns) }).default(fallback);
}

/** A trimmed search; blank means none. */
export const SearchSchema = z
  .string()
  .trim()
  .max(SEARCH_MAX_LENGTH)
  .optional()
  .transform((value) => value || undefined);

/** The input of a server-paged list sortable by `columns`. */
export function pagedQuery<const T extends Columns>(
  columns: T,
  fallback: SortOf<T>
) {
  return z.object({
    page: z.int().min(1).default(1),
    pageSize: z.int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    search: SearchSchema,
    sort: sortSchema(columns, fallback),
  });
}

/** One page of `row`s and the size of the whole (searched) list. */
export function pagedRows<T extends z.ZodType>(row: T) {
  return z.object({ rows: z.array(row), total: z.int().min(0) });
}

export interface PageInput {
  page: number;
  pageSize: number;
}

/** Rows to skip for a page. */
export function pageOffset({ page, pageSize }: PageInput): number {
  return (page - 1) * pageSize;
}
