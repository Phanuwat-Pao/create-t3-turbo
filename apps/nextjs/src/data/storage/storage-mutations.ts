import type { RouterInputs, RouterOutputs } from "@acme/api";

import { orpc } from "~/rpc/react";

export type CreateUploadUrlInput = RouterInputs["storage"]["createUploadUrl"];
export type CreateUploadUrlOutput = RouterOutputs["storage"]["createUploadUrl"];
export type CreateMultipartUploadInput =
  RouterInputs["storage"]["createMultipartUpload"];
export type CreateMultipartUploadOutput =
  RouterOutputs["storage"]["createMultipartUpload"];
export type SignMultipartPartInput =
  RouterInputs["storage"]["signMultipartPart"];
export type SignMultipartPartOutput =
  RouterOutputs["storage"]["signMultipartPart"];
export type CompleteMultipartUploadInput =
  RouterInputs["storage"]["completeMultipartUpload"];
export type CompleteMultipartUploadOutput =
  RouterOutputs["storage"]["completeMultipartUpload"];
export type AbortMultipartUploadInput =
  RouterInputs["storage"]["abortMultipartUpload"];
export type AbortMultipartUploadOutput =
  RouterOutputs["storage"]["abortMultipartUpload"];
export type GetDownloadUrlInput = RouterInputs["storage"]["getDownloadUrl"];
export type GetDownloadUrlOutput = RouterOutputs["storage"]["getDownloadUrl"];

export function createUploadUrlMutationOptions(
  ...args: Parameters<typeof orpc.storage.createUploadUrl.mutationOptions>
) {
  return orpc.storage.createUploadUrl.mutationOptions(...args);
}

export function createMultipartUploadMutationOptions(
  ...args: Parameters<typeof orpc.storage.createMultipartUpload.mutationOptions>
) {
  return orpc.storage.createMultipartUpload.mutationOptions(...args);
}

export function signMultipartPartMutationOptions(
  ...args: Parameters<typeof orpc.storage.signMultipartPart.mutationOptions>
) {
  return orpc.storage.signMultipartPart.mutationOptions(...args);
}

export function completeMultipartUploadMutationOptions(
  ...args: Parameters<
    typeof orpc.storage.completeMultipartUpload.mutationOptions
  >
) {
  return orpc.storage.completeMultipartUpload.mutationOptions(...args);
}

export function abortMultipartUploadMutationOptions(
  ...args: Parameters<typeof orpc.storage.abortMultipartUpload.mutationOptions>
) {
  return orpc.storage.abortMultipartUpload.mutationOptions(...args);
}

export function getDownloadUrlMutationOptions(
  ...args: Parameters<typeof orpc.storage.getDownloadUrl.mutationOptions>
) {
  return orpc.storage.getDownloadUrl.mutationOptions(...args);
}
