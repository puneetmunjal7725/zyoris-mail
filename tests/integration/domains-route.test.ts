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
  const Domain = {
    find: vi.fn(() => ({ sort: vi.fn(() => ({ lean: vi.fn(async () => []) })) })),
    findOne: vi.fn(() => ({ lean: vi.fn(async (): Promise<any> => null) })),
    countDocuments: vi.fn(async () => 0),
    create: vi.fn(async (doc: any) => ({
      _id: "d1",
      toObject: () => ({ _id: "d1", ...doc, status: "PENDING" }),
      ...doc,
    })),
  };

  const Organization = {
    findById: vi.fn(() => ({ lean: vi.fn(async () => ({ _id: "org1", isActive: true, domainLimit: 1 })) })),
  };

  const ActivityLog = { create: vi.fn(async () => ({})) };
  return { Domain, Organization, ActivityLog };
});

vi.mock("../../src/models", () => ({
  Domain: mocks.Domain,
  Organization: mocks.Organization,
  ActivityLog: mocks.ActivityLog,
}));

import { POST } from "../../src/app/api/domains/route";

describe("/api/domains POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates domain", async () => {
    const req = new Request("http://localhost/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: "org1", domain: "acme.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.domain).toBe("acme.com");
  });

  it("rejects invalid domain", async () => {
    const req = new Request("http://localhost/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: "org1", domain: "not a domain" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Please enter a valid domain");
  });

  it("rejects duplicate domain in org", async () => {
    mocks.Domain.findOne.mockImplementationOnce(() => ({
      lean: vi.fn(async () => ({ _id: "d9", domain: "acme.com" })),
    }));
    const req = new Request("http://localhost/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: "org1", domain: "acme.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBe("This domain is already connected");
  });

  it("rejects domain limit", async () => {
    mocks.Domain.countDocuments.mockResolvedValueOnce(1);
    const req = new Request("http://localhost/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: "org1", domain: "acme.com" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("You have reached your domain limit");
  });
});
