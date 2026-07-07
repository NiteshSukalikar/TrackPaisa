"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ChartPie,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import type { Category, Transaction } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";
import {
  getReportDateRange,
  summarizeReports,
  type ReportPeriod,
} from "@/lib/utils/reports";

const periodOptions: Array<{ label: string; value: ReportPeriod }> = [
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "Last 3 months", value: "last-3-months" },
  { label: "Last 6 months", value: "last-6-months" },
  { label: "This year", value: "this-year" },
  { label: "Custom", value: "custom" },
];

export function ReportsDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>("this-month");
  const [customRange, setCustomRange] = useState(() => getReportDateRange("this-month"));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextTransactions] = await Promise.all([
          listCategories(),
          listTransactions(),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setTransactions(nextTransactions);
        }
      } catch {
        if (isMounted) {
          setError("Reports could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const report = useMemo(
    () =>
      summarizeReports(transactions, categories, {
        customRange,
        period,
      }),
    [categories, customRange, period, transactions],
  );
  const highestTrendAmount = Math.max(
    1,
    ...report.monthlyTrend.map((month) => Math.max(month.income, month.expense)),
  );
  const highestCategoryAmount = Math.max(1, ...report.categorySpend.map((category) => category.total));

  function updatePeriod(nextPeriod: ReportPeriod) {
    setPeriod(nextPeriod);

    if (nextPeriod !== "custom") {
      setCustomRange(getReportDateRange(nextPeriod));
    }
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Reports</p>
          <h2 className="mt-2 text-2xl font-bold">Where your money moved</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Compare income, expenses, categories, and monthly trends from records saved on this device.
          </p>
        </div>
      </div>

      <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <CalendarRange aria-hidden="true" size={18} />
          Period
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr_0.7fr]">
          <label className="grid gap-2 text-sm font-bold">
            Report range
            <select
              value={period}
              onChange={(event) => updatePeriod(event.target.value as ReportPeriod)}
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            From
            <input
              value={customRange.from}
              onChange={(event) => {
                setPeriod("custom");
                setCustomRange((current) => ({ ...current, from: event.target.value }));
              }}
              type="date"
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            To
            <input
              value={customRange.to}
              onChange={(event) => {
                setPeriod("custom");
                setCustomRange((current) => ({ ...current, to: event.target.value }));
              }}
              type="date"
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            />
          </label>
        </div>
      </form>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-bold text-[var(--primary)]">Loading reports</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Reading local transaction data for analytics.
          </p>
        </section>
      ) : transactions.length === 0 ? (
        <EmptyReports />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Report summary">
            <ReportStat
              icon={ArrowUpRight}
              label="Income"
              value={formatInr(report.income)}
              detail={formatComparison(report.comparison.incomeChangePercent, "previous period")}
            />
            <ReportStat
              icon={ArrowDownLeft}
              label="Expense"
              value={formatInr(report.expense)}
              detail={formatComparison(report.comparison.expenseChangePercent, "previous period")}
            />
            <ReportStat
              icon={TrendingUp}
              label="Net savings"
              value={formatInr(report.netSavings)}
              detail={`${report.savingsRate}% savings rate`}
            />
            <ReportStat
              icon={ChartPie}
              label="Top category"
              value={report.topSpendingCategory?.name ?? "None yet"}
              detail={
                report.topSpendingCategory
                  ? formatInr(report.topSpendingCategory.total)
                  : "No expenses in range"
              }
            />
          </section>

          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold text-[var(--primary)]">{report.periodLabel}</p>
                <h3 className="mt-2 text-xl font-bold">Report summary</h3>
              </div>
              <p className="text-sm text-[var(--muted)]" aria-live="polite">
                {report.transactionCount} {report.transactionCount === 1 ? "transaction" : "transactions"}
              </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              {formatReportText(report.reportText)}
            </p>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">Category breakdown</h3>
                <ChartPie aria-hidden="true" size={19} className="text-[var(--muted)]" />
              </div>

              {report.categorySpend.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  No expenses saved for this period.
                </p>
              ) : (
                <ul className="mt-4 grid gap-4">
                  {report.categorySpend.map((category) => (
                    <li key={category.categoryId} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 break-words font-bold">{category.name}</span>
                        <span className="shrink-0 text-[var(--muted)]">{formatInr(category.total)}</span>
                      </div>
                      <div
                        className="h-3 overflow-hidden rounded-lg bg-[var(--surface-muted)]"
                        role="img"
                        aria-label={`${category.name}: ${formatInr(category.total)} across ${category.count} transactions`}
                      >
                        <div
                          className="h-full rounded-lg"
                          style={{
                            backgroundColor: category.color,
                            width: `${Math.max((category.total / highestCategoryAmount) * 100, 4)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">Monthly trend</h3>
                <BarChart3 aria-hidden="true" size={19} className="text-[var(--muted)]" />
              </div>

              {report.monthlyTrend.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  No trend data is available for this period.
                </p>
              ) : (
                <ul className="mt-4 grid gap-4">
                  {report.monthlyTrend.map((month) => (
                    <li key={month.monthKey} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold">{formatMonthLabel(month.monthKey)}</span>
                        <span className="text-[var(--muted)]">
                          {formatInr(month.income)} / {formatInr(month.expense)}
                        </span>
                      </div>
                      <div
                        className="grid gap-1"
                        role="img"
                        aria-label={`${formatMonthLabel(month.monthKey)} income ${formatInr(month.income)}, expense ${formatInr(month.expense)}`}
                      >
                        <TrendBar amount={month.income} highestAmount={highestTrendAmount} tone="income" />
                        <TrendBar amount={month.expense} highestAmount={highestTrendAmount} tone="expense" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      )}
    </section>
  );
}

function ReportStat({
  detail,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  icon: typeof ArrowUpRight;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[var(--muted)]">{label}</span>
        <Icon aria-hidden="true" size={20} className="text-[var(--accent)]" />
      </div>
      <p className="mt-4 break-words text-2xl font-bold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </article>
  );
}

function TrendBar({
  amount,
  highestAmount,
  tone,
}: {
  amount: number;
  highestAmount: number;
  tone: "expense" | "income";
}) {
  return (
    <div className="h-3 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
      <div
        className="h-full rounded-lg"
        style={{
          backgroundColor: tone === "income" ? "var(--primary)" : "var(--accent)",
          width: `${amount > 0 ? Math.max((amount / highestAmount) * 100, 3) : 0}%`,
        }}
      />
    </div>
  );
}

function EmptyReports() {
  return (
    <section className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <p className="text-sm font-bold text-[var(--primary)]">No report data yet</p>
      <h3 className="mt-2 text-2xl font-bold">Add transactions to see patterns</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
        Reports will show category spending, monthly trends, and period comparisons once income and expenses are saved.
      </p>
      <a
        href="/transactions/new"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
      >
        Add transaction
      </a>
    </section>
  );
}

function formatComparison(changePercent: number, label: string) {
  if (changePercent === 0) {
    return `No change from ${label}`;
  }

  return `${Math.abs(changePercent)}% ${changePercent > 0 ? "up" : "down"} from ${label}`;
}

function formatMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

function formatReportText(value: string) {
  return value.replace(/\b\d+\b/g, (match) => Number(match).toLocaleString("en-IN"));
}
