import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // One transform cache per package. Vitest 5 shares one across the
    // workspace and wipes it when the lockfile changes, so packages testing at
    // the same time could fail at startup with ENOTEMPTY.
    fsModuleCachePath: `${import.meta.dirname}/node_modules/.vitest-cache`,
    globals: true,
  },
});
