export const storageKeys = {
  all: () => ["storage"] as const,
  downloadUrl: (key: string) =>
    [...storageKeys.all(), "download-url", key] as const,
  multipartUpload: (uploadId: string) =>
    [...storageKeys.all(), "multipart-upload", uploadId] as const,
  uploadUrl: () => [...storageKeys.all(), "upload-url"] as const,
};
