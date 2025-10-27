import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  post: defineTable({
    title: v.string(),
    content: v.string(),
    updatedAt: v.optional(v.number()),
    createdAt: v.number(),
  }),
});
