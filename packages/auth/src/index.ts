import type { BetterAuthOptions, User } from "better-auth";
import type {
  Invitation as BetterAuthInvitation,
  Member as BetterAuthMember,
  Organization as BetterAuthOrganization,
  UserWithTwoFactor,
} from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  bearer,
  customSession,
  deviceAuthorization,
  haveIBeenPwned,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  oneTap,
  openAPI,
  organization,
  twoFactor,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";

import { db } from "@acme/db/client";

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  /**
   * send reset password
   */
  sendResetPassword?: (
    /**
     * @param user the user to send the
     * reset password email to
     * @param url the URL to send the reset password email to
     * @param token the token to send to the user (could be used instead of sending the url
     * if you need to redirect the user to custom route)
     */
    data: {
      user: User;
      url: string;
      token: string;
    },
    /**
     * The request object
     */
    request?: Request,
  ) => Promise<void>;
  /**
   * Send a verification email
   * @param data the data object
   * @param request the request object
   */
  sendVerificationEmail?: (
    /**
     * @param user the user to send the
     * verification email to
     * @param url the URL to send the verification email to
     * it contains the token as well
     * @param token the token to send the verification email to
     */
    data: {
      user: User;
      url: string;
      token: string;
    },
    /**
     * The request object
     */
    request?: Request,
  ) => Promise<void>;
  /**
   * Send an email with the
   * invitation link to the user.
   *
   * Note: Better Auth doesn't
   * generate invitation URLs.
   * You'll need to construct the
   * URL using the invitation ID
   * and pass it to the
   * acceptInvitation endpoint for
   * the user to accept the
   * invitation.
   *
   * @example
   * ```ts
   * sendInvitationEmail: async (data) => {
   * 	const url = `https://yourapp.com/organization/
   * accept-invitation?id=${data.id}`;
   * 	await sendEmail(data.email, "Invitation to join
   * organization", `Click the link to join the
   * organization: ${url}`);
   * }
   * ```
   */
  sendInvitationEmail?: (
    data: {
      /**
       * the invitation id
       */
      id: string;
      /**
       * the role of the user
       */
      role: string;
      /**
       * the email of the user
       */
      email: string;
      /**
       * the organization the user is invited to join
       */
      organization: BetterAuthOrganization;
      /**
       * the invitation object
       */
      invitation: BetterAuthInvitation;
      /**
       * the member who is inviting the user
       */
      inviter: BetterAuthMember & {
        user: User;
      };
    },
    /**
     * The request object
     */
    request?: Request,
  ) => Promise<void>;
  /**
   * Send the otp to the user
   *
   * @param user - The user to send the otp to
   * @param otp - The otp to send
   * @param request - The request object
   * @returns void | Promise<void>
   */
  sendOTP?: (
    /**
     * The user to send the otp to
     * @type UserWithTwoFactor
     * @default UserWithTwoFactors
     */
    data: {
      user: UserWithTwoFactor;
      otp: string;
    },
    /**
     * The request object
     */
    request?: Request,
  ) => Promise<void> | void;
  admins: string[];

  // discordClientId: string;
  // discordClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
      haveIBeenPwned(),

      organization({
        sendInvitationEmail: options.sendInvitationEmail,
      }),
      twoFactor({
        otpOptions: {
          sendOTP: options.sendOTP,
        },
      }),
      passkey(),
      openAPI(),
      bearer(),
      admin({
        adminUserIds: options.admins,
      }),
      multiSession(),
      // oAuthProxy(),
      nextCookies(),
      oneTap(),
      customSession(async (session) => {
        //FIXME: remove this once we have a proper session management
        await Promise.resolve(session);
        return {
          ...session,
          user: {
            ...session.user,
            dd: "test",
          },
        };
      }),
      // stripe({
      //   stripeClient: new Stripe(process.env.STRIPE_KEY || "sk_test_"),
      //   stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      //   subscription: {
      //     enabled: true,
      //     allowReTrialsForDifferentPlans: true,
      //     plans: () => {
      //       const PRO_PRICE_ID = {
      //         default:
      //           process.env.STRIPE_PRO_PRICE_ID ??
      //           "price_1RoxnRHmTADgihIt4y8c0lVE",
      //         annual:
      //           process.env.STRIPE_PRO_ANNUAL_PRICE_ID ??
      //           "price_1RoxnoHmTADgihItzFvVP8KT",
      //       };
      //       const PLUS_PRICE_ID = {
      //         default:
      //           process.env.STRIPE_PLUS_PRICE_ID ??
      //           "price_1RoxnJHmTADgihIthZTLmrPn",
      //         annual:
      //           process.env.STRIPE_PLUS_ANNUAL_PRICE_ID ??
      //           "price_1Roxo5HmTADgihItEbJu5llL",
      //       };

      //       return [
      //         {
      //           name: "Plus",
      //           priceId: PLUS_PRICE_ID.default,
      //           annualDiscountPriceId: PLUS_PRICE_ID.annual,
      //           freeTrial: {
      //             days: 7,
      //           },
      //         },
      //         {
      //           name: "Pro",
      //           priceId: PRO_PRICE_ID.default,
      //           annualDiscountPriceId: PRO_PRICE_ID.annual,
      //           freeTrial: {
      //             days: 7,
      //           },
      //         },
      //       ];
      //     },
      //   },
      // }),
      //   sso({
      //     defaultSSO: [
      //       {
      //         domain: "http://localhost:3000",
      //         providerId: "sso",
      //         samlConfig: {
      //           issuer: "http://localhost:3000/api/auth/sso/saml2/sp/metadata",
      //           entryPoint:
      //             "https://dummyidp.com/apps/app_01k16v4vb5yytywqjjvv2b3435",
      //           cert: `-----BEGIN CERTIFICATE-----
      // MIIDBzCCAe+gAwIBAgIUCLBK4f75EXEe4gyroYnVaqLoSp4wDQYJKoZIhvcNAQEL
      // BQAwEzERMA8GA1UEAwwIZHVtbXlpZHAwHhcNMjQwNTEzMjE1NDE2WhcNMzQwNTEx
      // MjE1NDE2WjATMREwDwYDVQQDDAhkdW1teWlkcDCCASIwDQYJKoZIhvcNAQEBBQAD
      // ggEPADCCAQoCggEBAKhmgQmWb8NvGhz952XY4SlJlpWIK72RilhOZS9frDYhqWVJ
      // HsGH9Z7sSzrM/0+YvCyEWuZV9gpMeIaHZxEPDqW3RJ7KG51fn/s/qFvwctf+CZDj
      // yfGDzYs+XIgf7p56U48EmYeWpB/aUW64gSbnPqrtWmVFBisOfIx5aY3NubtTsn+g
      // 0XbdX0L57+NgSvPQHXh/GPXA7xCIWm54G5kqjozxbKEFA0DS3yb6oHRQWHqIAM/7
      // mJMdUVZNIV1q7c2JIgAl23uDWq+2KTE2R5liP/KjvjwKonVKtTqGqX6ei25rsTHO
      // aDpBH/LdQK2txgsm7R7+IThWNvUI0TttrmwBqyMCAwEAAaNTMFEwHQYDVR0OBBYE
      // FD142gxIAJMhpgMkgpzmRNoW9XbEMB8GA1UdIwQYMBaAFD142gxIAJMhpgMkgpzm
      // RNoW9XbEMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBADQd6k6z
      // FIc20GfGHY5C2MFwyGOmP5/UG/JiTq7Zky28G6D0NA0je+GztzXx7VYDfCfHxLcm
      // 2k5t9nYhb9kVawiLUUDVF6s+yZUXA4gUA3KoTWh1/oRxR3ggW7dKYm9fsNOdQAbx
      // UUkzp7HLZ45ZlpKUS0hO7es+fPyF5KVw0g0SrtQWwWucnQMAQE9m+B0aOf+92y7J
      // QkdgdR8Gd/XZ4NZfoOnKV7A1utT4rWxYCgICeRTHx9tly5OhPW4hQr5qOpngcsJ9
      // vhr86IjznQXhfj3hql5lA3VbHW04ro37ROIkh2bShDq5dwJJHpYCGrF3MQv8S3m+
      // jzGhYL6m9gFTm/8=
      // -----END CERTIFICATE-----`,
      //           spMetadata: {
      //             metadata: `
      // 		  <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="http://localhost:3000/api/auth/sso/saml2/sp/metadata">
      //   <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
      // 	  <md:KeyDescriptor use="signing">
      // 	  <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      // 		  <ds:X509Data>
      // 		  <ds:X509Certificate>MIIE3jCCAsYCCQDE5FzoAkixzzANBgkqhkiG9w0BAQsFADAxMQswCQYDVQQGEwJVUzEQMA4GA1UECAwHRmxvcmlkYTEQMA4GA1UEBwwHT3JsYW5kbzAeFw0yMzExMTkxMjUyMTVaFw0zMzExMTYxMjUyMTVaMDExCzAJBgNVBAYTAlVTMRAwDgYDVQQIDAdGbG9yaWRhMRAwDgYDVQQHDAdPcmxhbmRvMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2ELJsLZs4yBH7a2U5pA7xw+Oiut7b/ROKh2BqSTKRbEG4xy7WwljT02Mh7GTjLvswtZSUObWFO5v14HNORa3+J9JT2DH+9F+FJ770HX8a3cKYBNQt3xP4IeUyjI3QWzrGtkYPwSZ74tDpAUtuqPAxtoCaZXFDtX6lvCJDqiPnfxRZrKkepYWINSwu4DRpg6KoiPWRCYTsEcCzImInzlACdM97jpG1gLGA6a4dmjalQbRtvC56N0Z56gIhYq2F5JdzB2a10pqoIY8ggXZGIJS9I++8mmdTj6So5pPxLwnCYUhwDew1/DMbi9xIwYozs9pEtHCTn1l34jldDwTziVAxGQZO7QUuoMl997zqcPS7pVWRnfz5odKuytLvQDA0lRVfzOxtqbM3qVhoLT2iDmnuEtlZzgfbt4WEuT2538qxZJkFRpZQIrTj3ybqmWAv36Cp49dfeMwaqjhfX7/mVfbsPMSC653DSZBB+n+Uz0FC3QhH+vIdNhXNAQ5tBseHUR6pXiMnLtI/WVbMvpvFwK2faFTcx1oaP/Qk6yCq66tJvPbnatT9qGF8rdBJmAk9aBdQTI+hAh5mDtDweCrgVL+Tm/+Q85hSl4HGzH/LhLVS478tZVX+o+0yorZ35LCW3e4v8iX+1VEGSdg2ooOWtbSSXK2cYZr8ilyUQp0KueenR0CAwEAATANBgkqhkiG9w0BAQsFAAOCAgEAsonAahruWuHlYbDNQVD0ryhL/b+ttKKqVeT87XYDkvVhlSSSVAKcCwK/UU6z8Ty9dODUkd93Qsbof8fGMlXeYCtDHMRanvWLtk4wVkAMyNkDYHzJ1FbO7v44ZBbqNzSLy2kosbRELlcz+P3/42xumlDqAw/k13tWUdlLDxb0pd8R5yBev6HkIdJBIWtKmUuI+e8F/yTNf5kY7HO1p0NeKdVeZw4Ydw33+BwVxVNmhIxzdP5ZFQv0XRFWhCMo/6RLEepCvWUp/T1WRFqgwAdURaQrvvfpjO/Ls+neht1SWDeP8RRgsDrXIc3gZfaD8q4liIDTZ6HsFi7FmLbZatU8jJ4pCstxQLCvmix+1zF6Fwa9V5OApSTbVqBOsDZbJxeAoSzy5Wx28wufAZT4Kc/OaViXPV5o/ordPs4EYKgd/eNFCgIsZYXe75rYXqnieAIfJEGddsLBpqlgLkwvf5KVS4QNqqX+2YubP63y+3sICq2ScdhO3LZs3nlqQ/SgMiJnCBbDUDZ9GGgJNJVVytcSz5IDQHeflrq/zTt1c4q1DO3CS7mimAnTCjetERRQ3mgY/2hRiuCDFj3Cy7QMjFs3vBsbWrjNWlqyveFmHDRkq34Om7eA2jl3LZ5u7vSm0/ylp/vtoysMjwEmw/0NA3hZPTG3OJxcvFcXBsz0SiFcd1U=</ds:X509Certificate>
      // 		  </ds:X509Data>
      // 	  </ds:KeyInfo>
      // 	  </md:KeyDescriptor>
      // 	  <md:KeyDescriptor use="encryption">
      // 	  <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      // 		  <ds:X509Data>
      // 		  <ds:X509Certificate>MIIE3jCCAsYCCQDE5FzoAkixzzANBgkqhkiG9w0BAQsFADAxMQswCQYDVQQGEwJVUzEQMA4GA1UECAwHRmxvcmlkYTEQMA4GA1UEBwwHT3JsYW5kbzAeFw0yMzExMTkxMjUyMTVaFw0zMzExMTYxMjUyMTVaMDExCzAJBgNVBAYTAlVTMRAwDgYDVQQIDAdGbG9yaWRhMRAwDgYDVQQHDAdPcmxhbmRvMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA2ELJsLZs4yBH7a2U5pA7xw+Oiut7b/ROKh2BqSTKRbEG4xy7WwljT02Mh7GTjLvswtZSUObWFO5v14HNORa3+J9JT2DH+9F+FJ770HX8a3cKYBNQt3xP4IeUyjI3QWzrGtkYPwSZ74tDpAUtuqPAxtoCaZXFDtX6lvCJDqiPnfxRZrKkepYWINSwu4DRpg6KoiPWRCYTsEcCzImInzlACdM97jpG1gLGA6a4dmjalQbRtvC56N0Z56gIhYq2F5JdzB2a10pqoIY8ggXZGIJS9I++8mmdTj6So5pPxLwnCYUhwDew1/DMbi9xIwYozs9pEtHCTn1l34jldDwTziVAxGQZO7QUuoMl997zqcPS7pVWRnfz5odKuytLvQDA0lRVfzOxtqbM3qVhoLT2iDmnuEtlZzgfbt4WEuT2538qxZJkFRpZQIrTj3ybqmWAv36Cp49dfeMwaqjhfX7/mVfbsPMSC653DSZBB+n+Uz0FC3QhH+vIdNhXNAQ5tBseHUR6pXiMnLtI/WVbMvpvFwK2faFTcx1oaP/Qk6yCq66tJvPbnatT9qGF8rdBJmAk9aBdQTI+hAh5mDtDweCrgVL+Tm/+Q85hSl4HGzH/LhLVS478tZVX+o+0yorZ35LCW3e4v8iX+1VEGSdg2ooOWtbSSXK2cYZr8ilyUQp0KueenR0CAwEAATANBgkqhkiG9w0BAQsFAAOCAgEAsonAahruWuHlYbDNQVD0ryhL/b+ttKKqVeT87XYDkvVhlSSSVAKcCwK/UU6z8Ty9dODUkd93Qsbof8fGMlXeYCtDHMRanvWLtk4wVkAMyNkDYHzJ1FbO7v44ZBbqNzSLy2kosbRELlcz+P3/42xumlDqAw/k13tWUdlLDxb0pd8R5yBev6HkIdJBIWtKmUuI+e8F/yTNf5kY7HO1p0NeKdVeZw4Ydw33+BwVxVNmhIxzdP5ZFQv0XRFWhCMo/6RLEepCvWUp/T1WRFqgwAdURaQrvvfpjO/Ls+neht1SWDeP8RRgsDrXIc3gZfaD8q4liIDTZ6HsFi7FmLbZatU8jJ4pCstxQLCvmix+1zF6Fwa9V5OApSTbVqBOsDZbJxeAoSzy5Wx28wufAZT4Kc/OaViXPV5o/ordPs4EYKgd/eNFCgIsZYXe75rYXqnieAIfJEGddsLBpqlgLkwvf5KVS4QNqqX+2YubP63y+3sICq2ScdhO3LZs3nlqQ/SgMiJnCBbDUDZ9GGgJNJVVytcSz5IDQHeflrq/zTt1c4q1DO3CS7mimAnTCjetERRQ3mgY/2hRiuCDFj3Cy7QMjFs3vBsbWrjNWlqyveFmHDRkq34Om7eA2jl3LZ5u7vSm0/ylp/vtoysMjwEmw/0NA3hZPTG3OJxcvFcXBsz0SiFcd1U=</ds:X509Certificate>
      // 		  </ds:X509Data>
      // 	  </ds:KeyInfo>
      // 	  </md:KeyDescriptor>
      // 	  <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://localhost:3000/api/auth/sso/saml2/sp/sls"/>
      // 	  <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
      // 	  <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://localhost:3000/api/auth/sso/saml2/sp/acs/sso" index="1"/>
      // 	  <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://localhost:3000/api/auth/sso/saml2/sp/acs/sso" index="1"/>
      // 	  </md:SPSSODescriptor>
      //   <md:Organization>
      // 	  <md:OrganizationName xml:lang="en-US">Organization Name</md:OrganizationName>
      // 	  <md:OrganizationDisplayName xml:lang="en-US">Organization DisplayName</md:OrganizationDisplayName>
      // 	  <md:OrganizationURL xml:lang="en-US">http://localhost:3000/</md:OrganizationURL>
      //   </md:Organization>
      //   <md:ContactPerson contactType="technical">
      // 	  <md:GivenName>Technical Contact Name</md:GivenName>
      // 	  <md:EmailAddress>technical_contact@gmail.com</md:EmailAddress>
      //   </md:ContactPerson>
      //   <md:ContactPerson contactType="support">
      // 	  <md:GivenName>Support Contact Name</md:GivenName>
      // 	  <md:EmailAddress>support_contact@gmail.com</md:EmailAddress>
      //   </md:ContactPerson>
      //   </md:EntityDescriptor>
      //   `,
      //           },
      //           idpMetadata: {
      //             entityURL:
      //               "https://dummyidp.com/apps/app_01k16v4vb5yytywqjjvv2b3435/metadata",
      //             entityID:
      //               "https://dummyidp.com/apps/app_01k16v4vb5yytywqjjvv2b3435",
      //             redirectURL:
      //               "https://dummyidp.com/apps/app_01k16v4vb5yytywqjjvv2b3435/sso",
      //             singleSignOnService: [
      //               {
      //                 Binding:
      //                   "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
      //                 Location:
      //                   "https://dummyidp.com/apps/app_01k16v4vb5yytywqjjvv2b3435/sso",
      //               },
      //             ],
      //             cert: `-----BEGIN CERTIFICATE-----
      // MIIDBzCCAe+gAwIBAgIUCLBK4f75EXEe4gyroYnVaqLoSp4wDQYJKoZIhvcNAQEL
      // BQAwEzERMA8GA1UEAwwIZHVtbXlpZHAwHhcNMjQwNTEzMjE1NDE2WhcNMzQwNTEx
      // MjE1NDE2WjATMREwDwYDVQQDDAhkdW1teWlkcDCCASIwDQYJKoZIhvcNAQEBBQAD
      // ggEPADCCAQoCggEBAKhmgQmWb8NvGhz952XY4SlJlpWIK72RilhOZS9frDYhqWVJ
      // HsGH9Z7sSzrM/0+YvCyEWuZV9gpMeIaHZxEPDqW3RJ7KG51fn/s/qFvwctf+CZDj
      // yfGDzYs+XIgf7p56U48EmYeWpB/aUW64gSbnPqrtWmVFBisOfIx5aY3NubtTsn+g
      // 0XbdX0L57+NgSvPQHXh/GPXA7xCIWm54G5kqjozxbKEFA0DS3yb6oHRQWHqIAM/7
      // mJMdUVZNIV1q7c2JIgAl23uDWq+2KTE2R5liP/KjvjwKonVKtTqGqX6ei25rsTHO
      // aDpBH/LdQK2txgsm7R7+IThWNvUI0TttrmwBqyMCAwEAAaNTMFEwHQYDVR0OBBYE
      // FD142gxIAJMhpgMkgpzmRNoW9XbEMB8GA1UdIwQYMBaAFD142gxIAJMhpgMkgpzm
      // RNoW9XbEMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBADQd6k6z
      // FIc20GfGHY5C2MFwyGOmP5/UG/JiTq7Zky28G6D0NA0je+GztzXx7VYDfCfHxLcm
      // 2k5t9nYhb9kVawiLUUDVF6s+yZUXA4gUA3KoTWh1/oRxR3ggW7dKYm9fsNOdQAbx
      // UUkzp7HLZ45ZlpKUS0hO7es+fPyF5KVw0g0SrtQWwWucnQMAQE9m+B0aOf+92y7J
      // QkdgdR8Gd/XZ4NZfoOnKV7A1utT4rWxYCgICeRTHx9tly5OhPW4hQr5qOpngcsJ9
      // vhr86IjznQXhfj3hql5lA3VbHW04ro37ROIkh2bShDq5dwJJHpYCGrF3MQv8S3m+
      // jzGhYL6m9gFTm/8=
      // -----END CERTIFICATE-----`,
      //           },
      //           callbackUrl: "/dashboard",
      //         },
      //       },
      //     ],
      //   }),
      deviceAuthorization({
        expiresIn: "3min",
        interval: "5s",
      }),
      lastLoginMethod(),
    ],
    // socialProviders: {
    //   discord: {
    //     clientId: options.discordClientId,
    //     clientSecret: options.discordClientSecret,
    //     redirectURI: `${options.productionUrl}/api/auth/callback/discord`,
    //   },
    // },
    trustedOrigins: ["expo://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
export type ActiveOrganization = Auth["$Infer"]["ActiveOrganization"];
export type Invitation = Auth["$Infer"]["Invitation"];
export type Member = Auth["$Infer"]["Member"];
export type Organization = Auth["$Infer"]["Organization"];
