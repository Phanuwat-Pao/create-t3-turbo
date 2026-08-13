import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  banReason: text("ban_reason"),
  banned: boolean("banned").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  role: text("role"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    activeOrganizationId: text("active_organization_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    impersonatedBy: text("impersonated_by"),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const organization = pgTable(
  "organization",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    logo: text("logo"),
    metadata: text("metadata"),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)]
);

export const member = pgTable(
  "member",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ]
);

export const invitation = pgTable(
  "invitation",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    email: text("email").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    role: text("role"),
    status: text("status").default("pending").notNull(),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ]
);

export const twoFactor = pgTable(
  "two_factor",
  {
    backupCodes: text("backup_codes").notNull(),
    failedVerificationCount: integer("failed_verification_count").default(0),
    id: text("id").primaryKey(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    secret: text("secret").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").default(true),
  },
  (table) => [
    index("twoFactor_secret_idx").on(table.secret),
    index("twoFactor_userId_idx").on(table.userId),
  ]
);

export const deviceCode = pgTable("device_code", {
  clientId: text("client_id"),
  deviceCode: text("device_code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  id: text("id").primaryKey(),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  pollingInterval: integer("polling_interval"),
  scope: text("scope"),
  status: text("status").notNull(),
  userCode: text("user_code").notNull(),
  userId: text("user_id"),
});

export const jwks = pgTable("jwks", {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  id: text("id").primaryKey(),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
});

export const passkey = pgTable(
  "passkey",
  {
    aaguid: text("aaguid"),
    backedUp: boolean("backed_up").notNull(),
    counter: integer("counter").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    credentialID: text("credential_id").notNull(),
    deviceType: text("device_type").notNull(),
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    transports: text("transports"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("passkey_userId_idx").on(table.userId),
    index("passkey_credentialID_idx").on(table.credentialID),
  ]
);

export const ssoProvider = pgTable("sso_provider", {
  domain: text("domain").notNull(),
  id: text("id").primaryKey(),
  issuer: text("issuer").notNull(),
  oidcConfig: text("oidc_config"),
  organizationId: text("organization_id"),
  providerId: text("provider_id").notNull().unique(),
  samlConfig: text("saml_config"),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
});

export const scimProvider = pgTable("scim_provider", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id"),
  providerId: text("provider_id").notNull().unique(),
  scimToken: text("scim_token").notNull().unique(),
});

export const oauthClient = pgTable(
  "oauth_client",
  {
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    contacts: text("contacts").array(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    disabled: boolean("disabled").default(false),
    enableEndSession: boolean("enable_end_session"),
    grantTypes: text("grant_types").array(),
    icon: text("icon"),
    id: text("id").primaryKey(),
    metadata: jsonb("metadata"),
    name: text("name"),
    policy: text("policy"),
    postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
    public: boolean("public"),
    redirectUris: text("redirect_uris").array().notNull(),
    referenceId: text("reference_id"),
    requirePKCE: boolean("require_pkce"),
    responseTypes: text("response_types").array(),
    scopes: text("scopes").array(),
    skipConsent: boolean("skip_consent"),
    softwareId: text("software_id"),
    softwareStatement: text("software_statement"),
    softwareVersion: text("software_version"),
    subjectType: text("subject_type"),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    tos: text("tos"),
    type: text("type"),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    uri: text("uri"),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("oauthClient_userId_idx").on(table.userId)]
);

export const oauthRefreshToken = pgTable(
  "oauth_refresh_token",
  {
    authTime: timestamp("auth_time", { withTimezone: true }),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    id: text("id").primaryKey(),
    referenceId: text("reference_id"),
    revoked: timestamp("revoked", { withTimezone: true }),
    scopes: text("scopes").array().notNull(),
    sessionId: text("session_id").references(() => session.id, {
      onDelete: "set null",
    }),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("oauthRefreshToken_clientId_idx").on(table.clientId),
    index("oauthRefreshToken_sessionId_idx").on(table.sessionId),
    index("oauthRefreshToken_userId_idx").on(table.userId),
  ]
);

export const oauthAccessToken = pgTable(
  "oauth_access_token",
  {
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    id: text("id").primaryKey(),
    referenceId: text("reference_id"),
    refreshId: text("refresh_id").references(() => oauthRefreshToken.id, {
      onDelete: "cascade",
    }),
    scopes: text("scopes").array().notNull(),
    sessionId: text("session_id").references(() => session.id, {
      onDelete: "set null",
    }),
    token: text("token").unique(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("oauthAccessToken_clientId_idx").on(table.clientId),
    index("oauthAccessToken_sessionId_idx").on(table.sessionId),
    index("oauthAccessToken_userId_idx").on(table.userId),
    index("oauthAccessToken_refreshId_idx").on(table.refreshId),
  ]
);

export const oauthConsent = pgTable(
  "oauth_consent",
  {
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    id: text("id").primaryKey(),
    referenceId: text("reference_id"),
    scopes: text("scopes").array().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("oauthConsent_clientId_idx").on(table.clientId),
    index("oauthConsent_userId_idx").on(table.userId),
  ]
);
