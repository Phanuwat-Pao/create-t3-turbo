import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({ serviceName: "create-t3-turbo" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Before the first request: streamed pages otherwise compress about half as well (see the module).
    const { syncFlushByDefault } = await import("./server/http/streaming-gzip");
    syncFlushByDefault();
  }

  // Conditionally import if facing runtime compatibility issues
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  await import("./rpc/server");
  // }
}
