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
import { Toaster, toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";

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
        <TableCell>{user.role || "user"}</TableCell>
        <TableCell>
          {user.banned ? (
            <Badge variant="destructive">Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
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
                  Impersonate
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
              {isLoading !== `ban-${user.id}` && user.banned && "Unban"}
              {isLoading !== `ban-${user.id}` && !user.banned && "Ban"}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }
);
UserRow.displayName = "UserRow";

const createUserSchema = z.object({
  email: z.email("Please enter a valid email address."),
  name: z.string().trim().min(1, "Name is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["admin", "user"]),
});

const banUserSchema = z.object({
  expirationDate: z.date({ error: "Expiration date is required." }),
  reason: z.string().trim().min(1, "Reason is required."),
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banUserId, setBanUserId] = useState("");

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
          toast.error(error.message || "Failed to create user");
          return;
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create user"
        );
        return;
      }
      toast.success("User created successfully");
      formApi.reset();
      setIsDialogOpen(false);
      invalidateUsers();
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
          toast.error(error.message || "Failed to ban user");
        } else {
          toast.success("User banned successfully");
          setIsBanDialogOpen(false);
          formApi.reset();
          invalidateUsers();
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Failed to ban user"
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
        await authClient.admin.removeUser({ userId: id });
        toast.success("User deleted successfully");
        invalidateUsers();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete user";
        toast.error(message);
      }
      setIsLoading(undefined);
    },
    [invalidateUsers]
  );

  const handleRevokeSessions = useCallback(async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      await authClient.admin.revokeUserSessions({ userId: id });
      toast.success("Sessions revoked for user");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to revoke sessions";
      toast.error(message);
    }
    setIsLoading(undefined);
  }, []);

  const handleImpersonateUser = useCallback(
    async (id: string) => {
      setIsLoading(`impersonate-${id}`);
      try {
        await authClient.admin.impersonateUser({ userId: id });
        toast.success("Impersonated user");
        router.push("/dashboard");
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to impersonate user";
        toast.error(message);
      }
      setIsLoading(undefined);
    },
    [router]
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
      await authClient.admin.unbanUser(
        {
          userId: user.id,
        },
        {
          onError(context: { error: { message?: string } }) {
            toast.error(context.error.message || "Failed to unban user");
            setIsLoading(undefined);
          },
          onSuccess() {
            invalidateUsers();
            toast.success("User unbanned successfully");
          },
        }
      );
      invalidateUsers();
    },
    [banUserForm, invalidateUsers]
  );

  return (
    <div className="container mx-auto space-y-8 p-4">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <createUserForm.AppForm>
                <createUserForm.Form className="space-y-4">
                  <FieldGroup>
                    <createUserForm.AppField name="email">
                      {(field) => (
                        <field.TextField
                          autoComplete="email"
                          id="email"
                          label="Email"
                          type="email"
                        />
                      )}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="password">
                      {(field) => (
                        <field.TextField
                          autoComplete="new-password"
                          id="password"
                          label="Password"
                          type="password"
                        />
                      )}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="name">
                      {(field) => <field.TextField id="name" label="Name" />}
                    </createUserForm.AppField>
                    <createUserForm.AppField name="role">
                      {(field) => (
                        <field.SelectField
                          id="role"
                          label="Role"
                          placeholder="Select role"
                        >
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </field.SelectField>
                      )}
                    </createUserForm.AppField>
                  </FieldGroup>
                  <createUserForm.SubmitButton
                    className="w-full"
                    submittingLabel="Creating..."
                  >
                    Create User
                  </createUserForm.SubmitButton>
                </createUserForm.Form>
              </createUserForm.AppForm>
            </DialogContent>
          </Dialog>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <banUserForm.AppForm>
                <banUserForm.Form className="space-y-4">
                  <FieldGroup>
                    <banUserForm.AppField name="reason">
                      {(field) => (
                        <field.TextField id="reason" label="Reason" />
                      )}
                    </banUserForm.AppField>
                    <banUserForm.AppField name="expirationDate">
                      {(field) => (
                        <field.DateField
                          id="expirationDate"
                          label="Expiration Date"
                        />
                      )}
                    </banUserForm.AppField>
                  </FieldGroup>
                  <banUserForm.SubmitButton
                    className="w-full"
                    submittingLabel="Banning..."
                  >
                    Ban User
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
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Banned</TableHead>
                  <TableHead>Actions</TableHead>
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

  // Cast user to include role from admin plugin
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (!isSessionLoading && userRole !== "admin") {
      router.push("/dashboard");
    }
  }, [userRole, isSessionLoading, router]);

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
