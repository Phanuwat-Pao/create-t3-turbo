import { CreatePostSchema } from "@acme/db/schema";
import { createInstance } from "i18next";

import en from "~/i18n/en.json";
import th from "~/i18n/th.json";

import { createPostFormSchema } from "./create-post-schema";

const i18n = createInstance();
await i18n.init({
  lng: "th",
  resources: { en: { translation: en }, th: { translation: th } },
});

const LONGEST = "x".repeat(256);
const TOO_LONG = "x".repeat(257);

describe("createPostFormSchema", () => {
  const schema = createPostFormSchema(i18n.t);

  it.each([
    { content: "", title: "" },
    { content: "Hello", title: "Hi" },
    { content: LONGEST, title: LONGEST },
    { content: TOO_LONG, title: "Hi" },
    { content: "Hello", title: TOO_LONG },
    { content: "Hello" },
    { title: "Hi" },
    { content: 1, title: "Hi" },
  ])("accepts and rejects what CreatePostSchema does: %o", (input) => {
    expect(schema.safeParse(input).success).toBe(
      CreatePostSchema.safeParse(input).success
    );
  });

  it("explains the length limits in the page's language", () => {
    const result = schema.safeParse({ content: TOO_LONG, title: TOO_LONG });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      th.validation.contentMaxLength,
      th.validation.titleMaxLength,
    ]);
  });
});
