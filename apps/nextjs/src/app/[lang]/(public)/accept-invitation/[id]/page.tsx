"use client";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { CheckIcon, XIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useInviteAcceptMutation } from "~/data/organization/invitation-accept-mutation";
import { useInvitationQuery } from "~/data/organization/invitation-query";
import { useInviteRejectMutation } from "~/data/organization/invitation-reject-mutation";

import { InvitationError } from "./_components/invitation-error";
import { InvitationSkeleton } from "./_components/invitation-skeleton";

export default function Page() {
  const params = useParams<{
    id: string;
  }>();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: invitation, isLoading, error } = useInvitationQuery(params.id);
  const acceptMutation = useInviteAcceptMutation();
  const rejectMutation = useInviteRejectMutation();

  const handleAccept = useCallback(() => {
    acceptMutation.mutate(
      { invitationId: params.id },
      {
        onSuccess: () => {
          setIsRedirecting(true);
          router.push("/dashboard");
        },
      }
    );
  }, [acceptMutation, params.id, router]);

  const handleReject = useCallback(() => {
    rejectMutation.mutate(
      { invitationId: params.id },
      {
        onSuccess: () => {
          setIsRedirecting(true);
          router.push("/dashboard");
        },
      }
    );
  }, [rejectMutation, params.id, router]);

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
        <InvitationSkeleton />
      </div>
    );
  }

  if (!invitation || error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
        <InvitationError />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      {invitation && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitation.status === "accepted" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-center text-2xl font-bold">
                  Welcome to {invitation.organizationName}!
                </h2>
                <p className="text-center">
                  You&apos;ve successfully joined the organization. We&apos;re
                  excited to have you on board!
                </p>
              </div>
            )}
            {invitation.status === "rejected" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <XIcon className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-center text-2xl font-bold">
                  Invitation Declined
                </h2>
                <p className="text-center">
                  You&apos;ve declined the invitation to join{" "}
                  {invitation.organizationName}.
                </p>
              </div>
            )}
            {invitation.status === "pending" && (
              <div className="space-y-4">
                <p>
                  <strong>{invitation.inviterEmail}</strong> has invited you to
                  join <strong>{invitation.organizationName}</strong>.
                </p>
                <p>
                  This invitation was sent to{" "}
                  <strong>{invitation.email}</strong>.
                </p>
              </div>
            )}
          </CardContent>
          {invitation.status === "pending" && (
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Declining..." : "Decline"}
              </Button>
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending
                  ? "Accepting..."
                  : "Accept Invitation"}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
