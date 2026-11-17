import { Skeleton } from "@acme/ui/skeleton";

import { getT } from "~/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div
      className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center"
      aria-busy="true"
      aria-label={t("auth.resetPassword.loadingForm")}
    >
      <Skeleton className="h-50 w-87.5" />
    </div>
  );
}
