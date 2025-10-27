import { getStaticAuth } from "@convex-dev/better-auth";
import { doc } from "convex-helpers/validators";
import { v } from "convex/values";

import { createAuth } from "../auth";
import { query } from "./_generated/server";
import schema from "./schema";

// Export a static instance for Better Auth schema generation
export const auth = getStaticAuth(createAuth);

// Example of an in-component function
// Feel free to edit, omit, etc.
export const getUser = query({
  args: { userId: v.id("user") },
  returns: v.union(v.null(), doc(schema, "user")),
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});
