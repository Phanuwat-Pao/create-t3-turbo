import { Heading, Text } from "react-email";

import type { Locale } from "~/i18n/i18n-config";

import { BaseEmail, DEFAULT_BRAND_NAME, styles } from "./components/base-email";
import type { EmailT } from "./i18n";

interface VerifyOTPProps {
  locale: Locale;
  t: EmailT;
  code: string;
  brandName?: string;
  brandLogoUrl?: string;
}

/** The one-time code for two-factor sign-in. */
export default function VerifyOTP({
  locale,
  t,
  code,
  brandName = DEFAULT_BRAND_NAME,
  brandLogoUrl,
}: VerifyOTPProps) {
  return (
    <BaseEmail
      lang={locale}
      previewText={t("email.twoFactor.preview")}
      footerText={t("email.footer", { brand: brandName })}
      brandName={brandName}
      brandLogoUrl={brandLogoUrl}
      brandLogoAlt={t("email.logoAlt", { brand: brandName })}
    >
      <Heading style={styles.h1}>{t("email.twoFactor.heading")}</Heading>
      <Text style={styles.text}>{t("email.twoFactor.body")}</Text>
      <code style={styles.code}>{code}</code>
      <Text
        style={{
          ...styles.text,
          color: "#ababab",
          marginBottom: "16px",
          marginTop: "14px",
        }}
      >
        {t("email.twoFactor.footer")}
      </Text>
    </BaseEmail>
  );
}
