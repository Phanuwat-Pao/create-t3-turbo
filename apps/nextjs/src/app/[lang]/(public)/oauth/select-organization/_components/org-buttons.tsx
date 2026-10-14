"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import type { Organization } from "better-auth/plugins";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { authClient } from "~/auth/client";
import { getOrgLogoUrl } from "~/lib/avatar";

interface SelectOrganizationBtnProps {
  organization: Partial<Organization>;
}

export function SelectOrganizationBtn({
  organization,
}: SelectOrganizationBtnProps) {
  const { t } = useTranslation();
  const handleClick = useCallback(async () => {
    try {
      if (!organization.id) {
        toast.error(t("oauth.selectOrganization.noOrganization"));
        return;
      }
      const { data: active, error: activeError } =
        await authClient.organization.setActive({
          organizationId: organization.id,
        });
      if (activeError || !active) {
        toast.error(
          activeError?.message ??
            t("oauth.selectOrganization.failedToSetActive")
        );
        return;
      }
      const { data, error } = await authClient.oauth2.continue({
        postLogin: true,
      });
      if (error || !data?.redirect || !data.url) {
        toast.error(
          error?.message ?? t("oauth.selectOrganization.failedToContinue")
        );
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      toast.error(String(error));
    }
  }, [organization.id, t]);

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
