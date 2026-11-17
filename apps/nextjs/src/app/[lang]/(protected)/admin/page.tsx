"use client";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { SelectItem } from "@acme/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, RefreshCw, Trash, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { dateLocales } from "~/i18n/date-locale";
import { withLocale } from "~/i18n/localized-path";
import { useLocale } from "~/i18n/use-locale";

import { AuditLogCard } from "./_components/audit-log-card";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string | null;
  banned: boolean | null;
}

interface UserRowProps {
  user: User;
  isLoading: string | undefined;
  onDelete: (id: string) => void;
  onRevoke: (id: string) => void;
  onImpersonate: (id: string) => void;
  onBanToggle: (user: User) => void;
}

const UserRow = memo(
  ({
    user,
    isLoading,
    onDelete,
    onRevoke,
    onImpersonate,
    onBanToggle,
  }: UserRowProps) => {
    const { t } = useTranslation();
    const roleLabels: Record<string, string> = {
      admin: t("admin.roleAdmin"),
      user: t("admin.roleUser"),
    };
    const role = user.role || "user";
    const handleDelete = useCallback(
      () => onDelete(user.id),
      [onDelete, user.id]
    );
    const handleRevoke = useCallback(
      () => onRevoke(user.id),
      [onRevoke, user.id]
    );
    const handleImpersonate = useCallback(
      () => onImpersonate(user.id),
      [onImpersonate, user.id]
    );
    const handleBanToggle = useCallback(
      () => onBanToggle(user),
      [onBanToggle, user]
    );

    return (
      <TableRow>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.name}</TableCell>
        <TableCell>{roleLabels[role] ?? role}</TableCell>
        <TableCell>
          {user.banned ? (
            <Badge variant="destructive">{t("admin.yes")}</Badge>
          ) : (
            <Badge variant="outline">{t("admin.no")}</Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading?.startsWith("delete")}
            >
              {isLoading === `delete-${user.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevoke}
              disabled={isLoading?.startsWith("revoke")}
            >
              {isLoading === `revoke-${user.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImpersonate}
              disabled={isLoading?.startsWith("impersonate")}
            >
              {isLoading === `impersonate-${user.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserCircle className="mr-2 h-4 w-4" />
                  {t("admin.impersonate")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBanToggle}
              disabled={isLoading?.startsWith("ban")}
            >
              {isLoading === `ban-${user.id}` && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isLoading !== `ban-${user.id}` &&
                user.banned &&
                t("admin.unban")}
              {isLoading !== `ban-${user.id}` && !user.banned && t("admin.ban")}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);
UserRow.displayName = "UserRow";

function AdminDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState("");

  const createUserSchema = z.object({
    email: z.email(t("validation.emailRequired")),
    name: z.string().trim().min(1, t("validation.nameRequired")),
    password: z.string().min(8, t("validation.passwordMinLength")),
    role: z.enum(["admin", "user"]),
  });

  const banUserSchema = z.object({
    expirationDate: z.date({ error: t("validation.expirationDateRequired") }),
    reason: z.string().trim().min(1, t("validation.reasonRequired")),
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        }
      );
      return data?.users || [];
    },
    queryKey: ["users"],
  });

  const invalidateUsers = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    [queryClient]
  );

  const createUserForm = useAppForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "user" as "admin" | "user",
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        const { error } = await authClient.admin.createUser({
          email: value.email,
          name: value.name,
          password: value.password,
          role: value.role,
        });
        if (error) {
          toast.error(error.message || t("admin.failedToCreateUser"));
          return;
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : t("admin.failedToCreateUser")
        );
        return;
      }
      toast.success(t("admin.createUserSuccess"));
      formApi.reset();
      setIsDialogOpen(false);
      await invalidateUsers();
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createUserSchema,
    },
  });

  const banUserForm = useAppForm({
    defaultValues: {
      expirationDate: undefined as Date | undefined,
      reason: "",
    },
    onSubmit: async ({ formApi, value }) => {
      if (!value.expirationDate) {
        return;
      }
      setIsLoading(`ban-${banUserId}`);
      try {
        const { error } = await authClient.admin.banUser({
          banExpiresIn: value.expirationDate.getTime() - Date.now(),
          banReason: value.reason,
          userId: banUserId,
        });
        if (error) {
          toast.error(error.message || t("admin.failedToBanUser"));
        } else {
          toast.success(t("admin.banUserSuccess"));
          setIsBanDialogOpen(false);
          formApi.reset();
          await invalidateUsers();
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : t("admin.failedToBanUser")
        );
      }
      setIsLoading(undefined);
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: banUserSchema,
    },
  });

  const handleDeleteUser = useCallback(
    async (id: string) => {
      setIsLoading(`delete-${id}`);
      try {
        const { error } = await authClient.admin.removeUser({ userId: id });
        if (error) {
          toast.error(error.message || t("admin.failedToDeleteUser"));
        } else {
          toast.success(t("admin.deleteUserSuccess"));
          await invalidateUsers();
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("admin.failedToDeleteUser");
        toast.error(message);
      }
      setIsLoading(undefined);
    },
    [invalidateUsers, t]
  );

  const handleRevokeSessions = useCallback(
    async (id: string) => {
      setIsLoading(`revoke-${id}`);
      try {
        const { error } = await authClient.admin.revokeUserSessions({
          userId: id,
        });
        if (error) {
          toast.error(error.message || t("admin.failedToRevokeSessions"));
        } else {
          toast.success(t("admin.revokeSessionsSuccess"));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("admin.failedToRevokeSessions");
        toast.error(message);
      }
      setIsLoading(undefined);
    },
    [t]
  );

  const handleImpersonateUser = useCallback(
    async (id: string) => {
      setIsLoading(`impersonate-${id}`);
      try {
        const { error } = await authClient.admin.impersonateUser({
          userId: id,
        });
        if (error) {
          toast.error(error.message || t("admin.failedToImpersonate"));
        } else {
          toast.success(t("admin.impersonateSuccess"));
          router.push(withLocale("/dashboard", locale));
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : t("admin.failedToImpersonate");
        toast.error(message);
      }
      setIsLoading(undefined);
    },
    [locale, router, t]
  );

  const handleBanToggle = useCallback(
    async (user: User) => {
      if (!user.banned) {
        setBanUserId(user.id);
        banUserForm.reset();
        setIsBanDialogOpen(true);
        return;
      }
      setIsLoading(`ban-${user.id}`);
      try {
        const { error } = await authClient.admin.unbanUser({
          userId: user.id,
        });
        if (error) {
          toast.error(error.message || t("admin.failedToUnbanUser"));
        } else {
          await invalidateUsers();
          toast.success(t("admin.unbanUserSuccess"));
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : t("admin.failedToUnbanUser")
        );
      }
      setIsLoading(undefined);
    },
    [banUserForm, invalidateUsers, t]
  );

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {t("admin.dashboardTitle")}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("admin.createUser")}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={t("common.close")}>
              <DialogHeader>
                <DialogTitle>{t("admin.createUserTitle")}</DialogTitle>
              </DialogHeader>
              <createUserForm.AppForm>
                <createUserForm.Form className="space-y-4">
                  <FieldGroup>
                    <createUserForm.AppField name="email">
                      {(field) => (
                        <field.TextField
                          autoComplete="email"
                          id="email"
                          label={t("common.email")}
                          type="email"
                        />
                      )}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="password">
                      {(field) => (
                        <field.TextField
                          autoComplete="new-password"
                          id="password"
                          label={t("common.password")}
                          type="password"
                        />
                      )}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="name">
                      {(field) => (
                        <field.TextField id="name" label={t("common.name")} />
                      )}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="role">
                      {(field) => (
                        <field.SelectField
                          id="role"
                          label={t("admin.roleLabel")}
                          placeholder={t("admin.rolePlaceholder")}
                        >
                          <SelectItem value="admin">
                            {t("admin.roleAdmin")}
                          </SelectItem>
                          <SelectItem value="user">
                            {t("admin.roleUser")}
                          </SelectItem>
                        </field.SelectField>
                      )}
                    </createUserForm.AppField>
                  </FieldGroup>
                  <createUserForm.SubmitButton
                    className="w-full"
                    submittingLabel={t("admin.creating")}
                  >
                    {t("admin.createUser")}
                  </createUserForm.SubmitButton>
                </createUserForm.Form>
              </createUserForm.AppForm>
            </DialogContent>
          </Dialog>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent closeLabel={t("common.close")}>
              <DialogHeader>
                <DialogTitle>{t("admin.banUser")}</DialogTitle>
              </DialogHeader>
              <banUserForm.AppForm>
                <banUserForm.Form className="space-y-4">
                  <FieldGroup>
                    <banUserForm.AppField name="reason">
                      {(field) => (
                        <field.TextField
                          id="reason"
                          label={t("admin.reasonLabel")}
                        />
                      )}
                    </banUserForm.AppField>
                    <banUserForm.AppField name="expirationDate">
                      {(field) => (
                        <field.DateField
                          id="expirationDate"
                          locale={dateLocales[locale]}
                          label={t("admin.expirationDateLabel")}
                          placeholder={t("admin.expirationDatePlaceholder")}
                        />
                      )}
                    </banUserForm.AppField>
                  </FieldGroup>
                  <banUserForm.SubmitButton
                    className="w-full"
                    submittingLabel={t("admin.banning")}
                  >
                    {t("admin.banUser")}
                  </banUserForm.SubmitButton>
                </banUserForm.Form>
              </banUserForm.AppForm>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.email")}</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("admin.roleLabel")}</TableHead>
                  <TableHead>{t("admin.banned")}</TableHead>
                  <TableHead>{t("admin.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: User) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isLoading={isLoading}
                    onDelete={handleDeleteUser}
                    onRevoke={handleRevokeSessions}
                    onImpersonate={handleImpersonateUser}
                    onBanToggle={handleBanToggle}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AuditLogCard />
    </div>
  );
}

export default function Page() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const router = useRouter();
  const locale = useLocale();

  // Cast user to include role from admin plugin
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (!isSessionLoading && userRole !== "admin") {
      router.push(withLocale("/dashboard", locale));
    }
  }, [userRole, isSessionLoading, locale, router]);

  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userRole !== "admin") {
    return null;
  }

  return <AdminDashboard />;
}
