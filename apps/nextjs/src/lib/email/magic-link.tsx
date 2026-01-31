import { Heading, Link, Text } from "@react-email/components";

import { BaseEmail, styles } from "./components/base-email";

interface BetterAuthMagicLinkEmailProps {
  url: string;
  brandName?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
}

export default function MagicLinkEmail({
  url,
  brandName,
  brandTagline,
  brandLogoUrl,
}: BetterAuthMagicLinkEmailProps) {
  return (
    <BaseEmail
      previewText="Sign in with this magic link"
      brandName={brandName}
      brandTagline={brandTagline}
      brandLogoUrl={brandLogoUrl}
    >
      <Heading style={styles.h1}>Sign in</Heading>
      <Link
        href={url}
        target="_blank"
        style={{
          ...styles.link,
          display: "block",
          marginBottom: "16px",
        }}
      >
        Click here to sign in with this magic link
      </Link>
      <Text
        style={{
          ...styles.text,
          color: "#ababab",
          marginBottom: "16px",
          marginTop: "14px",
        }}
      >
        If you didn&apos;t try to sign in, you can safely ignore this email.
      </Text>
    </BaseEmail>
  );
}

export function reactMagicLinkEmail(props: BetterAuthMagicLinkEmailProps) {
  return <MagicLinkEmail {...props} />;
}
