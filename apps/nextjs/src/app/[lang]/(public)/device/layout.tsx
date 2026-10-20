import { headers } from "next/headers";

import { auth } from "~/auth/server";
import { localizedRedirect } from "~/i18n/server";

export default async function DevicePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session === null) {
    return localizedRedirect("/sign-in?callbackUrl=/device");
  }
  return children;
}
