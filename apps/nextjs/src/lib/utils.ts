export { cn } from "@acme/ui";

export function convertImageToBase64(file: File): Promise<string> {
  const reader = new FileReader();
  const promise = new Promise<string>((resolve, reject) => {
    reader.addEventListener("loadend", () => resolve(reader.result as string));
    reader.addEventListener("error", () => reject(reader.error));
  });
  reader.readAsDataURL(file);
  return promise;
}
