import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  AuditLog: {
    user: r.one.user({
      from: r.AuditLog.userId,
      to: r.user.id,
    }),
  },
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
    ssoProviders: r.many.ssoProvider(),
  },
  passkey: {
    user: r.one.user({
      from: r.passkey.userId,
      to: r.user.id,
    }),
  },
  scimGroup: {
    scimGroupMembers: r.many.scimGroupMember(),
  },
  scimGroupMember: {
    scimGroup: r.one.scimGroup({
      from: r.scimGroupMember.groupId,
      to: r.scimGroup.id,
    }),
    scimUser: r.one.scimUser({
      from: r.scimGroupMember.scimUserId,
      to: r.scimUser.id,
    }),
  },
  scimIdentityTombstone: {
    user: r.one.user({
      from: r.scimIdentityTombstone.userId,
      to: r.user.id,
    }),
  },
  scimProjectionGrant: {
    scimUser: r.one.scimUser({
      from: r.scimProjectionGrant.scimUserId,
      to: r.scimUser.id,
    }),
    user: r.one.user({
      from: r.scimProjectionGrant.userId,
      to: r.user.id,
    }),
  },
  scimSubject: {
    user: r.one.user({
      from: r.scimSubject.userId,
      to: r.user.id,
    }),
  },
  scimUser: {
    scimGroupMembers: r.many.scimGroupMember(),
    scimProjectionGrants: r.many.scimProjectionGrant(),
    user: r.one.user({
      from: r.scimUser.userId,
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
  ssoProvider: {
    organization: r.one.organization({
      from: r.ssoProvider.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.ssoProvider.userId,
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
    auditLogs: r.many.AuditLog(),
    invitations: r.many.invitation(),
    members: r.many.member(),
    oauthAccessTokens: r.many.oauthAccessToken(),
    oauthClients: r.many.oauthClient(),
    oauthConsents: r.many.oauthConsent(),
    oauthRefreshTokens: r.many.oauthRefreshToken(),
    passkeys: r.many.passkey(),
    scimIdentityTombstones: r.many.scimIdentityTombstone(),
    scimProjectionGrants: r.many.scimProjectionGrant(),
    scimSubjects: r.many.scimSubject(),
    scimUsers: r.many.scimUser(),
    sessions: r.many.session(),
    ssoProviders: r.many.ssoProvider(),
    twoFactors: r.many.twoFactor(),
  },
}));
