import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  // CI runner slots report 16 CPUs and Next.js starts one build worker per
  // CPU. A project made from this template died in its first image build
  // (psmart, 2026-11-24: "Collecting page data using 15 workers", exit 137 in
  // a 6 GiB slot). The repos that hit it earlier settled on 3.
  experimental: { cpus: 3 },
  output: "standalone",
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@acme/api",
    "@acme/auth",
    "@acme/db",
    "@acme/ui",
    "@acme/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
};

export default config;
