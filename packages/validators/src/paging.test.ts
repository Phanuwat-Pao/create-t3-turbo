import { describe, expect, it } from "vitest";

import { MAX_PAGE_SIZE, pagedQuery, pageOffset } from "./paging";

const Query = pagedQuery(["name", "createdAt"], {
  desc: true,
  id: "createdAt",
});

describe("pagedQuery", () => {
  it("fills the first page, the default size and the fallback sort", () => {
    expect(Query.parse({})).toEqual({
      page: 1,
      pageSize: 25,
      search: undefined,
      sort: { desc: true, id: "createdAt" },
    });
  });

  it("treats a blank search as none and trims the rest", () => {
    expect(Query.parse({ search: "   " }).search).toBeUndefined();
    expect(Query.parse({ search: "  alice " }).search).toBe("alice");
  });

  it("refuses an unknown sort column, page 0 and an oversized page", () => {
    expect(
      Query.safeParse({ sort: { desc: false, id: "password" } }).success
    ).toBe(false);
    expect(Query.safeParse({ page: 0 }).success).toBe(false);
    expect(Query.safeParse({ pageSize: MAX_PAGE_SIZE + 1 }).success).toBe(
      false
    );
  });
});

describe("pageOffset", () => {
  it("skips the earlier pages", () => {
    expect(pageOffset({ page: 1, pageSize: 25 })).toBe(0);
    expect(pageOffset({ page: 3, pageSize: 25 })).toBe(50);
  });
});
