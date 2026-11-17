"use client";

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
                <Badge variant="outline">{log.action}</Badge>
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
