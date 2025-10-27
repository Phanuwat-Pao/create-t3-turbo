import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const all = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.query("post").collect();
  },
});

export const byId = query({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("post", {
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("post") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }
    return await ctx.db.delete(args.id);
  },
});
