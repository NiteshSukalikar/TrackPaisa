import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryManager } from "@/features/categories/category-manager";
import { defaultCategories } from "@/lib/constants/default-categories";
import {
  deleteCategory,
  getCategoryUsageCounts,
  listCategories,
  seedDefaultCategories,
  upsertCategory,
} from "@/lib/db/repositories/categories-repository";

vi.mock("@/lib/db/repositories/categories-repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/repositories/categories-repository")>();

  return {
    ...actual,
    deleteCategory: vi.fn(),
    getCategoryUsageCounts: vi.fn(),
    listCategories: vi.fn(),
    seedDefaultCategories: vi.fn(),
    upsertCategory: vi.fn(),
  };
});

const mockedDeleteCategory = vi.mocked(deleteCategory);
const mockedGetCategoryUsageCounts = vi.mocked(getCategoryUsageCounts);
const mockedListCategories = vi.mocked(listCategories);
const mockedSeedDefaultCategories = vi.mocked(seedDefaultCategories);
const mockedUpsertCategory = vi.mocked(upsertCategory);

const visibleCategories = [
  defaultCategories.find((category) => category.id === "expense-food")!,
  defaultCategories.find((category) => category.id === "income-salary")!,
];

describe("CategoryManager", () => {
  beforeEach(() => {
    mockedDeleteCategory.mockReset();
    mockedGetCategoryUsageCounts.mockReset();
    mockedListCategories.mockReset();
    mockedSeedDefaultCategories.mockReset();
    mockedUpsertCategory.mockReset();

    mockedSeedDefaultCategories.mockResolvedValue(false);
    mockedListCategories.mockResolvedValue(visibleCategories);
    mockedGetCategoryUsageCounts.mockResolvedValue({ "expense-food": 2 });
    mockedUpsertCategory.mockImplementation(async (category) => category);
    mockedDeleteCategory.mockResolvedValue(undefined);
  });

  it("renders grouped categories with usage context", async () => {
    render(<CategoryManager />);

    expect(await screen.findByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText(/2 transactions/)).toBeInTheDocument();
  });

  it("adds a custom category", async () => {
    render(<CategoryManager />);

    await screen.findByText("Food");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Groceries" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "expense" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockedUpsertCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Groceries",
          type: "expense",
          isDefault: false,
        }),
      );
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Category added.");
  });

  it("updates an existing category", async () => {
    render(<CategoryManager />);

    await screen.findByText("Salary");

    fireEvent.click(screen.getByRole("button", { name: "Edit Salary category" }));
    fireEvent.change(screen.getByLabelText("Edit name"), { target: { value: "Monthly Salary" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockedUpsertCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "income-salary",
          name: "Monthly Salary",
        }),
      );
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Category updated.");
  });

  it("deletes unused categories after confirmation", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<CategoryManager />);

    await screen.findByText("Salary");

    fireEvent.click(screen.getByRole("button", { name: "Delete Salary category" }));

    await waitFor(() => {
      expect(mockedDeleteCategory).toHaveBeenCalledWith("income-salary");
    });

    expect(confirmSpy).toHaveBeenCalledWith("Delete Salary? This cannot be undone.");
    expect(await screen.findByRole("status")).toHaveTextContent("Category deleted.");

    confirmSpy.mockRestore();
  });
});
