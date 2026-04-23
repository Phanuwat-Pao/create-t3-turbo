"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import type { Organization } from "better-auth/plugins";
import { useCallback } from "react";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import type { Dictionary } from "~/i18n/get-dictionary";
import { getOrgLogoUrl } from "~/lib/avatar";

interface SelectOrganizationBtnProps {
  organization: Partial<Organization>;
  dict: Dictionary;
}

export function SelectOrganizationBtn({
  organization,
  dict,
}: SelectOrganizationBtnProps) {
  const handleClick = useCallback(async () => {
    try {
      if (!organization.id) {
        toast.error(dict.oauth.selectOrganization.noOrganization);
        return;
      }
      const { data: active, error: activeError } =
        await authClient.organization.setActive({
          organizationId: organization.id,
        });
      if (activeError || !active) {
        toast.error(
          activeError?.message ??
            dict.oauth.selectOrganization.failedToSetActive
        );
        return;
      }
      const { data, error } = await authClient.oauth2.continue({
        postLogin: true,
      });
      if (error || !data?.redirect || !data.url) {
        toast.error(
          error?.message ?? dict.oauth.selectOrganization.failedToContinue
        );
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(String(error));
    }
  }, [
    dict.oauth.selectOrganization.failedToContinue,
    dict.oauth.selectOrganization.failedToSetActive,
    dict.oauth.selectOrganization.noOrganization,
    organization.id,
  ]);

  return (
    <Button
      className="h-12 w-full gap-2"
      variant="outline"
      onClick={handleClick}
    >
      <Avatar className="mr-2 h-5 w-5">
        <AvatarImage
          src={organization.id ? getOrgLogoUrl(organization.id) : undefined}
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
