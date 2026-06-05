import { describe, expect, it } from "vitest";
import { GET } from "../../src/app/api/health/route";

describe("health route", () => {
  it("returns ok response", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
