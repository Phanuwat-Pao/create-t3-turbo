import { o } from "./orpc";
import auth from "./router/auth";
import post from "./router/post";

// In oRPC, routers use prefix and router for grouping
export const appRouter = {
  auth: o.tag("auth").prefix("/auth").router(auth),
  post: o.tag("post").prefix("/post").router(post),
};

// export type definition of API
export type AppRouter = typeof appRouter;
