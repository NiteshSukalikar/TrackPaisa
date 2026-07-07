import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import type { Transaction } from "@/lib/types/finance";
import { getMonthKey, summarizeMonthlyDashboard, summarizeTransactions } from "@/lib/utils/transactions";

const transactions: Transaction[] = [
  {
    id: "salary",
    type: "income",
    amount: 90000,
    categoryId: "income-salary",
    date: "2026-07-01",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "groceries",
    type: "expense",
    amount: 12000,
    categoryId: "expense-food",
    date: "2026-07-02",
    createdAt: "2026-07-02T08:00:00.000Z",
    updatedAt: "2026-07-02T08:00:00.000Z",
  },
  {
    id: "travel",
    type: "expense",
    amount: 8000,
    categoryId: "expense-travel",
    date: "2026-07-03",
    createdAt: "2026-07-03T08:00:00.000Z",
    updatedAt: "2026-07-03T08:00:00.000Z",
  },
];

describe("summarizeTransactions", () => {
  it("calculates income, expense, net savings, and savings rate", () => {
    expect(summarizeTransactions(transactions)).toEqual({
      income: 90000,
      expense: 20000,
      netSavings: 70000,
      savingsRate: 78,
    });
  });

  it("returns zero savings rate when there is no income", () => {
    expect(summarizeTransactions([]).savingsRate).toBe(0);
  });
});

describe("summarizeMonthlyDashboard", () => {
  it("summarizes only the selected month and ranks expense categories", () => {
    const dashboard = summarizeMonthlyDashboard(
      [
        ...transactions,
        {
          id: "rent",
          type: "expense",
          amount: 30000,
          categoryId: "expense-rent",
          date: "2026-07-04",
          createdAt: "2026-07-04T08:00:00.000Z",
          updatedAt: "2026-07-04T08:00:00.000Z",
        },
        {
          id: "old-groceries",
          type: "expense",
          amount: 99999,
          categoryId: "expense-food",
          date: "2026-06-29",
          createdAt: "2026-06-29T08:00:00.000Z",
          updatedAt: "2026-06-29T08:00:00.000Z",
        },
      ],
      defaultCategories,
      "2026-07",
    );

    expect(dashboard.income).toBe(90000);
    expect(dashboard.expense).toBe(50000);
    expect(dashboard.netSavings).toBe(40000);
    expect(dashboard.savingsRate).toBe(44);
    expect(dashboard.topSpendingCategory).toMatchObject({
      categoryId: "expense-rent",
      name: "Rent",
      total: 30000,
      count: 1,
    });
    expect(dashboard.categorySpend.map((category) => category.categoryId)).toEqual([
      "expense-rent",
      "expense-food",
      "expense-travel",
    ]);
  });

  it("keeps recent transactions sorted across all available records", () => {
    const dashboard = summarizeMonthlyDashboard(transactions, defaultCategories, "2026-07");

    expect(dashboard.recentTransactions.map((transaction) => transaction.id)).toEqual([
      "travel",
      "groceries",
      "salary",
    ]);
  });
});

describe("getMonthKey", () => {
  it("formats a date as a yyyy-mm key", () => {
    expect(getMonthKey(new Date("2026-07-07T12:00:00.000Z"))).toBe("2026-07");
  });
});
