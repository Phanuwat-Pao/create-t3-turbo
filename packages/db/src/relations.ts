import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  invitation: {
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
  },
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
  },
  oauthAccessToken: {
    oauthClient: r.one.oauthClient({
      from: r.oauthAccessToken.clientId,
      to: r.oauthClient.clientId,
    }),
    oauthRefreshToken: r.one.oauthRefreshToken({
      from: r.oauthAccessToken.refreshId,
      to: r.oauthRefreshToken.id,
    }),
    session: r.one.session({
      from: r.oauthAccessToken.sessionId,
      to: r.session.id,
    }),
    user: r.one.user({
      from: r.oauthAccessToken.userId,
      to: r.user.id,
    }),
  },
  oauthClient: {
    oauthAccessTokens: r.many.oauthAccessToken(),
    oauthConsents: r.many.oauthConsent(),
    oauthRefreshTokens: r.many.oauthRefreshToken(),
    user: r.one.user({
      from: r.oauthClient.userId,
      to: r.user.id,
    }),
  },
  oauthConsent: {
    oauthClient: r.one.oauthClient({
      from: r.oauthConsent.clientId,
      to: r.oauthClient.clientId,
    }),
    user: r.one.user({
      from: r.oauthConsent.userId,
      to: r.user.id,
    }),
  },
  oauthRefreshToken: {
    oauthAccessTokens: r.many.oauthAccessToken(),
    oauthClient: r.one.oauthClient({
      from: r.oauthRefreshToken.clientId,
      to: r.oauthClient.clientId,
    }),
    session: r.one.session({
      from: r.oauthRefreshToken.sessionId,
      to: r.session.id,
    }),
    user: r.one.user({
      from: r.oauthRefreshToken.userId,
      to: r.user.id,
    }),
  },
  organization: {
    invitations: r.many.invitation(),
    members: r.many.member(),
  },
  passkey: {
    user: r.one.user({
      from: r.passkey.userId,
      to: r.user.id,
    }),
  },
  session: {
    oauthAccessTokens: r.many.oauthAccessToken(),
    oauthRefreshTokens: r.many.oauthRefreshToken(),
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  twoFactor: {
    user: r.one.user({
      from: r.twoFactor.userId,
      to: r.user.id,
    }),
  },
  user: {
    accounts: r.many.account(),
    invitations: r.many.invitation(),
    members: r.many.member(),
    oauthAccessTokens: r.many.oauthAccessToken(),
    oauthClients: r.many.oauthClient(),
    oauthConsents: r.many.oauthConsent(),
    oauthRefreshTokens: r.many.oauthRefreshToken(),
    passkeys: r.many.passkey(),
    sessions: r.many.session(),
    twoFactors: r.many.twoFactor(),
  },
}));
