import { desc, eq } from "@acme/db";
import { CreatePostSchema, Post } from "@acme/db/schema";
import { z } from "zod/v4";

import { protectedProcedure, publicProcedure } from "../orpc";

export default {
  all: publicProcedure
    .route({
      method: "GET",
      path: "/all",
    })
    .handler(({ context }) =>
      context.db.query.Post.findMany({
        limit: 10,
        orderBy: desc(Post.id),
      })
    ),

  byId: publicProcedure
    .route({
      method: "GET",
      path: "/byId/{id}",
    })
    .input(z.object({ id: z.string() }))
    .handler(({ context, input }) =>
      context.db.query.Post.findFirst({
        where: eq(Post.id, input.id),
      })
    ),

  create: protectedProcedure
    .route({
      method: "POST",
      path: "/create",
    })
    .input(CreatePostSchema)
    .handler(({ context, input }) => context.db.insert(Post).values(input)),

  delete: protectedProcedure
    .route({
      method: "DELETE",
      path: "/delete/{id}",
    })
    .input(z.object({ id: z.string() }))
    .handler(({ context, input }) =>
      context.db.delete(Post).where(eq(Post.id, input.id))
    ),
};
