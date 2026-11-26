"use client";

import type { RouterOutputs } from "@acme/api";
import type { AuditLogAction } from "@acme/auth";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { DataTable, dataColumns, SortableHeader } from "@acme/ui/data-table";
import { AUDIT_LOG_SORTS } from "@acme/validators/admin";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { TableSearch } from "~/components/data-table/table-search";
import {
  usePaging,
  useTableQuery,
} from "~/components/data-table/use-table-query";
import { orpc } from "~/rpc/react";

const ACTION_LABEL_KEYS = {
  invite_accepted: "auditLog.actions.inviteAccepted",
  invite_cancelled: "auditLog.actions.inviteCancelled",
  invite_rejected: "auditLog.actions.inviteRejected",
  member_invited: "auditLog.actions.memberInvited",
  member_removed: "auditLog.actions.memberRemoved",
  organization_created: "auditLog.actions.organizationCreated",
  organization_updated: "auditLog.actions.organizationUpdated",
  password_changed: "auditLog.actions.passwordChanged",
  password_reset_completed: "auditLog.actions.passwordResetCompleted",
  password_reset_requested: "auditLog.actions.passwordResetRequested",
  two_factor_disabled: "auditLog.actions.twoFactorDisabled",
  two_factor_enabled: "auditLog.actions.twoFactorEnabled",
  user_deleted: "auditLog.actions.userDeleted",
  user_profile_updated: "auditLog.actions.userProfileUpdated",
  user_signed_in: "auditLog.actions.userSignedIn",
  user_signed_out: "auditLog.actions.userSignedOut",
  user_signed_up: "auditLog.actions.userSignedUp",
} as const satisfies Record<AuditLogAction, string>;

function isKnownAction(action: string): action is AuditLogAction {
  return Object.hasOwn(ACTION_LABEL_KEYS, action);
}

type AuditLogRow = RouterOutputs["auditLog"]["list"]["rows"][number];

const column = dataColumns<AuditLogRow>();

function useAuditLogColumns() {
  const { t } = useTranslation();
  const unknown = (
    <span className="text-muted-foreground">{t("auditLog.unknown")}</span>
  );
  return column.columns([
    column.accessor("createdAt", {
      cell: (info) => format(info.getValue(), "yyyy-MM-dd HH:mm:ss"),
      header: ({ column: header }) => (
        <SortableHeader column={header} title={t("auditLog.time")} />
      ),
    }),
    column.accessor("action", {
      cell: (info) => {
        const action = info.getValue();
        return (
          <Badge variant="outline">
            {isKnownAction(action) ? t(ACTION_LABEL_KEYS[action]) : action}
          </Badge>
        );
      },
      header: ({ column: header }) => (
        <SortableHeader column={header} title={t("auditLog.action")} />
      ),
    }),
    column.accessor((row) => row.user?.name ?? row.user?.email ?? null, {
      cell: (info) => info.getValue() ?? unknown,
      header: ({ column: header }) => (
        <SortableHeader column={header} title={t("auditLog.user")} />
      ),
      id: "user",
    }),
    column.accessor("ipAddress", {
      cell: (info) => info.getValue() ?? unknown,
      header: ({ column: header }) => (
        <SortableHeader column={header} title={t("auditLog.ipAddress")} />
      ),
    }),
  ]);
}

export function AuditLogCard() {
  const { t } = useTranslation();
  const query = useTableQuery({
    columns: AUDIT_LOG_SORTS,
    sort: { desc: true, id: "createdAt" },
  });
  const { data, isPending } = useQuery({
    ...orpc.auditLog.list.queryOptions({ input: query.input }),
    // Keep the last page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
  const paging = usePaging(query, data?.total ?? 0);
  const columns = useAuditLogColumns();

  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-2xl">{t("auditLog.title")}</CardTitle>
        <TableSearch
          id="audit-log-search"
          label={t("auditLog.search")}
          onChange={query.search.handleChange}
          placeholder={t("auditLog.searchPlaceholder")}
          value={query.search.value}
        />
      </CardHeader>
      <CardContent>
        <DataTable
          columnClassName={{ createdAt: "whitespace-nowrap" }}
          columns={columns}
          data={data?.rows ?? []}
          empty={t("auditLog.empty")}
          getRowId={(row) => row.id}
          loading={isPending}
          paging={paging}
          sorting={query.sorting}
        />
      </CardContent>
    </Card>
  );
}
