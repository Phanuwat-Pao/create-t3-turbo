import { protectedProcedure } from "@acme/api/procedures";
import {
  CompleteMultipartUploadRequestSchema,
  DownloadUrlRequestSchema,
  MultipartUploadRequestSchema,
  SignMultipartPartRequestSchema,
  SingleUploadRequestSchema,
} from "@acme/validators";
import { z } from "zod/v4";

const AbortMultipartUploadRequestSchema = z.object({
  key: z.string().trim().min(1),
  uploadId: z.string().trim().min(1),
});

export default {
  abortMultipartUpload: protectedProcedure
    .route({
      method: "POST",
      path: "/multipart/abort",
    })
    .input(AbortMultipartUploadRequestSchema)
    .handler(({ context, input }) =>
      context.s3.abortMultipartUpload({
        ...input,
        userId: context.session.user.id,
      })
    ),

  completeMultipartUpload: protectedProcedure
    .route({
      method: "POST",
      path: "/multipart/complete",
    })
    .input(CompleteMultipartUploadRequestSchema)
    .handler(({ context, input }) =>
      context.s3.completeMultipartUpload({
        ...input,
        userId: context.session.user.id,
      })
    ),

  createMultipartUpload: protectedProcedure
    .route({
      method: "POST",
      path: "/multipart",
    })
    .input(MultipartUploadRequestSchema)
    .handler(({ context, input }) =>
      context.s3.createMultipartUpload({
        ...input,
        userId: context.session.user.id,
      })
    ),

  createUploadUrl: protectedProcedure
    .route({
      method: "POST",
      path: "/upload-url",
    })
    .input(SingleUploadRequestSchema)
    .handler(({ context, input }) =>
      context.s3.createUploadUrl({
        ...input,
        userId: context.session.user.id,
      })
    ),

  getDownloadUrl: protectedProcedure
    .route({
      method: "POST",
      path: "/download-url",
    })
    .input(DownloadUrlRequestSchema)
    .handler(({ context, input }) =>
      context.s3.getDownloadUrl({
        ...input,
        userId: context.session.user.id,
      })
    ),

  signMultipartPart: protectedProcedure
    .route({
      method: "POST",
      path: "/multipart/part",
    })
    .input(SignMultipartPartRequestSchema)
    .handler(({ context, input }) =>
      context.s3.signMultipartPart({
        ...input,
        userId: context.session.user.id,
      })
    ),
};
