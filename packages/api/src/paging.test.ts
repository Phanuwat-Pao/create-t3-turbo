import { PgDialect } from "@acme/db";
import { AuditLog } from "@acme/db/schema";

import { likePattern, matchesSearch, searchWords } from "./paging";

const dialect = new PgDialect();

describe("likePattern", () => {
  it("escapes LIKE's own characters", () => {
    expect(likePattern("50%_off\\")).toBe(String.raw`%50\%\_off\\%`);
  });
});

describe("searchWords", () => {
  it("splits on runs of spaces and keeps at most five words", () => {
    expect(searchWords("  a  b c d e f ")).toEqual(["a", "b", "c", "d", "e"]);
    expect(searchWords(undefined)).toEqual([]);
  });
});

describe("matchesSearch", () => {
  it("is no condition without a search", () => {
    expect(matchesSearch([AuditLog.action], undefined)).toBeUndefined();
    expect(matchesSearch([AuditLog.action], "   ")).toBeUndefined();
  });

  it("needs every word in one of the columns", () => {
    const where = matchesSearch(
      [AuditLog.action, AuditLog.ipAddress],
      "sign 10.0"
    );
    if (!where) {
      throw new Error("expected a condition");
    }
    const query = dialect.sqlToQuery(where);
    expect(query.sql).toBe(
      '(((("audit_log"."action" ilike $1) or ("audit_log"."ip_address" ilike $2))) and ((("audit_log"."action" ilike $3) or ("audit_log"."ip_address" ilike $4))))'
    );
    expect(query.params).toEqual(["%sign%", "%sign%", "%10.0%", "%10.0%"]);
  });
});
