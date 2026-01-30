"use client";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

import { authClient } from "~/auth/client";
import { cn } from "~/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: string | null;
  banned: boolean;
}

interface UserRowProps {
  user: User;
  isLoading: string | undefined;
  onDelete: (id: string) => void;
  onRevoke: (id: string) => void;
  onImpersonate: (id: string) => void;
  onBanToggle: (user: User) => void;
}

const UserRow = memo(function UserRow({
  user,
  isLoading,
  onDelete,
  onRevoke,
  onImpersonate,
  onBanToggle,
}: UserRowProps) {
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
});

export default function Page() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isSessionLoading && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, isSessionLoading, router]);

  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "user" as const,
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    expirationDate: undefined as Date | undefined,
    reason: "",
    userId: "",
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

  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading("create");
      try {
        await authClient.admin.createUser({
          email: newUser.email,
          name: newUser.name,
          password: newUser.password,
          role: newUser.role,
        });
        toast.success("User created successfully");
        setNewUser({ email: "", name: "", password: "", role: "user" });
        setIsDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to create user";
        toast.error(message);
      } finally {
        setIsLoading(undefined);
      }
    },
    [newUser, queryClient]
  );

  const handleDeleteUser = useCallback(
    async (id: string) => {
      setIsLoading(`delete-${id}`);
      try {
        await authClient.admin.removeUser({ userId: id });
        toast.success("User deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to delete user";
        toast.error(message);
      } finally {
        setIsLoading(undefined);
      }
    },
    [queryClient]
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
    } finally {
      setIsLoading(undefined);
    }
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
      } finally {
        setIsLoading(undefined);
      }
    },
    [router]
  );

  const handleBanToggle = useCallback(
    async (user: User) => {
      setBanForm({
        expirationDate: undefined,
        reason: "",
        userId: user.id,
      });
      if (user.banned) {
        setIsLoading(`ban-${user.id}`);
        await authClient.admin.unbanUser(
          {
            userId: user.id,
          },
          {
            onError(context) {
              toast.error(context.error.message || "Failed to unban user");
              setIsLoading(undefined);
            },
            onSuccess() {
              queryClient.invalidateQueries({
                queryKey: ["users"],
              });
              toast.success("User unbanned successfully");
            },
          }
        );
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      } else {
        setIsBanDialogOpen(true);
      }
    },
    [queryClient]
  );

  const handleBanUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(`ban-${banForm.userId}`);
      try {
        if (!banForm.expirationDate) {
          throw new Error("Expiration date is required");
        }
        await authClient.admin.banUser({
          banExpiresIn: banForm.expirationDate.getTime() - Date.now(),
          banReason: banForm.reason,
          userId: banForm.userId,
        });
        toast.success("User banned successfully");
        setIsBanDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to ban user";
        toast.error(message);
      } finally {
        setIsLoading(undefined);
      }
    },
    [banForm, queryClient]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewUser((prev) => ({ ...prev, email: e.target.value }));
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewUser((prev) => ({ ...prev, password: e.target.value }));
    },
    []
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewUser((prev) => ({ ...prev, name: e.target.value }));
    },
    []
  );

  const handleRoleChange = useCallback((value: "admin" | "user") => {
    setNewUser((prev) => ({ ...prev, role: value as "user" }));
  }, []);

  const handleBanReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBanForm((prev) => ({ ...prev, reason: e.target.value }));
    },
    []
  );

  const handleBanDateSelect = useCallback((date: Date | undefined) => {
    setBanForm((prev) => ({ ...prev, expirationDate: date }));
  }, []);

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
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === "create"}
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBanUser} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={banForm.reason}
                    onChange={handleBanReasonChange}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expirationDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !banForm.expirationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={banForm.expirationDate}
                        onSelect={handleBanDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Banning...
                    </>
                  ) : (
                    "Ban User"
                  )}
                </Button>
              </form>
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
                {users?.map((user) => (
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
    </div>
  );
}
