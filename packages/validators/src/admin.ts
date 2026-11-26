/**
 * Inputs of the admin page's tables: the audit log (`auditLog.list`) and
 * Better Auth's user list.
 */
import { pagedQuery } from "./paging";

/** Columns the audit log sorts on. */
export const AUDIT_LOG_SORTS = [
  "createdAt",
  "action",
  "user",
  "ipAddress",
] as const;

export type AuditLogSort = (typeof AUDIT_LOG_SORTS)[number];

export const AuditLogPageInput = pagedQuery(AUDIT_LOG_SORTS, {
  desc: true,
  id: "createdAt",
});

/** Better Auth user fields the admin user list sorts on. */
export const ADMIN_USER_SORTS = [
  "createdAt",
  "email",
  "name",
  "role",
  "banned",
] as const;

export type AdminUserSort = (typeof ADMIN_USER_SORTS)[number];
