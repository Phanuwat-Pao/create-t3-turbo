import { protectedProcedure, publicProcedure } from "../orpc";

export const authRouter = {
  getSecretMessage: protectedProcedure.handler(
    () => "you can see this secret message!"
  ),
  getSession: publicProcedure.handler(({ context }) => context.session),
};
