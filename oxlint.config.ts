import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

export default defineConfig({
  ...core,
  ignorePatterns: [...(core.ignorePatterns ?? []), "oxlint.config.ts"],
  overrides: [...(core.overrides ?? []), ...(next.overrides ?? [])],
  plugins: [
    ...(core.plugins ?? []),
    ...(react.plugins ?? []),
    ...(next.plugins ?? []),
  ],
  rules: {
    ...core.rules,
    ...react.rules,
    ...next.rules,
    "@typescript-eslint/no-explicit-any": "off",
    "eslint-plugin-jest/require-hook": "off",
    // Required for deferred promise pattern (Hermes doesn't support Promise.withResolvers)
    "eslint-plugin-promise/avoid-new": "off",
    "eslint/complexity": "off",
    // Required: ultracite core has func-style config incompatible with project conventions
    "func-style": "off",
    // Use no-import-type-side-effects instead (requires `import type { X }` format)
    "import/consistent-type-specifier-style": "off",
    // Disable import/namespace - false positives with @rn-primitives packages
    "import/namespace": "off",
    // Allow relative parent imports (expo build doesn't resolve ~ alias)
    "import/no-relative-parent-imports": "off",
    "max-statements": "off",
    // Disable no-multi-comp - allows multiple components per file (shadcn pattern)
    "react/no-multi-comp": "off",
    // Required for FOUC prevention in theme detection
    "react/no-danger": "off",
    // Required for drizzle transaction type compatibility
    "require-await": "off",
    // oxfmt formats hex literals to lowercase, conflicts with this rule requiring uppercase
    "unicorn/number-literal-case": "off",
    "unicorn/no-useless-undefined": "off",
  },
});
