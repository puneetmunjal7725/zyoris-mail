import { describe, expect, it } from "vitest";
import { signupSchema, domainSchema } from "../../src/lib/validators";

describe("validators", () => {
  it("validates signup payload", () => {
    const parsed = signupSchema.safeParse({ name: "Jane", email: "jane@org.com", password: "password123", organizationName: "Org Inc" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid domain", () => {
    const parsed = domainSchema.safeParse({ organizationId: "abc", domain: "not a domain" });
    expect(parsed.success).toBe(false);
  });

  it("normalizes domain input", () => {
    const parsed = domainSchema.safeParse({ organizationId: "abc", domain: " HTTPS://Acme.COM/ " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.domain).toBe("acme.com");
  });
});
