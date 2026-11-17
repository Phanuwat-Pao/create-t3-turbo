import type { TFunction } from "i18next";
import * as z from "zod";

/**
 * The post form's schema: the rules of `CreatePostSchema` from `@acme/db`,
 * with messages in the page's language. The API still validates with
 * `CreatePostSchema`, so change both together; the test compares them.
 */
export function createPostFormSchema(t: TFunction) {
  return z.object({
    content: z.string().max(256, t("validation.contentMaxLength")),
    title: z.string().max(256, t("validation.titleMaxLength")),
  });
}
