import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/auth/server";

export default async function DevicePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session === null) {
    throw redirect("/sign-in?callbackUrl=/device");
  }
  return children;
}
