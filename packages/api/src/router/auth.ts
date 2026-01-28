import { protectedProcedure, publicProcedure } from "../orpc";

export default {
  getSecretMessage: protectedProcedure
    .route({
      method: "GET",
      path: "/getSecretMessage",
    })
    .handler(() => "you can see this secret message!"),
  getSession: publicProcedure
    .route({
      method: "GET",
      path: "/getSession",
    })
    .handler(({ context }) => context.session),
};
