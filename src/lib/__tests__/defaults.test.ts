import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import { defaultSettings } from "@/lib/constants/default-settings";

describe("default app data", () => {
  it("seeds income and expense categories", () => {
    expect(defaultCategories.some((category) => category.type === "income")).toBe(true);
    expect(defaultCategories.some((category) => category.type === "expense")).toBe(true);
    expect(new Set(defaultCategories.map((category) => category.id)).size).toBe(
      defaultCategories.length,
    );
  });

  it("keeps settings local-first and INR-only for MVP", () => {
    expect(defaultSettings).toMatchObject({
      currency: "INR",
      theme: "system",
      colorTheme: "green-blue",
    });
  });
});
