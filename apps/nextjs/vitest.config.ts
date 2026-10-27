import path from "node:path";

// Write `import.meta.dirname` out each time. Vite bundles this file into
// node_modules/.vite-temp before running it and rewrites only that literal to
// this folder, so a destructured `import.meta` gives the temp folder instead.
export default {
  resolve: {
    alias: {
      "~": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    // One transform cache per package. Vitest 5 shares one across the
    // workspace and wipes it when the lockfile changes, so packages testing at
    // the same time could fail at startup with ENOTEMPTY.
    fsModuleCachePath: `${import.meta.dirname}/node_modules/.vitest-cache`,
    globals: true,
    server: {
      deps: {
        // Its ESM build imports `next/server` without an extension, which
        // only a bundler resolves; let Vite load it instead of Node.
        inline: ["next-i18next"],
      },
    },
    setupFiles: ["./vitest.setup.ts"],
  },
};
