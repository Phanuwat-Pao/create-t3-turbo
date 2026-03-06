import { o } from "./orpc";

// In oRPC, routers use prefix and router for grouping
export const appRouter = {
  auth: o
    .tag("auth")
    .prefix("/auth")
    .lazy(() => import("./router/auth")),
  health: o
    .tag("health")
    .prefix("/health")
    .lazy(() => import("./router/health")),
  post: o
    .tag("post")
    .prefix("/post")
    .lazy(() => import("./router/post")),
};

// export type definition of API
export type AppRouter = typeof appRouter;
