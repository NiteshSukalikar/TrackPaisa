import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import type { Transaction } from "@/lib/types/finance";
import {
  createBackup,
  createBackupPreview,
  mergeBackupData,
  parseBackupJson,
} from "@/lib/utils/backup";

const transaction: Transaction = {
  id: "transaction-1",
  type: "expense",
  amount: 500,
  categoryId: "expense-food",
  date: "2026-07-07",
  createdAt: "2026-07-07T10:00:00.000Z",
  updatedAt: "2026-07-07T10:00:00.000Z",
};

describe("backup utilities", () => {
  it("creates and parses a supported JSON backup", () => {
    const backup = createBackup(
      {
        categories: defaultCategories,
        settings: {
          currency: "INR",
          theme: "system",
          colorTheme: "green-blue",
          firstDayOfMonth: 1,
        },
        transactions: [transaction],
        wallets: [],
      },
      "2026-07-07T12:00:00.000Z",
    );

    expect(parseBackupJson(JSON.stringify(backup))).toEqual(backup);
  });

  it("rejects invalid backup data before import", () => {
    expect(() =>
      parseBackupJson(
        JSON.stringify({
          format: "trackpaisa-backup",
          version: 1,
          exportedAt: "bad-date",
          data: {
            transactions: [{ ...transaction, amount: 0 }],
            categories: [],
            wallets: [],
            settings: { currency: "USD", theme: "system", colorTheme: "green-blue" },
          },
        }),
      ),
    ).toThrow("Backup export date is missing or invalid.");
  });

  it("previews duplicate IDs against existing data", () => {
    const backup = createBackup(
      {
        categories: [defaultCategories[0]],
        settings: {
          currency: "INR",
          theme: "system",
          colorTheme: "green-blue",
        },
        transactions: [transaction],
        wallets: [],
      },
      "2026-07-07T12:00:00.000Z",
    );

    expect(
      createBackupPreview(backup, {
        categories: [defaultCategories[0]],
        transactions: [transaction],
        wallets: [],
      }),
    ).toMatchObject({
      duplicateCategoryIds: [defaultCategories[0].id],
      duplicateTransactionIds: ["transaction-1"],
      summary: {
        categories: 1,
        transactions: 1,
        wallets: 0,
      },
    });
  });

  it("supports skip, overwrite, and replace import modes", () => {
    const incoming = { ...transaction, amount: 700 };
    const backup = createBackup(
      {
        categories: [],
        settings: {
          currency: "INR",
          theme: "system",
          colorTheme: "green-blue",
        },
        transactions: [incoming],
        wallets: [],
      },
      "2026-07-07T12:00:00.000Z",
    );
    const existing = {
      categories: [],
      transactions: [transaction],
      wallets: [],
    };

    expect(mergeBackupData(backup, existing, "skip").transactions).toEqual([transaction]);
    expect(mergeBackupData(backup, existing, "overwrite").transactions).toEqual([incoming]);
    expect(mergeBackupData(backup, existing, "replace").transactions).toEqual([incoming]);
  });
});
