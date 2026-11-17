import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { TransWithoutContext } from "react-i18next";

import type { Locale } from "~/i18n/i18n-config";

import { type EmailT, emailI18n } from "./i18n";

interface BetterAuthResetPasswordEmailProps {
  locale: Locale;
  t: EmailT;
  username?: string;
  url?: string;
}

export const ResetPasswordEmail = ({
  locale,
  t,
  username,
  url,
}: BetterAuthResetPasswordEmailProps) => (
  <Html lang={locale}>
    <Head />
    <Preview>{t("email.resetPassword.preview")}</Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white px-2 font-sans" lang={locale}>
        <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
          <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
            <TransWithoutContext
              components={{ strong: <strong /> }}
              i18n={emailI18n}
              i18nKey="email.resetPassword.heading"
              t={t}
            />
          </Heading>
          <Text className="text-[14px] leading-[24px] text-black">
            {t("email.resetPassword.greeting", { name: username ?? "" })}
          </Text>
          <Text className="text-[14px] leading-[24px] text-black">
            {t("email.resetPassword.body")}
          </Text>
          <Section className="mt-[32px] mb-[32px] text-center">
            <Button
              className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              href={url}
            >
              {t("email.resetPassword.button")}
            </Button>
          </Section>
          <Text className="text-[14px] leading-[24px] text-black">
            {t("email.copyUrl")}{" "}
            <Link href={url} className="text-blue-600 no-underline">
              {url}
            </Link>
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text className="text-[12px] leading-[24px] text-[#666666]">
            {t("email.resetPassword.footer")}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
