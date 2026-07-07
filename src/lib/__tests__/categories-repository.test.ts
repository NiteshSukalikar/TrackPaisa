import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import {
  createCategoryFromDraft,
  updateCategoryFromDraft,
} from "@/lib/db/repositories/categories-repository";

describe("category repository helpers", () => {
  it("creates a custom category with trimmed fields and next sort order", () => {
    expect(
      createCategoryFromDraft(
        {
          name: "  Groceries  ",
          type: "expense",
          icon: " shopping-bag ",
          color: "#16A34A",
        },
        defaultCategories,
        new Date("2026-07-07T10:00:00.000Z"),
        () => "custom-category",
      ),
    ).toEqual({
      id: "custom-category",
      name: "Groceries",
      type: "expense",
      icon: "shopping-bag",
      color: "#16A34A",
      sortOrder: 13,
      isDefault: false,
      createdAt: "2026-07-07T10:00:00.000Z",
    });
  });

  it("updates category display fields without changing identity or default status", () => {
    expect(
      updateCategoryFromDraft(defaultCategories[0], {
        name: "  Monthly Salary  ",
        type: "income",
        icon: " briefcase ",
        color: "#2563EB",
      }),
    ).toMatchObject({
      id: "income-salary",
      name: "Monthly Salary",
      type: "income",
      icon: "briefcase",
      color: "#2563EB",
      isDefault: true,
    });
  });

  it("rejects unsafe category drafts", () => {
    expect(() =>
      createCategoryFromDraft({
        name: "",
        type: "expense",
        icon: "",
        color: "green",
      }),
    ).toThrow("Name is required. Icon is required. Color must be a valid hex value.");
  });
});
