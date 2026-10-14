import path from "node:path";

const { dirname } = import.meta;

export default {
  resolve: {
    alias: {
      "~": path.resolve(dirname, "./src"),
    },
  },
  test: {
    environment: "node",
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
