import { describe, expect, it } from "vitest";

import { getCallbackURL } from "./shared";

const callbackFor = (callbackUrl?: string) =>
  getCallbackURL(
    new URLSearchParams(callbackUrl === undefined ? {} : { callbackUrl })
  );

describe("getCallbackURL", () => {
  it("defaults to the dashboard", () => {
    expect(callbackFor()).toBe("/dashboard");
    expect(callbackFor("")).toBe("/dashboard");
  });

  it("returns allowed paths", () => {
    expect(callbackFor("/dashboard")).toBe("/dashboard");
    expect(callbackFor("/device")).toBe("/device");
  });

  it("keeps the device user code through sign-in", () => {
    expect(callbackFor("/device?user_code=ABCD1234")).toBe(
      "/device?user_code=ABCD1234"
    );
  });

  it("drops parameters a path does not allow", () => {
    expect(callbackFor("/device?user_code=ABCD1234&next=/admin")).toBe(
      "/device?user_code=ABCD1234"
    );
    expect(callbackFor("/dashboard?user_code=ABCD1234")).toBe("/dashboard");
  });

  it("rejects other paths and other origins", () => {
    expect(callbackFor("/admin")).toBe("/dashboard");
    expect(callbackFor("https://evil.example/device")).toBe("/dashboard");
    expect(callbackFor("//evil.example/device")).toBe("/dashboard");
    expect(callbackFor("/\\evil.example/device")).toBe("/dashboard");
  });
});
