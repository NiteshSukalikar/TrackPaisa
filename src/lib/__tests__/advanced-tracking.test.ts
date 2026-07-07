import { describe, expect, it } from "vitest";
import {
  createBudgetLimit,
  createRecurringTemplate,
  getNextRecurringDate,
} from "@/lib/db/repositories/advanced-tracking-repository";
import { defaultCategories } from "@/lib/constants/default-categories";
import type { Transaction } from "@/lib/types/finance";
import { summarizeBudgetUsage } from "@/lib/utils/transactions";

describe("advanced tracking helpers", () => {
  it("creates budget limits and summarizes current month usage", () => {
    const budget = createBudgetLimit(
      {
        categoryId: "expense-food",
        amount: 1000,
        monthKey: "2026-07",
      },
      new Date("2026-07-07T10:00:00.000Z"),
    );
    const transactions: Transaction[] = [
      {
        id: "expense-1",
        type: "expense",
        amount: 650,
        categoryId: "expense-food",
        date: "2026-07-05",
        createdAt: "2026-07-05T10:00:00.000Z",
        updatedAt: "2026-07-05T10:00:00.000Z",
      },
    ];

    expect(summarizeBudgetUsage(transactions, defaultCategories, [budget], "2026-07")).toMatchObject([
      {
        categoryName: "Food",
        spent: 650,
        remaining: 350,
        percentUsed: 65,
        isOverLimit: false,
      },
    ]);
  });

  it("creates recurring templates and advances the next date", () => {
    expect(
      createRecurringTemplate(
        {
          type: "income",
          amount: 90000,
          categoryId: "income-salary",
          frequency: "monthly",
          nextDate: "2026-07-01",
          note: " Salary ",
          tags: [" monthly ", "monthly"],
        },
        new Date("2026-07-07T10:00:00.000Z"),
        () => "template-id",
      ),
    ).toMatchObject({
      id: "template-id",
      note: "Salary",
      tags: ["monthly"],
    });

    expect(getNextRecurringDate("2026-07-01", "monthly")).toBe("2026-08-01");
    expect(getNextRecurringDate("2026-07-01", "weekly")).toBe("2026-07-08");
  });
});
