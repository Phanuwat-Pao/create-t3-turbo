"use client";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { MobileIcon } from "@radix-ui/react-icons";
import {
  Edit,
  Fingerprint,
  Laptop,
  Loader2,
  LogOut,
  Plus,
  QrCode,
  ShieldCheck,
  ShieldOff,
  StopCircle,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

import type { Dictionary } from "~/i18n/get-dictionary";
import type { Session } from "~/lib/auth";

import { authClient } from "~/auth/client";
import { ChangePasswordForm } from "~/components/forms/change-password-form";
import { TwoFactorDisableForm } from "~/components/forms/two-factor-disable-form";
import { TwoFactorEnableForm } from "~/components/forms/two-factor-enable-form";
import { TwoFactorQrForm } from "~/components/forms/two-factor-qr-form";
import { UpdateUserForm } from "~/components/forms/update-user-form";
import { useRevokeSessionMutation } from "~/data/user/revoke-session-mutation";
import { useSessionQuery } from "~/data/user/session-query";
import { useSignOutMutation } from "~/data/user/sign-out-mutation";

// Extended user type with twoFactor plugin fields
type ExtendedUser = Session["user"] & { twoFactorEnabled?: boolean };
// Extended session type with admin plugin fields
type ExtendedSessionData = Session["session"] & { impersonatedBy?: string };

interface SessionItemProps {
  session: Session["session"];
  currentSessionId: string | undefined;
  isTerminating: boolean;
  onRevoke: (token: string) => void;
  dict: Dictionary;
}

const SessionItem = memo(function SessionItem({
  session,
  currentSessionId,
  isTerminating,
  onRevoke,
  dict,
}: SessionItemProps) {
  const isCurrentSession = session.id === currentSessionId;

  const handleRevoke = useCallback(() => {
    onRevoke(session.token);
  }, [session.token, onRevoke]);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
        {new UAParser(session.userAgent || "").getDevice().type === "mobile" ? (
          <MobileIcon />
        ) : (
          <Laptop size={16} />
        )}
        {new UAParser(session.userAgent || "").getOS().name ||
          session.userAgent}
        , {new UAParser(session.userAgent || "").getBrowser().name}
        <button
          type="button"
          className="cursor-pointer text-xs text-red-500 underline opacity-80"
          onClick={handleRevoke}
        >
          {isTerminating && <Loader2 size={15} className="animate-spin" />}
          {!isTerminating &&
            isCurrentSession &&
            dict.dashboard.sessions.signOut}
          {!isTerminating &&
            !isCurrentSession &&
            dict.dashboard.sessions.terminate}
        </button>
      </div>
    </div>
  );
});

const UserCard = (props: {
  session: Session | null;
  activeSessions: Session["session"][];
  dict: Dictionary;
}) => {
  const { dict } = props;
  const router = useRouter();
  const signOutMutation = useSignOutMutation();
  const revokeSessionMutation = useRevokeSessionMutation();
  const { data } = useSessionQuery();
  const session = data || props.session;
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [isSignOut, setIsSignOut] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState<boolean>(false);
  const [activeSessions, setActiveSessions] = useState(props.activeSessions);
  const removeActiveSession = useCallback(
    (id: string) =>
      setActiveSessions((prev) => prev.filter((session) => session.id !== id)),
    []
  );

  const handleSendVerificationEmail = useCallback(async () => {
    await authClient.sendVerificationEmail(
      {
        email: session?.user.email || "",
      },
      {
        onError(context: { error: { message: string } }) {
          toast.error(context.error.message);
          setEmailVerificationPending(false);
        },
        onRequest() {
          setEmailVerificationPending(true);
        },
        onSuccess() {
          toast.success(dict.dashboard.emailVerification.sentSuccess);
          setEmailVerificationPending(false);
        },
      }
    );
  }, [session?.user.email, dict]);

  const handleRevokeSession = useCallback(
    (token: string) => {
      revokeSessionMutation.mutate(
        { token },
        {
          onSuccess: () => {
            const sessionToRemove = activeSessions.find(
              (s) => s.token === token
            );
            if (sessionToRemove) {
              removeActiveSession(sessionToRemove.id);
              if (sessionToRemove.id === props.session?.session.id) {
                router.push("/");
              }
            }
          },
        }
      );
    },
    [
      revokeSessionMutation,
      activeSessions,
      removeActiveSession,
      props.session?.session.id,
      router,
    ]
  );

  const handleTwoFactorSuccess = useCallback(() => {
    setTwoFactorDialog(false);
  }, []);

  const handleStopImpersonation = useCallback(async () => {
    setIsSignOut(true);
    await authClient.admin.stopImpersonating();
    setIsSignOut(false);
    router.push("/admin");
  }, [router]);

  const handleSignOut = useCallback(() => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  }, [signOutMutation, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.dashboard.user.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage
                  src={session?.user.image || undefined}
                  alt={dict.dashboard.user.avatarAlt}
                  className="object-cover"
                />
                <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid">
                <div className="flex items-center gap-1">
                  <p className="text-sm leading-none font-medium">
                    {session?.user.name}
                  </p>
                </div>
                <p className="text-sm">{session?.user.email}</p>
              </div>
            </div>
            <EditUserDialog dict={dict} />
          </div>
        </div>{" "}
        {session?.user.emailVerified ? null : (
          <Alert>
            <AlertTitle>{dict.dashboard.emailVerification.title}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {dict.dashboard.emailVerification.description}
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={handleSendVerificationEmail}
              >
                {emailVerificationPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  dict.dashboard.emailVerification.resendButton
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="flex w-max flex-col gap-1 border-l-2 px-2">
          <p className="text-xs font-medium">{dict.dashboard.sessions.title}</p>
          {activeSessions
            .filter((activeSession) => activeSession.userAgent)
            .map((activeSession) => (
              <SessionItem
                key={activeSession.id}
                session={activeSession}
                currentSessionId={props.session?.session.id}
                isTerminating={
                  revokeSessionMutation.isPending &&
                  revokeSessionMutation.variables?.token === activeSession.token
                }
                onRevoke={handleRevokeSession}
                dict={dict}
              />
            ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-y py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm">{dict.dashboard.passkeys.title}</p>
            <div className="flex flex-wrap gap-2">
              <AddPasskey dict={dict} />
              <ListPasskeys dict={dict} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm">{dict.dashboard.twoFactor.title}</p>
            <div className="flex gap-2">
              {!!(session?.user as ExtendedUser)?.twoFactorEnabled && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <QrCode size={16} />
                      <span className="text-xs md:text-sm">
                        {dict.dashboard.twoFactor.scanQrCode}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-11/12 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {dict.dashboard.twoFactor.scanQrCode}
                      </DialogTitle>
                      <DialogDescription>
                        {dict.dashboard.twoFactor.scanQrDescription}
                      </DialogDescription>
                    </DialogHeader>
                    <TwoFactorQrForm />
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={twoFactorDialog} onOpenChange={setTwoFactorDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant={
                      (session?.user as ExtendedUser)?.twoFactorEnabled
                        ? "destructive"
                        : "outline"
                    }
                    className="gap-2"
                  >
                    {(session?.user as ExtendedUser)?.twoFactorEnabled ? (
                      <ShieldOff size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    <span className="text-xs md:text-sm">
                      {(session?.user as ExtendedUser)?.twoFactorEnabled
                        ? dict.dashboard.twoFactor.disable
                        : dict.dashboard.twoFactor.enable}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-11/12 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {(session?.user as ExtendedUser)?.twoFactorEnabled
                        ? dict.dashboard.twoFactor.disable
                        : dict.dashboard.twoFactor.enable}
                    </DialogTitle>
                    <DialogDescription>
                      {(session?.user as ExtendedUser)?.twoFactorEnabled
                        ? dict.dashboard.twoFactor.disableDescription
                        : dict.dashboard.twoFactor.enableDescription}
                    </DialogDescription>
                  </DialogHeader>
                  {(session?.user as ExtendedUser)?.twoFactorEnabled ? (
                    <TwoFactorDisableForm onSuccess={handleTwoFactorSuccess} />
                  ) : (
                    <TwoFactorEnableForm onSuccess={handleTwoFactorSuccess} />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between gap-2">
        <ChangePassword dict={dict} />
        {(session?.session as ExtendedSessionData)?.impersonatedBy ? (
          <Button
            className="z-10 gap-2"
            variant="secondary"
            onClick={handleStopImpersonation}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <StopCircle size={16} color="red" />
                  {dict.dashboard.user.stopImpersonation}
                </div>
              )}
            </span>
          </Button>
        ) : (
          <Button
            className="z-10 gap-2"
            variant="outline"
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
          >
            <span className="text-sm">
              {signOutMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  {dict.dashboard.user.signOut}
                </div>
              )}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
export default UserCard;

function ChangePassword({ dict }: { dict: Dictionary }) {
  const [open, setOpen] = useState<boolean>(false);

  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="z-10 gap-2" variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
            />
          </svg>
          <span className="text-muted-foreground text-sm">
            {dict.dashboard.changePassword.title}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict.dashboard.changePassword.title}</DialogTitle>
          <DialogDescription>
            {dict.dashboard.changePassword.description}
          </DialogDescription>
        </DialogHeader>
        <ChangePasswordForm onSuccess={handleSuccess} dict={dict} />
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ dict }: { dict: Dictionary }) {
  const { data } = useSessionQuery();
  const [open, setOpen] = useState<boolean>(false);

  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" variant="default">
          <Edit size={13} />
          {dict.dashboard.user.editUser}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict.dashboard.user.editUser}</DialogTitle>
          <DialogDescription>
            {dict.dashboard.user.editUserDescription}
          </DialogDescription>
        </DialogHeader>
        <UpdateUserForm
          currentName={data?.user.name}
          onSuccess={handleSuccess}
          dict={dict}
        />
      </DialogContent>
    </Dialog>
  );
}

function AddPasskey({ dict }: { dict: Dictionary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPasskey = useCallback(async () => {
    if (!passkeyName) {
      toast.error(dict.dashboard.passkeys.nameRequired);
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      setIsOpen(false);
      toast.success(dict.dashboard.passkeys.addedSuccess);
    }
    setIsLoading(false);
  }, [passkeyName, dict]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasskeyName(e.target.value);
    },
    []
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs md:text-sm">
          <Plus size={15} />
          {dict.dashboard.passkeys.addNew}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict.dashboard.passkeys.addNew}</DialogTitle>
          <DialogDescription>
            {dict.dashboard.passkeys.addNewDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="passkey-name">
            {dict.dashboard.passkeys.nameLabel}
          </Label>
          <Input
            id="passkey-name"
            value={passkeyName}
            onChange={handleNameChange}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            type="submit"
            onClick={handleAddPasskey}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                {dict.dashboard.passkeys.createButton}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PasskeyRowProps {
  passkey: { id: string; name?: string | null };
  isDeleting: boolean;
  onDelete: (id: string) => void;
  dict: Dictionary;
}

const PasskeyRow = memo(function PasskeyRow({
  passkey,
  isDeleting,
  onDelete,
  dict,
}: PasskeyRowProps) {
  const handleDelete = useCallback(() => {
    onDelete(passkey.id);
  }, [passkey.id, onDelete]);

  return (
    <TableRow className="flex items-center justify-between">
      <TableCell>
        {passkey.name || dict.dashboard.passkeys.defaultName}
      </TableCell>
      <TableCell className="text-right">
        <button type="button" onClick={handleDelete}>
          {isDeleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash size={15} className="cursor-pointer text-red-600" />
          )}
        </button>
      </TableCell>
    </TableRow>
  );
});

function ListPasskeys({ dict }: { dict: Dictionary }) {
  const { data } = authClient.useListPasskeys();
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(
    null
  );

  const handleAddPasskey = useCallback(async () => {
    if (!passkeyName) {
      toast.error(dict.dashboard.passkeys.nameRequired);
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    setIsLoading(false);
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      toast.success(dict.dashboard.passkeys.addedSuccess);
    }
  }, [passkeyName, dict]);

  const handleDeletePasskey = useCallback(
    async (passkeyId: string) => {
      setDeletingPasskeyId(passkeyId);
      await authClient.passkey.deletePasskey({
        fetchOptions: {
          onError: (error: { error: { message: string } }) => {
            toast.error(error.error.message);
            setDeletingPasskeyId(null);
          },
          onSuccess: () => {
            toast(dict.dashboard.passkeys.deletedSuccess);
            setDeletingPasskeyId(null);
          },
        },
        id: passkeyId,
      });
    },
    [dict]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasskeyName(e.target.value);
    },
    []
  );

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs md:text-sm">
          <Fingerprint className="mr-2 h-4 w-4" />
          <span>
            {dict.dashboard.passkeys.title}{" "}
            {data?.length ? `[${data?.length}]` : ""}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict.dashboard.passkeys.listTitle}</DialogTitle>
          <DialogDescription>
            {dict.dashboard.passkeys.listDescription}
          </DialogDescription>
        </DialogHeader>
        {data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dict.common.name}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((passkey: PasskeyRowProps["passkey"]) => (
                <PasskeyRow
                  key={passkey.id}
                  passkey={passkey}
                  isDeleting={deletingPasskeyId === passkey.id}
                  onDelete={handleDeletePasskey}
                  dict={dict}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-sm">
            {dict.dashboard.passkeys.noPasskeys}
          </p>
        )}
        {!data?.length && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="passkey-name" className="text-sm">
                {dict.dashboard.passkeys.newPasskey}
              </Label>
              <Input
                id="passkey-name"
                value={passkeyName}
                onChange={handleNameChange}
                placeholder={dict.dashboard.passkeys.defaultName}
              />
            </div>
            <Button type="submit" onClick={handleAddPasskey} className="w-full">
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {dict.dashboard.passkeys.createButton}
                </>
              )}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleClose}>{dict.common.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
