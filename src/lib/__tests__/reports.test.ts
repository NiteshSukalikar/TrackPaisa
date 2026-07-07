import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import type { Transaction } from "@/lib/types/finance";
import {
  filterTransactionsByDateRange,
  getReportDateRange,
  summarizeReports,
} from "@/lib/utils/reports";

const now = new Date("2026-07-07T12:00:00.000Z");

const transactions: Transaction[] = [
  transaction("salary-july", "income", 90000, "income-salary", "2026-07-01"),
  transaction("food-july", "expense", 12000, "expense-food", "2026-07-02"),
  transaction("rent-july", "expense", 30000, "expense-rent", "2026-07-03"),
  transaction("salary-june", "income", 85000, "income-salary", "2026-06-01"),
  transaction("food-june", "expense", 10000, "expense-food", "2026-06-02"),
  transaction("travel-june", "expense", 5000, "expense-travel", "2026-06-05"),
  transaction("shopping-may", "expense", 7000, "expense-shopping", "2026-05-12"),
];

describe("getReportDateRange", () => {
  it("returns inclusive ranges for supported report periods", () => {
    expect(getReportDateRange("this-month", now)).toEqual({
      from: "2026-07-01",
      to: "2026-07-07",
    });
    expect(getReportDateRange("last-month", now)).toEqual({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(getReportDateRange("last-3-months", now)).toEqual({
      from: "2026-05-01",
      to: "2026-07-07",
    });
    expect(getReportDateRange("this-year", now)).toEqual({
      from: "2026-01-01",
      to: "2026-07-07",
    });
  });

  it("uses provided custom range values", () => {
    expect(
      getReportDateRange("custom", now, {
        from: "2026-06-01",
        to: "2026-06-15",
      }),
    ).toEqual({
      from: "2026-06-01",
      to: "2026-06-15",
    });
  });
});

describe("filterTransactionsByDateRange", () => {
  it("filters inclusively and normalizes reversed custom dates", () => {
    expect(
      filterTransactionsByDateRange(transactions, {
        from: "2026-07-03",
        to: "2026-07-01",
      }).map((item) => item.id),
    ).toEqual(["salary-july", "food-july", "rent-july"]);
  });
});

describe("summarizeReports", () => {
  it("summarizes totals, ranked categories, trends, and previous period comparison", () => {
    const report = summarizeReports(transactions, defaultCategories, {
      now,
      period: "this-month",
    });

    expect(report.income).toBe(90000);
    expect(report.expense).toBe(42000);
    expect(report.netSavings).toBe(48000);
    expect(report.savingsRate).toBe(53);
    expect(report.transactionCount).toBe(3);
    expect(report.topSpendingCategory).toMatchObject({
      categoryId: "expense-rent",
      name: "Rent",
      total: 30000,
    });
    expect(report.categorySpend.map((category) => category.categoryId)).toEqual([
      "expense-rent",
      "expense-food",
    ]);
    expect(report.monthlyTrend).toEqual([
      {
        monthKey: "2026-07",
        income: 90000,
        expense: 42000,
        netSavings: 48000,
        savingsRate: 53,
      },
    ]);
    expect(report.comparison.previous).toMatchObject({
      income: 85000,
      expense: 15000,
    });
    expect(report.comparison.expenseChangePercent).toBe(180);
  });

  it("includes multiple months in long period trend reports", () => {
    const report = summarizeReports(transactions, defaultCategories, {
      now,
      period: "last-3-months",
    });

    expect(report.monthlyTrend.map((month) => month.monthKey)).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
    ]);
    expect(report.expense).toBe(64000);
  });
});

function transaction(
  id: string,
  type: Transaction["type"],
  amount: number,
  categoryId: string,
  date: string,
): Transaction {
  return {
    id,
    type,
    amount,
    categoryId,
    date,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  };
}
