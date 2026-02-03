export const dynamic = "force-static";

export async function GET() {
  // Fetch scalar standalone script from CDN
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/@scalar/api-reference/dist/browser/standalone.min.js"
  );
  const file = await response.text();
  return new Response(file, {
    headers: {
      "Content-Type": "text/javascript",
    },
  });
}
