import { describe, expect, it } from "vitest";
import { randomOtpCode, sha256 } from "../../src/lib/env";

describe("security primitives", () => {
  it("hashes values consistently", () => {
    expect(sha256("hello")).toBe(sha256("hello"));
  });

  it("creates 6 digit otp", () => {
    expect(randomOtpCode()).toMatch(/^\d{6}$/);
  });
});
