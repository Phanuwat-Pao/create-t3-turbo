"use client";

import type { AuditLogAction } from "@acme/auth";
import { Badge } from "@acme/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

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

function AuditLogShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{t("auditLog.title")}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AuditLogCard() {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useQuery(
    orpc.auditLog.list.queryOptions({
      input: { limit: 50, offset: 0 },
    })
  );

  if (isLoading) {
    return (
      <AuditLogShell>
        <p className="text-muted-foreground text-sm">{t("auditLog.loading")}</p>
      </AuditLogShell>
    );
  }

  if (!logs?.length) {
    return (
      <AuditLogShell>
        <p className="text-muted-foreground text-sm">{t("auditLog.empty")}</p>
      </AuditLogShell>
    );
  }

  return (
    <AuditLogShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("auditLog.time")}</TableHead>
            <TableHead>{t("auditLog.action")}</TableHead>
            <TableHead>{t("auditLog.user")}</TableHead>
            <TableHead>{t("auditLog.ipAddress")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {format(log.createdAt, "yyyy-MM-dd HH:mm:ss")}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {isKnownAction(log.action)
                    ? t(ACTION_LABEL_KEYS[log.action])
                    : log.action}
                </Badge>
              </TableCell>
              <TableCell>
                {log.user ? (log.user.name ?? log.user.email) : "—"}
              </TableCell>
              <TableCell>{log.ipAddress ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AuditLogShell>
  );
}
