import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("renders every spending category in a scrollable category list", async () => {
    const monthKey = getMonthKey();

    mockedListTransactions.mockResolvedValue([
      makeExpense("rent", "expense-rent", 6000, monthKey),
      makeExpense("travel", "expense-travel", 5000, monthKey),
      makeExpense("shopping", "expense-shopping", 4000, monthKey),
      makeExpense("health", "expense-health", 3000, monthKey),
      makeExpense("family", "expense-family", 2000, monthKey),
      makeExpense("education", "expense-education", 1000, monthKey),
    ]);

    render(<OverviewDashboard />);

    expect(await screen.findByText("Where your money went")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("filters spending categories from the card search box", async () => {
    const monthKey = getMonthKey();

    mockedListTransactions.mockResolvedValue([
      makeExpense("rent", "expense-rent", 6000, monthKey),
      makeExpense("education", "expense-education", 1000, monthKey),
    ]);

    render(<OverviewDashboard />);

    const categoryList = await screen.findByRole("list", { name: "Spending categories" });

    expect(within(categoryList).getByText("Rent")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search spending categories"), {
      target: { value: "education" },
    });

    expect(within(categoryList).getByText("Education")).toBeInTheDocument();
    expect(within(categoryList).queryByText("Rent")).not.toBeInTheDocument();
  });

  it("switches the spending category card between list and pie views", async () => {
    const monthKey = getMonthKey();

    mockedListTransactions.mockResolvedValue([
      makeExpense("rent", "expense-rent", 6000, monthKey),
      makeExpense("education", "expense-education", 1000, monthKey),
    ]);

    render(<OverviewDashboard />);

    expect(await screen.findByRole("list", { name: "Spending categories" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show pie chart" }));

    expect(screen.getByRole("img", { name: "Spending category pie chart" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Spending category pie chart legend" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Search spending categories")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Spending categories" })).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole("button", { name: /Rent:/ }));

    expect(screen.getAllByText("Rent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹6,000").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Show category list" }));

    expect(screen.getByRole("list", { name: "Spending categories" })).toBeInTheDocument();
  });
});

function makeExpense(id: string, categoryId: string, amount: number, monthKey: string) {
  return {
    id,
    type: "expense" as const,
    amount,
    categoryId,
    date: `${monthKey}-07`,
    note: id,
    createdAt: `${monthKey}-07T08:00:00.000Z`,
    updatedAt: `${monthKey}-07T08:00:00.000Z`,
  };
}
