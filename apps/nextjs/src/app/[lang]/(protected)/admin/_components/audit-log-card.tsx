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

import { orpc } from "~/rpc/react";

function AuditLogShell({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AuditLogCard() {
  const { data: logs, isLoading } = useQuery(
    orpc.auditLog.list.queryOptions({
      input: { limit: 50, offset: 0 },
    })
  );

  if (isLoading) {
    return (
      <AuditLogShell>
        <p className="text-muted-foreground text-sm">Loading audit logs…</p>
      </AuditLogShell>
    );
  }

  if (!logs?.length) {
    return (
      <AuditLogShell>
        <p className="text-muted-foreground text-sm">No audit events yet.</p>
      </AuditLogShell>
    );
  }

  return (
    <AuditLogShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>IP address</TableHead>
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
