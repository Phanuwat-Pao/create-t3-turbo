"use client";

import type { OrganizationRole, Session } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import CopyButton from "@acme/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { Label } from "@acme/ui/label";
import { Skeleton } from "@acme/ui/skeleton";
import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MailPlus } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { CreateOrganizationForm } from "~/components/forms/create-organization-form";
import { InviteMemberForm } from "~/components/forms/invite-member-form";
import { useInvitationCancelMutation } from "~/data/organization/invitation-cancel-mutation";
import { useMemberRemoveMutation } from "~/data/organization/member-remove-mutation";
import { useOrganizationActiveMutation } from "~/data/organization/organization-active-mutation";
import { useOrganizationDetailQuery } from "~/data/organization/organization-detail-query";
import { useOrganizationListQuery } from "~/data/organization/organization-list-query";
import { useSessionQuery } from "~/data/user/session-query";
import { getAvatarUrl, getOrgLogoUrl } from "~/lib/avatar";

const ORGANIZATION_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
  OWNER: "owner",
} as const satisfies Record<string, OrganizationRole>;

interface OrganizationDropdownItemProps {
  orgId: string;
  orgName: string;
  activeOrganizationId: string | undefined;
  onSelect: (orgId: string) => void;
}

const OrganizationDropdownItem = memo(
  ({
    orgId,
    orgName,
    activeOrganizationId,
    onSelect,
  }: OrganizationDropdownItemProps) => {
    const handleClick = useCallback(() => {
      if (orgId === activeOrganizationId) {
        return;
      }
      onSelect(orgId);
    }, [orgId, activeOrganizationId, onSelect]);

    return (
      <DropdownMenuItem className="py-1" onClick={handleClick}>
        <p className="sm text-sm">{orgName}</p>
      </DropdownMenuItem>
    );
  }
);
OrganizationDropdownItem.displayName = "OrganizationDropdownItem";

interface MemberItemProps {
  member: {
    id: string;
    role: OrganizationRole;
    user: { id: string; name: string | null; image?: string | null };
  };
  currentMember: { id: string; role: OrganizationRole } | undefined;
  isRemoving: boolean;
  onRemove: (memberId: string) => void;
}

const MemberItem = memo(
  ({ member, currentMember, isRemoving, onRemove }: MemberItemProps) => {
    const { t } = useTranslation();
    const handleRemove = useCallback(() => {
      onRemove(member.id);
    }, [member.id, onRemove]);

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 sm:flex">
            <AvatarImage
              src={getAvatarUrl(member.user.id)}
              className="object-cover"
            />
            <AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">{member.user.name}</p>
            <p className="text-muted-foreground text-xs">{member.role}</p>
          </div>
        </div>
        {member.role !== ORGANIZATION_ROLES.OWNER &&
          (currentMember?.role === ORGANIZATION_ROLES.OWNER ||
            currentMember?.role === ORGANIZATION_ROLES.ADMIN) && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isRemoving}
              onClick={handleRemove}
            >
              {isRemoving && <Loader2 className="animate-spin" size={16} />}
              {!isRemoving &&
                currentMember?.id === member.id &&
                t("organization.leave")}
              {!isRemoving &&
                currentMember?.id !== member.id &&
                t("organization.remove")}
            </Button>
          )}
      </div>
    );
  }
);
MemberItem.displayName = "MemberItem";

interface InvitationItemProps {
  invitation: { id: string; email: string; role: OrganizationRole };
  isCanceling: boolean;
  onCancel: (invitationId: string) => void;
}

const InvitationItem = memo(
  ({ invitation, isCanceling, onCancel }: InvitationItemProps) => {
    const { t } = useTranslation();
    const handleCancel = useCallback(() => {
      onCancel(invitation.id);
    }, [invitation.id, onCancel]);

    return (
      <motion.div
        className="flex items-center justify-between"
        variants={{
          exit: { height: 0, opacity: 0 },
          hidden: { height: 0, opacity: 0 },
          visible: { height: "auto", opacity: 1 },
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        <div>
          <p className="text-sm">{invitation.email}</p>
          <p className="text-muted-foreground text-xs">{invitation.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={isCanceling}
            size="sm"
            variant="destructive"
            onClick={handleCancel}
          >
            {isCanceling ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              t("organization.revoke")
            )}
          </Button>
          <div>
            <CopyButton
              textToCopy={`${window.location.origin}/accept-invitation/${invitation.id}`}
            />
          </div>
        </div>
      </motion.div>
    );
  }
);
InvitationItem.displayName = "InvitationItem";

function OrganizationCardSkeleton() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("organization.title")}</CardTitle>
        <div className="mt-2 flex justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-none" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex grow flex-col gap-2">
            <p className="border-b-foreground/10 border-b-2 font-medium">
              {t("organization.members")}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex grow flex-col gap-2">
            <p className="border-b-foreground/10 border-b-2 font-medium">
              {t("organization.invites")}
            </p>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateOrganizationDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full gap-2" variant="default">
          <PlusIcon />
          <p>{t("organization.newOrganization")}</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("organization.newOrganization")}</DialogTitle>
          <DialogDescription>
            {t("organization.newOrganizationDescription")}
          </DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

function InviteMemberDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSuccess = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full gap-2" variant="outline">
          <MailPlus size={16} />
          <p>{t("organization.inviteMember")}</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-11/12 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("organization.inviteMember")}</DialogTitle>
          <DialogDescription>
            {t("organization.inviteMemberDescription")}
          </DialogDescription>
        </DialogHeader>
        <InviteMemberForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

const OrganizationCard = (props: { session: Session | null }) => {
  const { t } = useTranslation();
  const { data: sessionData } = useSessionQuery();
  const { data: organizations } = useOrganizationListQuery();
  const { data: activeOrganization, isFetching: isOrganizationFetching } =
    useOrganizationDetailQuery();
  const setActiveMutation = useOrganizationActiveMutation();
  const cancelInvitationMutation = useInvitationCancelMutation();
  const removeMemberMutation = useMemberRemoveMutation();

  const session = sessionData || props.session;
  const currentMember = activeOrganization?.members?.find(
    (member: { userId: string }) => member.userId === session?.user.id
  );

  const handleSelectPersonal = useCallback(() => {
    setActiveMutation.mutate({ organizationId: null });
  }, [setActiveMutation]);

  const handleSelectOrganization = useCallback(
    (orgId: string) => {
      setActiveMutation.mutate({ organizationId: orgId });
    },
    [setActiveMutation]
  );

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      removeMemberMutation.mutate({ memberIdOrEmail: memberId });
    },
    [removeMemberMutation]
  );

  const handleCancelInvitation = useCallback(
    (invitationId: string) => {
      cancelInvitationMutation.mutate({ invitationId });
    },
    [cancelInvitationMutation]
  );

  if (isOrganizationFetching) {
    return <OrganizationCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("organization.title")}</CardTitle>
        <div className="flex justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-1">
                <p className="text-sm">
                  <span className="font-bold" />{" "}
                  {activeOrganization?.name || t("organization.personal")}
                </p>

                <ChevronDownIcon />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="py-1" onClick={handleSelectPersonal}>
                <p className="sm text-sm">{t("organization.personal")}</p>
              </DropdownMenuItem>
              {organizations?.map((org: { id: string; name: string }) => (
                <OrganizationDropdownItem
                  key={org.id}
                  orgId={org.id}
                  orgName={org.name}
                  activeOrganizationId={activeOrganization?.id}
                  onSelect={handleSelectOrganization}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div>
            <CreateOrganizationDialog />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="rounded-none">
            <AvatarImage
              className="h-full w-full rounded-none object-cover"
              src={
                activeOrganization?.id
                  ? getOrgLogoUrl(activeOrganization.id)
                  : undefined
              }
            />
            <AvatarFallback className="rounded-none">
              {activeOrganization?.name?.charAt(0) || "P"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p>{activeOrganization?.name || t("organization.personal")}</p>
            <p className="text-muted-foreground text-xs">
              {activeOrganization?.members?.length || 1}{" "}
              {t("organization.membersCount")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="flex grow flex-col gap-2">
            <p className="border-b-foreground/10 border-b-2 font-medium">
              {t("organization.members")}
            </p>
            <div className="flex flex-col gap-2">
              {activeOrganization?.members?.map(
                (member: MemberItemProps["member"]) => (
                  <MemberItem
                    key={member.id}
                    member={member}
                    currentMember={currentMember}
                    isRemoving={
                      removeMemberMutation.isPending &&
                      removeMemberMutation.variables?.memberIdOrEmail ===
                        member.id
                    }
                    onRemove={handleRemoveMember}
                  />
                )
              )}
              {!activeOrganization?.id && (
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={
                          session?.user.id
                            ? getAvatarUrl(session.user.id)
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {session?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">{session?.user.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {t("organization.owner")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex grow flex-col gap-2">
            <p className="border-b-foreground/10 border-b-2 font-medium">
              {t("organization.invites")}
            </p>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {activeOrganization?.invitations
                  ?.filter(
                    (invitation: { status: string }) =>
                      invitation.status === "pending"
                  )
                  .map((invitation: InvitationItemProps["invitation"]) => (
                    <InvitationItem
                      key={invitation.id}
                      invitation={invitation}
                      isCanceling={
                        cancelInvitationMutation.isPending &&
                        cancelInvitationMutation.variables?.invitationId ===
                          invitation.id
                      }
                      onCancel={handleCancelInvitation}
                    />
                  ))}
              </AnimatePresence>
              {activeOrganization?.invitations?.filter(
                (invitation: { status: string }) =>
                  invitation.status === "pending"
              ).length === 0 && (
                <motion.p
                  className="text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t("organization.noActiveInvitations")}
                </motion.p>
              )}
              {!activeOrganization?.id && (
                <Label className="text-muted-foreground text-xs">
                  {t("organization.cantInvitePersonal")}
                </Label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full justify-end">
          <div>
            <div>{activeOrganization?.id && <InviteMemberDialog />}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default OrganizationCard;
