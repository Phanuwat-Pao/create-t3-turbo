"use client";

import type { Organization } from "better-auth/plugins";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { authClient } from "~/auth/client";

export function SelectOrganizationBtn({
  organization,
}: {
  organization: Partial<Organization>;
}) {
  const handleClick = useCallback(async () => {
    try {
      if (!organization.id) {
        toast.error("No organization");
        return;
      }
      const { data: active, error: activeError } =
        await authClient.organization.setActive({
          organizationId: organization.id,
        });
      if (activeError || !active) {
        toast.error(
          activeError?.message ?? "Failed to set active organization"
        );
        return;
      }
      const { data, error } = await authClient.oauth2.continue({
        postLogin: true,
      });
      if (error || !data?.redirect || !data.uri) {
        toast.error(error?.message ?? "Failed to continue");
        return;
      }
      window.location.href = data.uri;
    } catch (error) {
      toast.error(String(error));
    }
  }, [organization.id]);

  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleClick}
    >
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={organization.logo || undefined}
          alt={organization?.name}
        />
        <AvatarFallback>{organization?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex w-full text-start">
        <div>
          <p>{organization?.name}</p>
        </div>
      </div>
    </Button>
  );
}

export function GoBackBtn() {
  const router = useRouter();
  const handleGoBack = useCallback(() => router.back(), [router]);
  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleGoBack}
    >
      Go Back
    </Button>
  );
}
