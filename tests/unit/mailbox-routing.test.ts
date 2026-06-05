import { describe, expect, it } from "vitest";
import { checkMailboxQuota, estimateEmailBytes } from "../../src/lib/mailbox-routing";

describe("mailbox-routing", () => {
  it("estimateEmailBytes returns positive bytes", () => {
    const bytes = estimateEmailBytes({ subject: "Hi", bodyText: "Plain", bodyHtml: "<p>Html</p>" });
    expect(bytes).toBeGreaterThan(0);
  });

  it("checkMailboxQuota blocks when exceeded", () => {
    const res = checkMailboxQuota({ storageUsedBytes: 9, storageLimitBytes: 10 }, 2);
    expect(res.allowed).toBe(false);
  });

  it("checkMailboxQuota allows when within limit", () => {
    const res = checkMailboxQuota({ storageUsedBytes: 9, storageLimitBytes: 20 }, 2);
    expect(res.allowed).toBe(true);
  });
});

