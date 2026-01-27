import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

export function GET() {
  // open the file
  const filename = path.join(
    process.cwd(),
    "node_modules/@scalar/api-reference/dist/browser/standalone.js"
  );
  const file = fs.readFileSync(filename);
  return new Response(file, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
