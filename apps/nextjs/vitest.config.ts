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
    setupFiles: ["./vitest.setup.ts"],
  },
};
