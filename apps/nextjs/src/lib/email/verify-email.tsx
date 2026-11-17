import { Heading, Link, Text } from "react-email";

import type { Locale } from "~/i18n/i18n-config";

import { BaseEmail, DEFAULT_BRAND_NAME, styles } from "./components/base-email";
import type { EmailT } from "./i18n";

interface VerifyEmailProps {
  locale: Locale;
  t: EmailT;
  url: string;
  brandName?: string;
  brandLogoUrl?: string;
}

export default function VerifyEmail({
  locale,
  t,
  url,
  brandName = DEFAULT_BRAND_NAME,
  brandLogoUrl,
}: VerifyEmailProps) {
  return (
    <BaseEmail
      lang={locale}
      previewText={t("email.verifyEmail.preview")}
      footerText={t("email.footer", { brand: brandName })}
      brandName={brandName}
      brandLogoUrl={brandLogoUrl}
      brandLogoAlt={t("email.logoAlt", { brand: brandName })}
    >
      <Heading style={styles.h1}>{t("email.verifyEmail.heading")}</Heading>
      <Link
        href={url}
        target="_blank"
        style={{
          ...styles.link,
          display: "block",
          marginBottom: "16px",
        }}
      >
        {t("email.verifyEmail.link")}
      </Link>
      <Text
        style={{
          ...styles.text,
          color: "#ababab",
          marginBottom: "16px",
          marginTop: "14px",
        }}
      >
        {t("email.verifyEmail.footer")}
      </Text>
    </BaseEmail>
  );
}
