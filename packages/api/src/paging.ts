/**
 * Server-side search for the web's data tables (`@acme/validators/paging`).
 * A search matches word by word: every word has to be in one of the columns,
 * so "alice sign" finds Alice's sign-ins. Paging itself is `.limit()` and
 * `.offset(pageOffset(input))` on the query.
 */
import { and, ilike, or, type SQL } from "@acme/db";

/** Anything ILIKE can compare: a column or an SQL expression. */
type Searchable = Parameters<typeof ilike>[0];

/** At most this many words of a search count. */
const MAX_WORDS = 5;

/** `word` as an ILIKE pattern, with `\` escaping LIKE's own characters. */
export function likePattern(word: string): string {
  return `%${word.replaceAll(/[\\%_]/gu, (char) => `\\${char}`)}%`;
}

/** The words of a search; spaces only separate them. */
export function searchWords(search: string | undefined): string[] {
  return (search ?? "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, MAX_WORDS);
}

/**
 * A WHERE clause that holds when every word of `search` is in one of
 * `columns`, ignoring case. No search gives `undefined`, which drizzle reads
 * as no condition.
 */
export function matchesSearch(
  columns: readonly Searchable[],
  search: string | undefined
): SQL | undefined {
  const words = searchWords(search);
  if (words.length === 0 || columns.length === 0) {
    return undefined;
  }
  return and(
    ...words.map((word) =>
      or(...columns.map((column) => ilike(column, likePattern(word))))
    )
  );
}
