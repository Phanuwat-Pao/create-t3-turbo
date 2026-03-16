import type { RouterInputs, RouterOutputs } from "@acme/api";

import { orpcClient } from "~/rpc/client";
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

export async function requestCreateUploadUrl(
  input: CreateUploadUrlInput
): Promise<CreateUploadUrlOutput> {
  return orpcClient.storage.createUploadUrl(input);
}

export async function requestCreateMultipartUpload(
  input: CreateMultipartUploadInput
): Promise<CreateMultipartUploadOutput> {
  return orpcClient.storage.createMultipartUpload(input);
}

export async function requestSignMultipartPart(
  input: SignMultipartPartInput
): Promise<SignMultipartPartOutput> {
  return orpcClient.storage.signMultipartPart(input);
}

export async function requestCompleteMultipartUpload(
  input: CompleteMultipartUploadInput
): Promise<CompleteMultipartUploadOutput> {
  return orpcClient.storage.completeMultipartUpload(input);
}

export async function requestAbortMultipartUpload(
  input: AbortMultipartUploadInput
): Promise<AbortMultipartUploadOutput> {
  return orpcClient.storage.abortMultipartUpload(input);
}

export async function requestDownloadUrl(
  input: GetDownloadUrlInput
): Promise<GetDownloadUrlOutput> {
  return orpcClient.storage.getDownloadUrl(input);
}
