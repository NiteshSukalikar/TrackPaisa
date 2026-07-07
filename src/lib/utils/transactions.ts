import type { Transaction } from "@/lib/types/finance";

export interface TransactionSummary {
  income: number;
  expense: number;
  netSavings: number;
  savingsRate: number;
}

export function summarizeTransactions(transactions: Transaction[]): TransactionSummary {
  const summary = transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        totals.income += transaction.amount;
      } else {
        totals.expense += transaction.amount;
      }

      return totals;
    },
    { income: 0, expense: 0 },
  );

  const netSavings = summary.income - summary.expense;
  const savingsRate = summary.income > 0 ? Math.round((netSavings / summary.income) * 100) : 0;

  return {
    ...summary,
    netSavings,
    savingsRate,
  };
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
