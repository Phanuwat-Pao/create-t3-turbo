import { definePlugin } from "@oxlint/plugins";

import { noEmDash } from "./no-em-dash.ts";
import { requireSuppressionReason } from "./require-suppression-reason.ts";

// Repo rules that oxlint and Ultracite lack, loaded through `jsPlugins` in
// the root oxlint.config.ts. Both rules come from pingdotgg/t3code (MIT).
export default definePlugin({
  meta: { name: "acme" },
  rules: {
    "no-em-dash": noEmDash,
    "require-suppression-reason": requireSuppressionReason,
  },
});
