import type { Session } from "@acme/auth";

import { Button } from "@acme/ui/button";
import Link from "next/link";

import type { Dictionary } from "~/i18n/get-dictionary";

interface Props {
  session: Session | null;
  dict: Dictionary;
}

const EntryButton = ({ session, dict }: Props) => {
  const hasSession = !!session?.session;

  return hasSession ? (
    <DashboardButton dict={dict} />
  ) : (
    <SignInButton dict={dict} />
  );
};

export default EntryButton;

const SignInButton = ({ dict }: { dict: Dictionary }) => (
  <Button className="gap-2" variant="default" asChild>
    <Link href="/sign-in">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.2em"
        height="1.2em"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M5 3H3v4h2V5h14v14H5v-2H3v4h18V3zm12 8h-2V9h-2V7h-2v2h2v2H3v2h10v2h-2v2h2v-2h2v-2h2z"
        />
      </svg>
      <span>{dict.entryButton.signIn}</span>
    </Link>
  </Button>
);

const DashboardButton = ({ dict }: { dict: Dictionary }) => (
  <Button className="gap-2" variant="default" asChild>
    <Link href="/dashboard">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.2em"
        height="1.2em"
        viewBox="0 0 24 24"
      >
        <path fill="currentColor" d="M2 3h20v18H2zm18 16V7H4v12z" />
      </svg>
      <span>{dict.entryButton.dashboard}</span>
    </Link>
  </Button>
);
