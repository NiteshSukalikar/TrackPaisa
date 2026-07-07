import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import type { Transaction } from "@/lib/types/finance";
import {
  createTransactionFromDraft,
  filterTransactions,
  sortTransactionsNewestFirst,
} from "@/lib/db/repositories/transactions-repository";

const transactions: Transaction[] = [
  {
    id: "salary",
    type: "income",
    amount: 90000,
    categoryId: "income-salary",
    date: "2026-07-01",
    note: "July salary",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T08:00:00.000Z",
  },
  {
    id: "late-food",
    type: "expense",
    amount: 350,
    categoryId: "expense-food",
    date: "2026-07-05",
    note: "Dinner",
    createdAt: "2026-07-05T20:00:00.000Z",
    updatedAt: "2026-07-05T20:00:00.000Z",
  },
  {
    id: "early-food",
    type: "expense",
    amount: 120,
    categoryId: "expense-food",
    date: "2026-07-05",
    note: "Breakfast",
    createdAt: "2026-07-05T08:00:00.000Z",
    updatedAt: "2026-07-05T08:00:00.000Z",
  },
];

describe("createTransactionFromDraft", () => {
  it("creates a persisted transaction shape with trimmed optional fields", () => {
    expect(
      createTransactionFromDraft(
        {
          type: "expense",
          amount: 450,
          categoryId: " expense-food ",
          date: "2026-07-07",
          note: "  lunch  ",
          walletId: "  cash  ",
        },
        new Date("2026-07-07T10:00:00.000Z"),
        () => "transaction-id",
      ),
    ).toEqual({
      id: "transaction-id",
      type: "expense",
      amount: 450,
      categoryId: "expense-food",
      date: "2026-07-07",
      note: "lunch",
      walletId: "cash",
      createdAt: "2026-07-07T10:00:00.000Z",
      updatedAt: "2026-07-07T10:00:00.000Z",
    });
  });

  it("throws validation errors for unsafe drafts", () => {
    expect(() => createTransactionFromDraft({ amount: 0 })).toThrow(
      "Type is required. Amount must be greater than 0. Category is required. Date is required.",
    );
  });
});

describe("transaction filtering helpers", () => {
  it("sorts newest transactions first and breaks same-day ties by created time", () => {
    expect(sortTransactionsNewestFirst(transactions).map((transaction) => transaction.id)).toEqual([
      "late-food",
      "early-food",
      "salary",
    ]);
  });

  it("filters by type, date range, note search, and category search", () => {
    expect(
      filterTransactions(transactions, {
        type: "expense",
        dateFrom: "2026-07-05",
        search: "food",
      }, defaultCategories).map((transaction) => transaction.id),
    ).toEqual(["late-food", "early-food"]);

    expect(
      filterTransactions(transactions, {
        dateTo: "2026-07-01",
        search: "salary",
      }, defaultCategories).map((transaction) => transaction.id),
    ).toEqual(["salary"]);
  });
});
