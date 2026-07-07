import type { BudgetLimit, Category, Transaction } from "@/lib/types/finance";

export interface TransactionSummary {
  income: number;
  expense: number;
  netSavings: number;
  savingsRate: number;
}

export interface CategorySpendSummary {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
}

export interface MonthlyDashboardSummary extends TransactionSummary {
  monthKey: string;
  categorySpend: CategorySpendSummary[];
  topSpendingCategory?: CategorySpendSummary;
  recentTransactions: Transaction[];
}

export interface BudgetUsageSummary {
  budget: BudgetLimit;
  categoryName: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverLimit: boolean;
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

export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function summarizeMonthlyDashboard(
  transactions: Transaction[],
  categories: Category[],
  monthKey = getMonthKey(),
): MonthlyDashboardSummary {
  const monthlyTransactions = transactions.filter((transaction) => transaction.date.startsWith(monthKey));
  const categoryNamesById = new Map(categories.map((category) => [category.id, category]));
  const spendByCategory = new Map<string, CategorySpendSummary>();

  for (const transaction of monthlyTransactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const category = categoryNamesById.get(transaction.categoryId);
    const existing = spendByCategory.get(transaction.categoryId);

    spendByCategory.set(transaction.categoryId, {
      categoryId: transaction.categoryId,
      name: category?.name ?? "Uncategorized",
      color: category?.color ?? "#64748B",
      total: (existing?.total ?? 0) + transaction.amount,
      count: (existing?.count ?? 0) + 1,
    });
  }

  const categorySpend = [...spendByCategory.values()].sort((first, second) => {
    if (second.total !== first.total) {
      return second.total - first.total;
    }

    return first.name.localeCompare(second.name);
  });

  return {
    ...summarizeTransactions(monthlyTransactions),
    monthKey,
    categorySpend,
    topSpendingCategory: categorySpend[0],
    recentTransactions: sortTransactionsNewestFirst(transactions).slice(0, 5),
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

export function summarizeBudgetUsage(
  transactions: Transaction[],
  categories: Category[],
  budgets: BudgetLimit[],
  monthKey = getMonthKey(),
): BudgetUsageSummary[] {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const monthlyExpenses = transactions.filter(
    (transaction) => transaction.type === "expense" && transaction.date.startsWith(monthKey),
  );

  return budgets
    .filter((budget) => budget.monthKey === monthKey)
    .map((budget) => {
      const spent = monthlyExpenses
        .filter((transaction) => transaction.categoryId === budget.categoryId)
        .reduce((total, transaction) => total + transaction.amount, 0);
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        budget,
        categoryName: categoryById.get(budget.categoryId)?.name ?? "Category",
        spent,
        remaining: budget.amount - spent,
        percentUsed,
        isOverLimit: spent > budget.amount,
      };
    })
    .sort((first, second) => second.percentUsed - first.percentUsed);
}

function sortTransactionsNewestFirst(transactions: Transaction[]) {
  return [...transactions].sort((first, second) => {
    const dateComparison = second.date.localeCompare(first.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return second.createdAt.localeCompare(first.createdAt);
  });
}
