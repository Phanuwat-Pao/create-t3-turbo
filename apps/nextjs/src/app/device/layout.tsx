import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "~/auth/client";

export default async function DevicePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });
  if (session === null) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect("/sign-in?callbackUrl=/device");
  }
  return children;
}
