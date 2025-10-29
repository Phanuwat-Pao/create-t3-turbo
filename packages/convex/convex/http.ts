import "./polyfills";

import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { allowedOrigins } from "./origins";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth, { cors: { allowedOrigins } });

export default http;
