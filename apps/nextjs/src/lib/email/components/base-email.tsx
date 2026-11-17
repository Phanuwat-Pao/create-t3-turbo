import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "react-email";

export const DEFAULT_BRAND_NAME = "Better Auth";

export interface BaseEmailProps {
  children: React.ReactNode;
  /** The email's language, for the `lang` attribute. */
  lang: string;
  previewText: string;
  footerText: string;
  footerLinks?: { text: string; href: string }[];
  brandName?: string;
  brandLogoUrl?: string;
  brandLogoAlt?: string;
}

export const styles = {
  code: {
    backgroundColor: "#f4f4f4",
    border: "1px solid #eee",
    borderRadius: "5px",
    color: "#333",
    display: "inline-block",
    padding: "16px 4.5%",
    width: "90.5%",
  },
  container: {
    margin: "0 auto",
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  footer: {
    color: "#898989",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "12px",
    lineHeight: "22px",
    marginBottom: "24px",
    marginTop: "12px",
  },
  h1: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0",
  },
  link: {
    color: "#2754C5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    textDecoration: "underline",
  },
  main: {
    backgroundColor: "#ffffff",
  },
  text: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    margin: "24px 0",
  },
};

const EMPTY_FOOTER_LINKS: NonNullable<BaseEmailProps["footerLinks"]> = [];

export function BaseEmail({
  children,
  lang,
  previewText,
  footerText,
  footerLinks = EMPTY_FOOTER_LINKS,
  brandName = DEFAULT_BRAND_NAME,
  brandLogoUrl,
  brandLogoAlt = brandName,
}: BaseEmailProps) {
  return (
    <Html lang={lang}>
      <Head />
      <Body lang={lang} style={styles.main}>
        <Preview>{previewText}</Preview>
        <Container style={styles.container}>
          {children}

          {brandLogoUrl && (
            <Img src={brandLogoUrl} width="32" height="32" alt={brandLogoAlt} />
          )}

          <Text style={styles.footer}>
            {footerLinks.map((link, i) => (
              <React.Fragment key={link.href}>
                <Link
                  href={link.href}
                  target="_blank"
                  style={{ ...styles.link, color: "#898989" }}
                >
                  {link.text}
                </Link>
                {i < footerLinks.length - 1 && " • "}
              </React.Fragment>
            ))}
            {footerLinks.length > 0 && <br />}
            {footerText}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
