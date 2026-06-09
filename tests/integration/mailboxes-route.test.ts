import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../src/lib/session", () => ({
  requireRole: async () => ({
    user: { id: "u1", organizationId: "org1", role: "ORG_ADMIN", email: "admin@example.com" },
  }),
}));

vi.mock("../../src/lib/db", () => ({
  connectToDatabase: async () => null,
}));

const mocks = vi.hoisted(() => {
  const Mailbox = {
    find: vi.fn(() => ({ sort: vi.fn(() => ({ lean: vi.fn(async () => [{ _id: "m1", emailAddress: "a@example.com" }]) })) })),
    findOne: vi.fn(() => ({ lean: vi.fn(async () => null) })),
    countDocuments: vi.fn(async () => 0),
    create: vi.fn(async (doc: any) => ({ _id: "m2", ...doc })),
  };

  const Domain = {
    findOne: vi.fn(() => ({ lean: vi.fn(async () => ({ _id: "d1", organizationId: "org1", domain: "example.com", status: "VERIFIED" })) })),
  };

  const Organization = {
    findById: vi.fn(() => ({ lean: vi.fn(async () => ({ _id: "org1", isActive: true, mailboxLimit: 50 })) })),
  };

  const ActivityLog = { create: vi.fn(async () => ({})) };
  return { Mailbox, Domain, Organization, ActivityLog };
});

vi.mock("../../src/models", () => ({
  Mailbox: mocks.Mailbox,
  Domain: mocks.Domain,
  Organization: mocks.Organization,
  ActivityLog: mocks.ActivityLog,
}));

import { GET, POST } from "../../src/app/api/mailboxes/route";

describe("/api/mailboxes route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns mailboxes", async () => {
    const res = await GET();
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].emailAddress).toBe("a@example.com");
  });

  it("POST creates mailbox", async () => {
    const req = new Request("http://localhost/api/mailboxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId: "d1", username: "support", displayName: "Support", password: "password123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.emailAddress).toContain("@example.com");
  });
});

