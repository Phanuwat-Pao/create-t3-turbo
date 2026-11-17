import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";
import { TransWithoutContext } from "react-i18next";

import type { Locale } from "~/i18n/i18n-config";

import { type EmailT, emailI18n } from "./i18n";

interface BetterAuthInviteUserEmailProps {
  locale: Locale;
  t: EmailT;
  /** Who the invitation was sent to: their email address. */
  username?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  inviteLink?: string;
}

export const InviteUserEmail = ({
  locale,
  t,
  username,
  invitedByUsername,
  invitedByEmail,
  teamName,
  teamImage,
  inviteLink,
}: BetterAuthInviteUserEmailProps) => (
  <Html lang={locale}>
    <Head />
    <Preview>
      {t("email.invitation.preview", { inviter: invitedByUsername ?? "" })}
    </Preview>
    <Tailwind>
      <Body className="mx-auto my-auto bg-white px-2 font-sans" lang={locale}>
        <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
          <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
            <TransWithoutContext
              components={{ strong: <strong /> }}
              i18n={emailI18n}
              i18nKey="email.invitation.heading"
              t={t}
              values={{ inviter: invitedByUsername ?? "" }}
            />
          </Heading>
          <Text className="text-[14px] leading-[24px] text-black">
            {t("email.invitation.greeting")}
          </Text>
          <Text className="text-[14px] leading-[24px] text-black">
            <TransWithoutContext
              components={{
                email: (
                  <Link
                    href={`mailto:${invitedByEmail}`}
                    className="text-blue-600 no-underline"
                  />
                ),
                strong: <strong />,
              }}
              i18n={emailI18n}
              i18nKey="email.invitation.body"
              t={t}
              values={{
                email: invitedByEmail ?? "",
                inviter: invitedByUsername ?? "",
                organization: teamName ?? "",
              }}
            />
          </Text>
          <Section>
            {teamImage ? (
              <Row>
                <Column align="left">
                  <Img
                    className="rounded-full"
                    src={teamImage}
                    width="64"
                    height="64"
                    fetchPriority="high"
                  />
                </Column>
              </Row>
            ) : null}
          </Section>
          <Section className="mt-[32px] mb-[32px] text-center">
            <Button
              className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
              href={inviteLink}
            >
              {t("email.invitation.button")}
            </Button>
          </Section>
          <Text className="text-[14px] leading-[24px] text-black">
            {t("email.copyUrl")}{" "}
            <Link href={inviteLink} className="text-blue-600 no-underline">
              {inviteLink}
            </Link>
          </Text>
          <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
          <Text className="text-[12px] leading-[24px] text-[#666666]">
            <TransWithoutContext
              components={{ recipient: <span className="text-black" /> }}
              i18n={emailI18n}
              i18nKey="email.invitation.footer"
              t={t}
              values={{ recipient: username ?? "" }}
            />
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
