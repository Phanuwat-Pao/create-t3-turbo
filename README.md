# create-t3-turbo

A T3-style monorepo, kept aggressively current: a Next.js 16 web app and an
Expo SDK 57 mobile app sharing one typed oRPC API, one Drizzle v1 Postgres
schema, and one Better Auth setup — with dual-language (th/en) i18n across
every surface.

## Installation

> [!NOTE]
>
> Make sure to follow the system requirements specified in [`package.json#engines`](./package.json) before proceeding (Node ≥ 22, pnpm ≥ 11).

Use this repository as a template, or init via Turbo's CLI (use PNPM as the package manager):

```bash
npx create-turbo@latest -e https://github.com/t3-oss/create-t3-turbo
```

## About

It uses [Turborepo](https://turborepo.com) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ expo
  │   ├─ Expo SDK 57 (React Native 0.86, React 19)
  │   ├─ Navigation using Expo Router
  │   ├─ Tailwind CSS v4 using uniwind
  │   ├─ i18next with th/en resources
  │   └─ Typesafe API calls using oRPC + Better Auth client (passkey, SSO, …)
  ├─ nextjs
  │   ├─ Next.js 16 App Router (React 19 + React Compiler)
  │   ├─ Tailwind CSS v4 + shadcn/ui
  │   ├─ oRPC client with TanStack Query/Form
  │   ├─ Path-based th/en i18n dictionaries ([lang] routes)
  │   ├─ Full auth surface: sign-in/up (email, username, social, passkey),
  │   │  2FA (TOTP + email OTP), device authorization, OAuth provider
  │   │  consent/select-account/select-organization pages
  │   ├─ Admin dashboard with self-hosted audit logs
  │   └─ Presigned-S3 storage helpers (single + multipart uploads)
  └─ e2e
      └─ Playwright smoke tests against the real Next.js app
packages
  ├─ api
  │   ├─ oRPC v1 router (OpenAPI via @orpc/openapi + Scalar docs)
  │   └─ S3 service for authenticated presigned uploads/downloads
  ├─ auth
  │   ├─ Better Auth 1.6 with organization, twoFactor, passkey, admin,
  │   │  multiSession, deviceAuthorization, username, sso (SAML), scim,
  │   │  oauthProvider (act as an OAuth/OIDC provider), jwt, bearer,
  │   │  oneTap, lastLoginMethod, oAuthProxy, expo
  │   ├─ i18n plugin: server error messages localized th/en
  │   └─ Self-hosted audit log plugin (events land in your own Postgres)
  ├─ db
  │   └─ Drizzle ORM v1 (relational queries v2) on PostgreSQL (node-postgres)
  ├─ ui
  │   └─ Shared shadcn/ui components (add more with `pnpm ui-add`)
  └─ validators
      └─ Shared Zod v4 schemas
tooling
  ├─ github
  │   └─ CI setup action
  ├─ tailwind
  │   └─ shared tailwind theme and configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

Repo-wide tooling: [Ultracite](https://ultracite.ai) (oxlint + oxfmt) for lint
and formatting, `tsgo` (TypeScript native preview) for typechecking, Vitest for
unit tests, shared dependency versions via pnpm catalogs in
`pnpm-workspace.yaml`, and a lefthook pre-commit suite (format/lint, typecheck,
workspace lint, build, and a critical `pnpm audit`) that every commit must pass.

> In this template, we use `@acme` as a placeholder for package names. As a user, you might want to replace it with your own organization or project name. You can use find-and-replace to change all the instances of `@acme` to something like `@my-company` or `@project-name`.

## Quick Start

> **Note**
> The [db](./packages/db) package is preconfigured for PostgreSQL via the
> `node-postgres` driver and reads `POSTGRES_URL` from `.env` (a `:6543`
> pooling port is swapped to `:5432` for Drizzle Kit). If you're using
> something else, adjust the [schema](./packages/db/src/schema.ts), the
> [client](./packages/db/src/client.ts), and the
> [drizzle config](./packages/db/drizzle.config.ts).

To get it running, follow the steps below:

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# Push the Drizzle schema to the database (opens turbo's TUI and asks
# for confirmation before applying)
pnpm db:push
```

#### Optional: configure presigned S3 storage

The Next.js app can issue authenticated presigned upload and download URLs without proxying file bytes through the app server. Add these server-side variables when you want to enable storage:

```bash
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Optional
S3_ENDPOINT=https://s3.amazonaws.com
S3_FORCE_PATH_STYLE=false
S3_UPLOAD_URL_EXPIRES_IN=900
S3_DOWNLOAD_URL_EXPIRES_IN=900
```

The storage API is authenticated, generates keys under `users/<userId>/...`, and supports both single-request uploads and multipart uploads.

### 2. Generate Better Auth Schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI whenever the auth config changes.

```bash
# Generate the Better Auth schema
pnpm auth:generate
```

This command runs the Better Auth CLI with the following configuration:

- **Config file**: `packages/auth/script/auth-cli.ts` - A CLI-only configuration file (isolated from src to prevent imports)
- **Output**: `packages/db/src/auth-schema.ts` - Generated Drizzle schema for authentication tables

> **Note**: The `auth-cli.ts` file is placed in the `script/` directory (instead of `src/`) to prevent accidental imports from other parts of the codebase. For runtime authentication, use the configuration from `packages/auth/src/index.ts`.

> [!IMPORTANT]
> Two post-generation fixups are maintained in this repo (see `AGENTS.md`):
> the CLI's drizzle-v0 `relations()` blocks are stripped (relations live in
> `packages/db/src/relations.ts` via `defineRelations`), and
> `{ withTimezone: true }` is re-applied to every `timestamp(...)` column so
> the database keeps `timestamptz`.

For more information about the Better Auth CLI, see the [official documentation](https://www.better-auth.com/docs/concepts/cli#generate).

### 3. Configure Expo `dev`-script

#### Use iOS Simulator

1. Make sure you have XCode and XCommand Line Tools installed [as shown on expo docs](https://docs.expo.dev/workflow/ios-simulator).

   > **NOTE:** If you just installed XCode, or if you have updated it, you need to open the simulator manually once. Run `npx expo start` from `apps/expo`, and then enter `I` to launch Expo Go. After the manual launch, you can run `pnpm dev` in the root directory.

   ```diff
   +  "dev": "expo start --ios",
   ```

2. Run `pnpm dev` at the project root folder.

#### Use Android Emulator

1. Install Android Studio tools [as shown on expo docs](https://docs.expo.dev/workflow/android-studio-emulator).

2. Change the `dev` script at `apps/expo/package.json` to open the Android emulator.

   ```diff
   +  "dev": "expo start --android",
   ```

3. Run `pnpm dev` at the project root folder.

### 4. Configuring Better-Auth to work with Expo

In order to get Better-Auth to work with Expo, you must either:

#### Deploy the Auth Proxy (RECOMMENDED)

Better-auth comes with an [auth proxy plugin](https://www.better-auth.com/docs/plugins/oauth-proxy). By deploying the Next.js app, you can get OAuth working in preview deployments and development for Expo apps.

By using the proxy plugin, the Next.js apps will forward any auth requests to the proxy server, which will handle the OAuth flow and then redirect back to the Next.js app. This makes it easy to get OAuth working since you'll have a stable URL that is publicly accessible and doesn't change for every deployment and doesn't rely on what port the app is running on.

#### Add your local IP to your OAuth provider

You can alternatively add your local IP (e.g. `192.168.x.y:$PORT`) to your OAuth provider. This may not be as reliable as your local IP may change when you change networks. Some OAuth providers may also only support a single callback URL for each app making this approach unviable for some providers (e.g. GitHub).

### 5a. When it's time to add a new UI component

Run the `ui-add` script to add a new UI component using the interactive `shadcn/ui` CLI:

```bash
pnpm ui-add
```

When the component(s) has been installed, you should be good to go and start using it in your app.

### 5b. When it's time to add a new package

To add a new package, simply run `pnpm turbo gen init` in the monorepo root. This will prompt you for a package name as well as if you want to install any dependencies to the new package (of course you can also do this yourself later).

The generator sets up the `package.json`, `tsconfig.json` and a `index.ts`, as well as configures all the necessary configurations for tooling around your package such as formatting, linting and typechecking. When the package is created, you're ready to go build out the package.

### 6. Run the tests

```bash
# Unit tests (Vitest) live in packages/validators, packages/api, apps/nextjs
pnpm -F @acme/api test
pnpm -F @acme/nextjs test
pnpm -F @acme/validators test

# Install the Chromium browser used by the e2e workspace, then run it
pnpm e2e:install
pnpm e2e
```

See [`apps/e2e/README.md`](./apps/e2e/README.md) for the workspace-level setup and commands.

## FAQ

### Where is tRPC?

This template uses [oRPC](https://orpc.unnoq.com) instead: the same end-to-end
typesafety, plus a generated OpenAPI spec (served with Scalar at `/api/docs`)
and REST-style routes for free.

### Does this pattern leak backend code to my client applications?

No, it does not. The `api` package should only be a production dependency in the Next.js application where it's served. The Expo app, and all other apps you may add in the future, should only add the `api` package as a dev dependency. This lets you have full typesafety in your client applications, while keeping your backend code safe.

If you need to share runtime code between the client and server, such as input validation schemas, use the `validators` package and import it on both sides.

### Can this app act as an OAuth/OIDC provider?

Yes. The `oauthProvider` plugin is fully wired: dynamic client registration,
consent/select-account/select-organization pages, JWKS at `/api/auth/jwks`,
and OAuth/OIDC discovery metadata under `/.well-known/`. SAML SSO (`sso`) and
SCIM provisioning (`scim`) are also enabled for enterprise scenarios.

### Where do audit logs go?

Into your own Postgres. A small `auditLog()` plugin in `packages/auth` records
auth events (sign-ins, password/2FA changes, organization activity, …) into
the `audit_log` table, and the admin dashboard lists them — no third-party
cloud involved.

## Deployment

### Next.js

#### Prerequisites

> **Note**
> Please note that the Next.js application with oRPC must be deployed in order for the Expo app to communicate with the server in a production environment.

#### Deploy to Vercel

Let's deploy the Next.js application to [Vercel](https://vercel.com). If you've never deployed a Turborepo app there, don't worry, the steps are quite straightforward. You can also read the [official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) on deploying to Vercel.

1. Create a new project on Vercel, select the `apps/nextjs` folder as the root directory. Vercel's zero-config system should handle all configurations for you.

2. Add your `POSTGRES_URL` and `AUTH_SECRET` environment variables (plus any optional S3/email variables you use).

3. Done! Your app should successfully deploy. Assign your domain and use that instead of `localhost` for the `url` in the Expo app so that your Expo app can communicate with your backend when you are not in development.

### Auth Proxy

The auth proxy comes as a better-auth plugin. This is required for the Next.js app to be able to authenticate users in preview deployments. The auth proxy is not used for OAuth request in production deployments. The easiest way to get it running is to deploy the Next.js app to vercel.

### Expo

Deploying your Expo application works slightly differently compared to Next.js on the web. Instead of "deploying" your app online, you need to submit production builds of your app to app stores, like [Apple App Store](https://www.apple.com/app-store) and [Google Play](https://play.google.com/store/apps). You can read the full [guide to distributing your app](https://docs.expo.dev/distribution/introduction), including best practices, in the Expo docs.

1. Make sure to modify the `getBaseUrl` function in `apps/expo/src/utils/base-url.ts` to point to your backend's production URL.

2. Let's start by setting up [EAS Build](https://docs.expo.dev/build/introduction), which is short for Expo Application Services. The build service helps you create builds of your app, without requiring a full native development setup. The commands below are a summary of [Creating your first build](https://docs.expo.dev/build/setup).

   ```bash
   # Install the EAS CLI
   pnpm add -g eas-cli

   # Log in with your Expo account
   eas login

   # Configure your Expo app
   cd apps/expo
   eas build:configure
   ```

3. After the initial setup, you can create your first build. You can build for Android and iOS platforms and use different [`eas.json` build profiles](https://docs.expo.dev/build-reference/eas-json) to create production builds or development, or test builds. Let's make a production build for iOS.

   ```bash
   eas build --platform ios --profile production
   ```

   > If you don't specify the `--profile` flag, EAS uses the `production` profile by default.

4. Now that you have your first production build, you can submit this to the stores. [EAS Submit](https://docs.expo.dev/submit/introduction) can help you send the build to the stores.

   ```bash
   eas submit --platform ios --latest
   ```

   > You can also combine build and submit in a single command, using `eas build ... --auto-submit`.

5. Before you can get your app in the hands of your users, you'll have to provide additional information to the app stores. This includes screenshots, app information, privacy policies, etc. _While still in preview_, [EAS Metadata](https://docs.expo.dev/eas/metadata) can help you with most of this information.

6. Once everything is approved, your users can finally enjoy your app. Let's say you spotted a small typo; you'll have to create a new build, submit it to the stores, and wait for approval before you can resolve this issue. In these cases, you can use EAS Update to quickly send a small bugfix to your users without going through this long process. Let's start by setting up EAS Update.

   The steps below summarize the [Getting started with EAS Update](https://docs.expo.dev/eas-update/getting-started/#configure-your-project) guide.

   ```bash
   # Add the `expo-updates` library to your Expo app
   cd apps/expo
   pnpm expo install expo-updates

   # Configure EAS Update
   eas update:configure
   ```

7. Before we can send out updates to your app, you have to create a new build and submit it to the app stores. For every change that includes native APIs, you have to rebuild the app and submit the update to the app stores. See steps 2 and 3.

8. Now that everything is ready for updates, let's create a new update for `production` builds. With the `--auto` flag, EAS Update uses your current git branch name and commit message for this update. See [How EAS Update works](https://docs.expo.dev/eas-update/how-eas-update-works/#publishing-an-update) for more information.

   ```bash
   cd apps/expo
   eas update --auto
   ```

   > Your OTA (Over The Air) updates must always follow the app store's rules. You can't change your app's primary functionality without getting app store approval. But this is a fast way to update your app for minor changes and bug fixes.

9. Done! Now that you have created your production build, submitted it to the stores, and installed EAS Update, you are ready for anything!

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app).

A [blog post](https://jumr.dev/blog/t3-turbo) where I wrote how to migrate a T3 app into this.
