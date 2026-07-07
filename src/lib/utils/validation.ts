import type { TransactionType } from "@/lib/types/finance";
import { isValidIsoDate } from "@/lib/utils/transactions";

export interface TransactionDraft {
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  date?: string;
}

export function validateTransactionDraft(draft: TransactionDraft) {
  const errors: string[] = [];

  if (draft.type !== "income" && draft.type !== "expense") {
    errors.push("Type is required.");
  }

  if (typeof draft.amount !== "number" || !Number.isFinite(draft.amount) || draft.amount <= 0) {
    errors.push("Amount must be greater than 0.");
  }

  if (!draft.categoryId) {
    errors.push("Category is required.");
  }

  if (!draft.date || !isValidIsoDate(draft.date)) {
    errors.push("Date is required.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
