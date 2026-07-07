import { describe, expect, it } from "vitest";
import { validateTransactionDraft } from "@/lib/utils/validation";

describe("validateTransactionDraft", () => {
  it("accepts a complete income or expense draft", () => {
    expect(
      validateTransactionDraft({
        type: "expense",
        amount: 750,
        categoryId: "expense-food",
        date: "2026-07-07",
      }),
    ).toEqual({ valid: true, errors: [] });
  });

  it("rejects missing or unsafe transaction values", () => {
    const result = validateTransactionDraft({
      amount: 0,
      date: "not-a-date",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      "Type is required.",
      "Amount must be greater than 0.",
      "Category is required.",
      "Date is required.",
    ]);
  });
});
