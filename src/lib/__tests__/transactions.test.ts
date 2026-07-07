import { describe, expect, it } from "vitest";
import type { Transaction } from "@/lib/types/finance";
import { summarizeTransactions } from "@/lib/utils/transactions";

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
