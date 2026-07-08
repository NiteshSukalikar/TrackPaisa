import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OverviewDashboard } from "@/features/overview/overview-dashboard";
import { defaultCategories } from "@/lib/constants/default-categories";
import { listBudgetLimits } from "@/lib/db/repositories/advanced-tracking-repository";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import { getMonthKey } from "@/lib/utils/transactions";

vi.mock("@/lib/db/repositories/advanced-tracking-repository", () => ({
  listBudgetLimits: vi.fn(),
}));

vi.mock("@/lib/db/repositories/categories-repository", () => ({
  listCategories: vi.fn(),
  seedDefaultCategories: vi.fn(),
}));

vi.mock("@/lib/db/repositories/transactions-repository", () => ({
  listTransactions: vi.fn(),
}));

const mockedListBudgetLimits = vi.mocked(listBudgetLimits);
const mockedListCategories = vi.mocked(listCategories);
const mockedListTransactions = vi.mocked(listTransactions);
const mockedSeedDefaultCategories = vi.mocked(seedDefaultCategories);

describe("OverviewDashboard", () => {
  beforeEach(() => {
    const monthKey = getMonthKey();

    mockedListBudgetLimits.mockReset();
    mockedListCategories.mockReset();
    mockedListTransactions.mockReset();
    mockedSeedDefaultCategories.mockReset();

    mockedSeedDefaultCategories.mockResolvedValue(false);
    mockedListCategories.mockResolvedValue(defaultCategories);
    mockedListBudgetLimits.mockResolvedValue([]);
    mockedListTransactions.mockResolvedValue([
      {
        id: "salary",
        type: "income",
        amount: 190000,
        categoryId: "income-salary",
        date: `${monthKey}-01`,
        note: "Salary",
        createdAt: `${monthKey}-01T08:00:00.000Z`,
        updatedAt: `${monthKey}-01T08:00:00.000Z`,
      },
      {
        id: "food",
        type: "expense",
        amount: 2400,
        categoryId: "expense-food",
        date: `${monthKey}-07`,
        note: "Groceries",
        createdAt: `${monthKey}-07T08:00:00.000Z`,
        updatedAt: `${monthKey}-07T08:00:00.000Z`,
      },
    ]);
  });

  it("renders monthly trend and category chart sections from local transactions", async () => {
    render(<OverviewDashboard />);

    expect(await screen.findByText("Monthly spending trend")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Monthly spending trend ending/i })).toBeInTheDocument();
    expect(screen.getByText("Where your money went")).toBeInTheDocument();
    expect(screen.getAllByText("Food").length).toBeGreaterThan(0);
    expect(screen.getByText("Recent transactions")).toBeInTheDocument();
    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
  });
});
