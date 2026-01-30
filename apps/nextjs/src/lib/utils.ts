export { cn } from "@acme/ui";

export async function convertImageToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte);
  }
  const base64 = btoa(binary);
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${base64}`;
}
