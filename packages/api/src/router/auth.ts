import { protectedProcedure, publicProcedure } from "../orpc";

export const authRouter = {
  getSecretMessage: protectedProcedure.handler(() => {
    return "you can see this secret message!";
  }),
  getSession: publicProcedure.handler(({ context }) => {
    return context.session;
  }),
};
