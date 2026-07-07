import type { Category, Transaction } from "@/lib/types/finance";
import { summarizeTransactions, type CategorySpendSummary, type TransactionSummary } from "@/lib/utils/transactions";

export type ReportPeriod = "this-month" | "last-month" | "last-3-months" | "last-6-months" | "this-year" | "custom";

export interface ReportDateRange {
  from: string;
  to: string;
}

export interface ReportPeriodConfig {
  customRange?: Partial<ReportDateRange>;
  now?: Date;
  period: ReportPeriod;
}

export interface MonthlyTrendSummary extends TransactionSummary {
  monthKey: string;
}

export interface PeriodComparison {
  expenseChangePercent: number;
  incomeChangePercent: number;
  previous: TransactionSummary;
}

export interface ReportsSummary extends TransactionSummary {
  categorySpend: CategorySpendSummary[];
  comparison: PeriodComparison;
  monthlyTrend: MonthlyTrendSummary[];
  periodLabel: string;
  range: ReportDateRange;
  reportText: string;
  topSpendingCategory?: CategorySpendSummary;
  transactionCount: number;
}

export function summarizeReports(
  transactions: Transaction[],
  categories: Category[],
  config: ReportPeriodConfig,
): ReportsSummary {
  const now = config.now ?? new Date();
  const range = getReportDateRange(config.period, now, config.customRange);
  const periodTransactions = filterTransactionsByDateRange(transactions, range);
  const comparisonRange = getPreviousDateRange(config.period, range);
  const previousTransactions = filterTransactionsByDateRange(transactions, comparisonRange);
  const categorySpend = summarizeCategorySpend(periodTransactions, categories);
  const summary = summarizeTransactions(periodTransactions);
  const previous = summarizeTransactions(previousTransactions);
  const topSpendingCategory = categorySpend[0];

  return {
    ...summary,
    categorySpend,
    comparison: {
      expenseChangePercent: getChangePercent(summary.expense, previous.expense),
      incomeChangePercent: getChangePercent(summary.income, previous.income),
      previous,
    },
    monthlyTrend: summarizeMonthlyTrend(periodTransactions),
    periodLabel: getPeriodLabel(config.period, range),
    range,
    reportText: getReportText(summary, topSpendingCategory),
    topSpendingCategory,
    transactionCount: periodTransactions.length,
  };
}

export function getReportDateRange(
  period: ReportPeriod,
  now = new Date(),
  customRange: Partial<ReportDateRange> = {},
): ReportDateRange {
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (period === "custom") {
    return {
      from: customRange.from || toDateInputValue(currentMonthStart),
      to: customRange.to || toDateInputValue(now),
    };
  }

  if (period === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);

    return {
      from: toDateInputValue(start),
      to: toDateInputValue(end),
    };
  }

  if (period === "last-3-months" || period === "last-6-months") {
    const months = period === "last-3-months" ? 3 : 6;
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    return {
      from: toDateInputValue(start),
      to: toDateInputValue(now),
    };
  }

  if (period === "this-year") {
    return {
      from: `${now.getFullYear()}-01-01`,
      to: toDateInputValue(now),
    };
  }

  return {
    from: toDateInputValue(currentMonthStart),
    to: toDateInputValue(now),
  };
}

export function filterTransactionsByDateRange(transactions: Transaction[], range: ReportDateRange) {
  const [from, to] = normalizeDateRange(range);

  return transactions.filter((transaction) => transaction.date >= from && transaction.date <= to);
}

export function summarizeCategorySpend(transactions: Transaction[], categories: Category[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const spendByCategory = new Map<string, CategorySpendSummary>();

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const category = categoryById.get(transaction.categoryId);
    const existing = spendByCategory.get(transaction.categoryId);

    spendByCategory.set(transaction.categoryId, {
      categoryId: transaction.categoryId,
      name: category?.name ?? "Uncategorized",
      color: category?.color ?? "#64748B",
      total: (existing?.total ?? 0) + transaction.amount,
      count: (existing?.count ?? 0) + 1,
    });
  }

  return [...spendByCategory.values()].sort((first, second) => {
    if (second.total !== first.total) {
      return second.total - first.total;
    }

    return first.name.localeCompare(second.name);
  });
}

export function summarizeMonthlyTrend(transactions: Transaction[]) {
  const monthKeys = [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))].sort();

  return monthKeys.map((monthKey) => ({
    monthKey,
    ...summarizeTransactions(transactions.filter((transaction) => transaction.date.startsWith(monthKey))),
  }));
}

function getPreviousDateRange(period: ReportPeriod, range: ReportDateRange): ReportDateRange {
  const [from, to] = normalizeDateRange(range);

  if (period !== "custom") {
    const rangeStart = parseDateInputValue(from);

    if (period === "this-year") {
      return {
        from: `${rangeStart.getFullYear() - 1}-01-01`,
        to: `${rangeStart.getFullYear() - 1}-12-31`,
      };
    }

    const months = period === "last-3-months" ? 3 : period === "last-6-months" ? 6 : 1;
    const previousStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth() - months, 1);
    const previousEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 0);

    return {
      from: toDateInputValue(previousStart),
      to: toDateInputValue(previousEnd),
    };
  }

  const start = parseDateInputValue(from);
  const end = parseDateInputValue(to);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -(days - 1));

  return {
    from: toDateInputValue(previousStart),
    to: toDateInputValue(previousEnd),
  };
}

function getChangePercent(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return Math.round(((current - previous) / previous) * 100);
}

function getPeriodLabel(period: ReportPeriod, range: ReportDateRange) {
  if (period === "this-month") {
    return "This month";
  }

  if (period === "last-month") {
    return "Last month";
  }

  if (period === "last-3-months") {
    return "Last 3 months";
  }

  if (period === "last-6-months") {
    return "Last 6 months";
  }

  if (period === "this-year") {
    return "This year";
  }

  return `${formatShortDate(range.from)} to ${formatShortDate(range.to)}`;
}

function getReportText(summary: TransactionSummary, topSpendingCategory?: CategorySpendSummary) {
  if (summary.income === 0 && summary.expense === 0) {
    return "No transactions found for this period.";
  }

  if (!topSpendingCategory) {
    return `Income was ${summary.income} with no expenses saved in this period.`;
  }

  return `${topSpendingCategory.name} is the top expense category, with ${summary.savingsRate}% savings rate for this period.`;
}

function normalizeDateRange(range: ReportDateRange): [string, string] {
  return range.from <= range.to ? [range.from, range.to] : [range.to, range.from];
}

function addDays(date: Date, days: number) {
  const next = new Date(date);

  next.setDate(next.getDate() + days);

  return next;
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDateInputValue(value));
}
