import { describe, expect, it } from "vitest";
import { isValidIsoDate } from "@/lib/utils/transactions";

describe("isValidIsoDate", () => {
  it("accepts real YYYY-MM-DD dates", () => {
    expect(isValidIsoDate("2026-07-07")).toBe(true);
    expect(isValidIsoDate("2028-02-29")).toBe(true);
  });

  it("rejects partial, timestamp, and impossible dates", () => {
    expect(isValidIsoDate("2026-7-7")).toBe(false);
    expect(isValidIsoDate("2026-07-07T00:00:00.000Z")).toBe(false);
    expect(isValidIsoDate("2026-02-30")).toBe(false);
  });
});
