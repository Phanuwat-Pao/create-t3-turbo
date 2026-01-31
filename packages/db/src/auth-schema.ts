import { relations } from "drizzle-orm";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", (t) => ({
  banExpires: t.timestamp("ban_expires"),
  banReason: t.text("ban_reason"),
  banned: t.boolean("banned").default(false),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  email: t.text("email").notNull().unique(),
  emailVerified: t.boolean("email_verified").default(false).notNull(),
  id: t.text("id").primaryKey(),
  image: t.text("image"),
  name: t.text("name").notNull(),
  role: t.text("role"),
  twoFactorEnabled: t.boolean("two_factor_enabled").default(false),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}));

export const session = pgTable(
  "session",
  (t) => ({
    activeOrganizationId: t.text("active_organization_id"),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    id: t.text("id").primaryKey(),
    impersonatedBy: t.text("impersonated_by"),
    ipAddress: t.text("ip_address"),
    token: t.text("token").notNull().unique(),
    updatedAt: t
      .timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userAgent: t.text("user_agent"),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  (t) => ({
    accessToken: t.text("access_token"),
    accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
    accountId: t.text("account_id").notNull(),
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    id: t.text("id").primaryKey(),
    idToken: t.text("id_token"),
    password: t.text("password"),
    providerId: t.text("provider_id").notNull(),
    refreshToken: t.text("refresh_token"),
    refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
    scope: t.text("scope"),
    updatedAt: t
      .timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  (t) => ({
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    id: t.text("id").primaryKey(),
    identifier: t.text("identifier").notNull(),
    updatedAt: t
      .timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    value: t.text("value").notNull(),
  }),
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const organization = pgTable(
  "organization",
  (t) => ({
    createdAt: t.timestamp("created_at").notNull(),
    id: t.text("id").primaryKey(),
    logo: t.text("logo"),
    metadata: t.text("metadata"),
    name: t.text("name").notNull(),
    slug: t.text("slug").notNull().unique(),
  }),
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)]
);

export const member = pgTable(
  "member",
  (t) => ({
    createdAt: t.timestamp("created_at").notNull(),
    id: t.text("id").primaryKey(),
    organizationId: t
      .text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: t.text("role").default("member").notNull(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ]
);

export const invitation = pgTable(
  "invitation",
  (t) => ({
    createdAt: t.timestamp("created_at").defaultNow().notNull(),
    email: t.text("email").notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    id: t.text("id").primaryKey(),
    inviterId: t
      .text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: t
      .text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: t.text("role"),
    status: t.text("status").default("pending").notNull(),
  }),
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ]
);

export const twoFactor = pgTable(
  "two_factor",
  (t) => ({
    backupCodes: t.text("backup_codes").notNull(),
    id: t.text("id").primaryKey(),
    secret: t.text("secret").notNull(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ]
);

export const deviceCode = pgTable("device_code", (t) => ({
  clientId: t.text("client_id"),
  deviceCode: t.text("device_code").notNull(),
  expiresAt: t.timestamp("expires_at").notNull(),
  id: t.text("id").primaryKey(),
  lastPolledAt: t.timestamp("last_polled_at"),
  pollingInterval: t.integer("polling_interval"),
  scope: t.text("scope"),
  status: t.text("status").notNull(),
  userCode: t.text("user_code").notNull(),
  userId: t.text("user_id"),
}));

export const jwks = pgTable("jwks", (t) => ({
  createdAt: t.timestamp("created_at").notNull(),
  expiresAt: t.timestamp("expires_at"),
  id: t.text("id").primaryKey(),
  privateKey: t.text("private_key").notNull(),
  publicKey: t.text("public_key").notNull(),
}));

export const passkey = pgTable(
  "passkey",
  (t) => ({
    aaguid: t.text("aaguid"),
    backedUp: t.boolean("backed_up").notNull(),
    counter: t.integer("counter").notNull(),
    createdAt: t.timestamp("created_at"),
    credentialID: t.text("credential_id").notNull(),
    deviceType: t.text("device_type").notNull(),
    id: t.text("id").primaryKey(),
    name: t.text("name"),
    publicKey: t.text("public_key").notNull(),
    transports: t.text("transports"),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  }),
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ]
);

export const oauthClient = pgTable("oauth_client", (t) => ({
  clientId: t.text("client_id").notNull().unique(),
  clientSecret: t.text("client_secret"),
  contacts: t.text("contacts").array(),
  createdAt: t.timestamp("created_at"),
  disabled: t.boolean("disabled").default(false),
  enableEndSession: t.boolean("enable_end_session"),
  grantTypes: t.text("grant_types").array(),
  icon: t.text("icon"),
  id: t.text("id").primaryKey(),
  metadata: t.jsonb("metadata"),
  name: t.text("name"),
  policy: t.text("policy"),
  postLogoutRedirectUris: t.text("post_logout_redirect_uris").array(),
  public: t.boolean("public"),
  redirectUris: t.text("redirect_uris").array().notNull(),
  referenceId: t.text("reference_id"),
  responseTypes: t.text("response_types").array(),
  scopes: t.text("scopes").array(),
  skipConsent: t.boolean("skip_consent"),
  softwareId: t.text("software_id"),
  softwareStatement: t.text("software_statement"),
  softwareVersion: t.text("software_version"),
  tokenEndpointAuthMethod: t.text("token_endpoint_auth_method"),
  tos: t.text("tos"),
  type: t.text("type"),
  updatedAt: t.timestamp("updated_at"),
  uri: t.text("uri"),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
}));

export const oauthRefreshToken = pgTable("oauth_refresh_token", (t) => ({
  clientId: t
    .text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: t.timestamp("created_at"),
  expiresAt: t.timestamp("expires_at"),
  id: t.text("id").primaryKey(),
  referenceId: t.text("reference_id"),
  revoked: t.timestamp("revoked"),
  scopes: t.text("scopes").array().notNull(),
  sessionId: t.text("session_id").references(() => session.id, {
    onDelete: "set null",
  }),
  token: t.text("token").notNull(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const oauthAccessToken = pgTable("oauth_access_token", (t) => ({
  clientId: t
    .text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: t.timestamp("created_at"),
  expiresAt: t.timestamp("expires_at"),
  id: t.text("id").primaryKey(),
  referenceId: t.text("reference_id"),
  refreshId: t.text("refresh_id").references(() => oauthRefreshToken.id, {
    onDelete: "cascade",
  }),
  scopes: t.text("scopes").array().notNull(),
  sessionId: t.text("session_id").references(() => session.id, {
    onDelete: "set null",
  }),
  token: t.text("token").unique(),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
}));

export const oauthConsent = pgTable("oauth_consent", (t) => ({
  clientId: t
    .text("client_id")
    .notNull()
    .references(() => oauthClient.clientId, { onDelete: "cascade" }),
  createdAt: t.timestamp("created_at"),
  id: t.text("id").primaryKey(),
  referenceId: t.text("reference_id"),
  scopes: t.text("scopes").array().notNull(),
  updatedAt: t.timestamp("updated_at"),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  invitations: many(invitation),
  members: many(member),
  oauthAccessTokens: many(oauthAccessToken),
  oauthClients: many(oauthClient),
  oauthConsents: many(oauthConsent),
  oauthRefreshTokens: many(oauthRefreshToken),
  passkeys: many(passkey),
  sessions: many(session),
  twoFactors: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one, many }) => ({
  oauthAccessTokens: many(oauthAccessToken),
  oauthRefreshTokens: many(oauthRefreshToken),
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  members: many(member),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, {
    fields: [passkey.userId],
    references: [user.id],
  }),
}));

export const oauthClientRelations = relations(oauthClient, ({ one, many }) => ({
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
  oauthRefreshTokens: many(oauthRefreshToken),
  user: one(user, {
    fields: [oauthClient.userId],
    references: [user.id],
  }),
}));

export const oauthRefreshTokenRelations = relations(
  oauthRefreshToken,
  ({ one, many }) => ({
    oauthAccessTokens: many(oauthAccessToken),
    oauthClient: one(oauthClient, {
      fields: [oauthRefreshToken.clientId],
      references: [oauthClient.clientId],
    }),
    session: one(session, {
      fields: [oauthRefreshToken.sessionId],
      references: [session.id],
    }),
    user: one(user, {
      fields: [oauthRefreshToken.userId],
      references: [user.id],
    }),
  })
);

export const oauthAccessTokenRelations = relations(
  oauthAccessToken,
  ({ one }) => ({
    oauthClient: one(oauthClient, {
      fields: [oauthAccessToken.clientId],
      references: [oauthClient.clientId],
    }),
    oauthRefreshToken: one(oauthRefreshToken, {
      fields: [oauthAccessToken.refreshId],
      references: [oauthRefreshToken.id],
    }),
    session: one(session, {
      fields: [oauthAccessToken.sessionId],
      references: [session.id],
    }),
    user: one(user, {
      fields: [oauthAccessToken.userId],
      references: [user.id],
    }),
  })
);

export const oauthConsentRelations = relations(oauthConsent, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthConsent.clientId],
    references: [oauthClient.clientId],
  }),
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
}));
