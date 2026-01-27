import { Button } from "@acme/ui/button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";

async function signInWithDiscord() {
  "use server";
  const res = await auth.api.signInSocial({
    body: {
      callbackURL: "/",
      provider: "discord",
    },
  });
  if (!res.url) {
    throw new Error("No URL returned from signInSocial");
  }
  redirect(res.url);
}

async function signOut() {
  "use server";
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}

export async function AuthShowcase() {
  const session = await getSession();

  if (!session) {
    return (
      <form action={signInWithDiscord}>
        <Button size="lg" type="submit">
          Sign in with Discord
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {session.user.name}</span>
      </p>

      <form action={signOut}>
        <Button size="lg" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
