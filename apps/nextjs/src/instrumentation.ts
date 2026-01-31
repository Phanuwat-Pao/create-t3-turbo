import { registerOTel } from "@vercel/otel";

export async function register() {
  registerOTel({ serviceName: "create-t3-turbo" });

  // Conditionally import if facing runtime compatibility issues
  // if (process.env.NEXT_RUNTIME === "nodejs") {
  await import("./rpc/server");
  // }
}
