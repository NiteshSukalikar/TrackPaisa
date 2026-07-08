"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChartPie,
  CircleAlert,
  ListChecks,
  PiggyBank,
  Search,
  Wallet,
} from "lucide-react";
import React from "react";
import { useEffect, useMemo, useState } from "react";
import { EmptyOverview } from "@/features/overview/empty-overview";
import { listBudgetLimits } from "@/lib/db/repositories/advanced-tracking-repository";
import {
  listCategories,
  seedDefaultCategories,
} from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import type { BudgetLimit, Category, Transaction } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";
import {
  type CategorySpendSummary,
  summarizeBudgetUsage,
  summarizeTransactions,
} from "@/lib/utils/transactions";

type OverviewRangeId =
  | "this-week"
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months";

const overviewRangeOptions: Array<{ id: OverviewRangeId; label: string; shortLabel: string }> = [
  { id: "this-week", label: "This week", shortLabel: "Week" },
  { id: "this-month", label: "This month", shortLabel: "Month" },
  { id: "last-month", label: "Last month", shortLabel: "Last" },
  { id: "last-3-months", label: "Last 3 months", shortLabel: "3M" },
  { id: "last-6-months", label: "Last 6 months", shortLabel: "6M" },
  { id: "last-12-months", label: "Last 1 year", shortLabel: "1Y" },
];

export function OverviewDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categorySpendView, setCategorySpendView] = useState<"list" | "pie">(
    "list",
  );
  const [activePieCategoryId, setActivePieCategoryId] = useState<string | null>(
    null,
  );
  const [selectedRangeId, setSelectedRangeId] =
    useState<OverviewRangeId>("this-month");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextTransactions, nextBudgets] =
          await Promise.all([
            listCategories(),
            listTransactions(),
            listBudgetLimits(),
          ]);

        if (isMounted) {
          setCategories(nextCategories);
          setTransactions(nextTransactions);
          setBudgets(nextBudgets);
        }
      } catch {
        if (isMounted) {
          setError("Dashboard data could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const selectedRange = useMemo(
    () => getOverviewDateRange(selectedRangeId),
    [selectedRangeId],
  );
  const dashboard = useMemo(
    () => summarizeRangeDashboard(transactions, categories, selectedRange),
    [transactions, categories, selectedRange],
  );
  const filteredCategorySpend = useMemo(() => {
    const search = categorySearch.trim().toLocaleLowerCase("en-IN");

    if (!search) {
      return dashboard.categorySpend;
    }

    return dashboard.categorySpend.filter((category) =>
      category.name.toLocaleLowerCase("en-IN").includes(search),
    );
  }, [categorySearch, dashboard.categorySpend]);
  const categoryPieTotal = useMemo(
    () =>
      dashboard.categorySpend.reduce(
        (total, category) => total + category.total,
        0,
      ),
    [dashboard.categorySpend],
  );
  const categoryPieSlices = useMemo(
    () => buildCategoryPieSlices(dashboard.categorySpend, categoryPieTotal),
    [dashboard.categorySpend, categoryPieTotal],
  );
  const categoryInsight = useMemo(
    () => getCategorySpendInsight(dashboard.categorySpend, categoryPieTotal),
    [dashboard.categorySpend, categoryPieTotal],
  );
  const activePieCategory =
    dashboard.categorySpend.find(
      (category) => category.categoryId === activePieCategoryId,
    ) ?? null;
  const budgetUsage = useMemo(
    () =>
      summarizeBudgetUsage(
        transactions,
        categories,
        budgets,
        selectedRange.budgetMonthKey,
      ),
    [transactions, categories, budgets, selectedRange.budgetMonthKey],
  );
  const expenseTrend = useMemo(
    () => getExpenseTrend(transactions, categories, selectedRange),
    [transactions, categories, selectedRange],
  );
  const highestTrendExpense = Math.max(
    1,
    ...expenseTrend.map((point) => point.expense),
  );
  const trendInsight = useMemo(
    () => getTrendInsight(expenseTrend, selectedRange),
    [expenseTrend, selectedRange],
  );
  const periodLabel = selectedRange.label;

  if (isLoading) {
    return (
      <section className="section-card">
        <p className="eyebrow">Overview</p>
        <h2 className="heading-lg">Loading your month</h2>
        <p className="copy">
          Reading income and expenses saved on this device.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid gap-4">
        <div
          role="alert"
        className="status-alert border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]"
        >
          {error}
        </div>
        <EmptyOverview />
      </section>
    );
  }

  if (transactions.length === 0) {
    return <EmptyOverview />;
  }

  const statCards = [
    {
      label: "Income",
      value: formatInr(dashboard.income),
      detail: periodLabel,
      icon: ArrowUpRight,
    },
    {
      label: "Expense",
      value: formatInr(dashboard.expense),
      detail: periodLabel,
      icon: ArrowDownLeft,
    },
    {
      label: "Net savings",
      value: formatInr(dashboard.netSavings),
      detail: `${dashboard.savingsRate}% savings rate`,
      icon: PiggyBank,
    },
    {
      label: "Top category",
      value: dashboard.topSpendingCategory?.name ?? "None yet",
      detail: dashboard.topSpendingCategory
        ? formatInr(dashboard.topSpendingCategory.total)
        : `No expenses in ${periodLabel.toLocaleLowerCase("en-IN")}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <p className="eyebrow">
            Your money at a glance
          </p>
          <h2 className="heading-xl">
            {periodLabel}
          </h2>
          <p className="copy">
            Totals are calculated from transactions stored locally on this
            device.
          </p>
        </div>
        <a
          href="/transactions/new"
          className="primary-action"
        >
          <ListChecks aria-hidden="true" size={18} />
          Add transaction
        </a>
      </section>

      <section className="section-card grid gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">Insights range</p>
            <h3 className="mt-2 text-lg font-extrabold">
              Filter spending trend and category mix
            </h3>
          </div>
          <div
            className="flex gap-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Overview date range"
          >
            {overviewRangeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selectedRangeId === option.id}
                onClick={() => {
                  setSelectedRangeId(option.id);
                  setCategorySearch("");
                  setActivePieCategoryId(null);
                }}
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-extrabold text-[var(--muted)] transition aria-selected:bg-[var(--surface)] aria-selected:text-[var(--primary)] aria-selected:shadow-sm sm:text-sm"
              >
                <span className="sm:hidden">{option.shortLabel}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Showing transactions from {formatDisplayDate(selectedRange.from)} to{" "}
          {formatDisplayDate(selectedRange.to)}.
        </p>
      </section>

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Monthly dashboard summary"
      >
        {statCards.map((stat) => (
          <article
            key={stat.label}
            className="stat-card"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-extrabold text-[var(--muted)]">
                {stat.label}
              </span>
              <stat.icon
                aria-hidden="true"
                size={20}
                className="text-[var(--accent)]"
              />
            </div>
            <p className="mt-4 break-words text-2xl font-extrabold tracking-[-0.02em]">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {stat.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="section-card">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">
                {periodLabel}
              </p>
              <h3 className="mt-2 text-lg font-extrabold">Monthly spending trend</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="pill">
                {selectedRange.trendKind === "daily"
                  ? "Daily"
                  : selectedRange.trendKind === "weekly"
                    ? "Weekly"
                    : "Monthly"}
              </span>
              <span className="pill">
                Expenses
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <div className="subtle-panel">
              <p className="text-sm font-bold text-[var(--muted)]">
                {periodLabel} expense
              </p>
              <p className="mt-2 text-2xl font-extrabold">
                {formatInr(dashboard.expense)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {trendInsight.comparisonText}
              </p>
            </div>
            <div className="subtle-panel">
              <p className="text-sm font-bold text-[var(--muted)]">
                Main driver
              </p>
              <p className="mt-2 truncate text-lg font-extrabold">
                {trendInsight.current.topCategoryName ??
                  "No expense yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {trendInsight.driverText}
              </p>
            </div>
          </div>

          <div
            className="subtle-panel mt-3 grid min-h-72 gap-4 px-3 pb-4 pt-5"
            role="img"
            aria-label={`Spending trend for ${periodLabel}. ${trendInsight.accessibleSummary}`}
          >
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <span className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-bold text-[var(--muted)]">
                Avg: {formatInr(trendInsight.averageExpense)}
              </span>
              <span className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-bold text-[var(--muted)]">
                Peak: {trendInsight.peak.label} {formatInr(trendInsight.peak.expense)}
              </span>
              <span className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 font-bold text-[var(--muted)]">
                {dashboard.transactionCount} records
              </span>
            </div>
            <div className="relative flex h-52 items-end gap-3 overflow-hidden rounded-lg bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-muted)_64%,transparent),transparent)] px-3 pb-8 pt-4">
              <div
                aria-hidden="true"
                className="absolute left-3 right-3 border-t border-dashed border-[var(--muted)]/50"
                style={{
                  bottom: `${32 + Math.min((trendInsight.averageExpense / highestTrendExpense) * 100, 100) * 1.44}px`,
                }}
              />
              <span
                aria-hidden="true"
                className="absolute right-0 rounded bg-[var(--surface)] px-2 text-[0.68rem] font-bold text-[var(--muted)]"
                style={{
                  bottom: `${28 + Math.min((trendInsight.averageExpense / highestTrendExpense) * 100, 100) * 1.44}px`,
                }}
              >
                avg
              </span>
              {expenseTrend.map((point) => {
                const heightPercent =
                  point.expense > 0
                    ? Math.max(
                        (point.expense / highestTrendExpense) * 100,
                        12,
                      )
                    : 4;
                const isCurrentPoint = point.key === trendInsight.current.key;
                const isPeakPoint =
                  point.key === trendInsight.peak.key && point.expense > 0;

                return (
                  <div
                    key={point.key}
                    className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span
                      className={`max-w-full truncate text-[0.68rem] font-bold ${point.expense > 0 ? "text-[var(--text)]" : "text-[var(--muted)]"}`}
                    >
                      {point.expense > 0
                        ? formatCompactInr(point.expense)
                        : "-"}
                    </span>
                    <div
                      className={`relative w-full rounded-t-lg rounded-b-sm ${
                        isCurrentPoint
                          ? "bg-[var(--primary)] ring-2 ring-[var(--primary)]/30"
                          : point.expense > 0
                            ? "bg-[var(--accent)]/80"
                            : "bg-[var(--border)]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${point.longLabel}: ${formatInr(point.expense)}`}
                    >
                      <span className="sr-only">
                        {point.longLabel} expense {formatInr(point.expense)}
                        {isCurrentPoint ? ", selected period" : ""}
                        {isPeakPoint ? ", highest period" : ""}
                      </span>
                    </div>
                    <span
                      className={`absolute bottom-[-1.55rem] text-xs font-bold ${isCurrentPoint ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
                    >
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {trendInsight.recordedPointCount <= 1 ? (
                <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-6 text-[var(--muted)]">
                Only {trendInsight.current.label} has saved expenses in this
                view, so this is a starting point rather than a real trend yet.
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--muted)]">
            <CircleAlert
              aria-hidden="true"
              size={18}
              className="mt-0.5 shrink-0 text-[var(--accent)]"
            />
            <p>{trendInsight.storyText}</p>
          </div>
        </article>

        <article className="section-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">Where your money went</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                {formatInr(categoryPieTotal)} across{" "}
                {dashboard.categorySpend.length} categories
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setCategorySpendView((view) =>
                  view === "list" ? "pie" : "list",
                )
              }
              aria-label={
                categorySpendView === "list"
                  ? "Show pie chart"
                  : "Show category list"
              }
              title={
                categorySpendView === "list"
                  ? "Show pie chart"
                  : "Show category list"
              }
              className="icon-action h-9 w-9 outline-none hover:text-[var(--text)]"
            >
              {categorySpendView === "list" ? (
                <ChartPie aria-hidden="true" size={18} />
              ) : (
                <ListChecks aria-hidden="true" size={18} />
              )}
            </button>
          </div>

          {dashboard.categorySpend.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              No expenses saved for {periodLabel.toLocaleLowerCase("en-IN")} yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4">
              <div className="subtle-panel">
                <p className="text-sm font-bold text-[var(--muted)]">
                  Spending concentration
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {categoryInsight.summary}
                </p>
              </div>
              {categorySpendView === "pie" ? (
                <div className="subtle-panel grid justify-items-center gap-4">
                  <div className="relative grid aspect-square w-full max-w-64 place-items-center">
                    <svg
                      role="img"
                      aria-label="Spending category pie chart"
                      className="h-full w-full -rotate-90 overflow-visible [filter:drop-shadow(0_14px_24px_rgb(15_23_42_/_0.12))]"
                      viewBox="0 0 100 100"
                      onMouseLeave={() => setActivePieCategoryId(null)}
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(event.relatedTarget)
                        ) {
                          setActivePieCategoryId(null);
                        }
                      }}
                    >
                      <circle
                        aria-hidden="true"
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="var(--surface-muted)"
                        strokeWidth="16"
                      />
                      {categoryPieSlices.map((slice) => (
                        <circle
                          key={slice.category.categoryId}
                          role="button"
                          tabIndex={0}
                          aria-label={`${slice.category.name}: ${formatInr(slice.category.total)}, ${Math.round(slice.percent)}%`}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={slice.category.color}
                          strokeWidth="16"
                          strokeLinecap="round"
                          pathLength="100"
                          strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
                          strokeDashoffset={-slice.startPercent}
                          className="cursor-pointer outline-none transition-all duration-300 ease-out hover:opacity-90 focus:opacity-90"
                          style={{
                            transform:
                              activePieCategoryId === slice.category.categoryId
                                ? "scale(1.035)"
                                : "scale(1)",
                            transformBox: "fill-box",
                            transformOrigin: "center",
                          }}
                          onMouseEnter={() =>
                            setActivePieCategoryId(slice.category.categoryId)
                          }
                          onFocus={() =>
                            setActivePieCategoryId(slice.category.categoryId)
                          }
                        />
                      ))}
                    </svg>
                    <div className="pointer-events-none absolute grid h-28 w-28 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-center shadow-sm transition duration-300">
                      <span className="text-xs font-bold text-[var(--muted)]">
                        {activePieCategory ? activePieCategory.name : "Total"}
                      </span>
                      <span className="max-w-24 truncate text-sm font-extrabold">
                        {formatInr(
                          activePieCategory?.total ?? categoryPieTotal,
                        )}
                      </span>
                      <span className="text-xs font-bold text-[var(--muted)]">
                        {activePieCategory
                          ? `${Math.round((activePieCategory.total / categoryPieTotal) * 100)}%`
                          : "This month"}
                      </span>
                    </div>
                  </div>
                  <ul
                    aria-label="Spending category pie chart legend"
                    className="grid w-full gap-2"
                  >
                    {dashboard.categorySpend.slice(0, 5).map((category) => (
                      <li
                        key={category.categoryId}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-sm shadow-sm"
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate font-bold">
                          {category.name}
                        </span>
                        <span className="font-semibold text-[var(--muted)]">
                          {Math.round(
                            (category.total / categoryPieTotal) * 100,
                          )}
                          %
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <label className="sr-only" htmlFor="category-spend-search">
                    Search spending categories
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      size={16}
                    />
                    <input
                      id="category-spend-search"
                      value={categorySearch}
                      onChange={(event) =>
                        setCategorySearch(event.target.value)
                      }
                      placeholder="Search categories"
                      className="field-control min-h-10 py-2 pl-9 pr-3 text-sm font-semibold"
                    />
                  </div>

                  {filteredCategorySpend.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-sm leading-6 text-[var(--muted)]">
                      No matching categories.
                    </p>
                  ) : (
                    <ul
                      aria-label="Spending categories"
                      className="grid max-h-[27.5rem] gap-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]"
                    >
                      {filteredCategorySpend.map((category) => (
                        <li
                          key={category.categoryId}
                          className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-bold">
                              {category.name}
                            </span>
                            <span className="shrink-0 text-[var(--muted)]">
                              {formatInr(category.total)}
                            </span>
                          </div>
                          <div className="progress-track h-2">
                            <div
                              className="h-full rounded-lg"
                              style={{
                                width: `${Math.max((category.total / dashboard.expense) * 100, 4)}%`,
                                backgroundColor: category.color,
                              }}
                            />
                          </div>
                          <p className="text-xs font-semibold text-[var(--muted)]">
                            {Math.round(
                              (category.total / categoryPieTotal) * 100,
                            )}
                            % of {periodLabel.toLocaleLowerCase("en-IN")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </article>

        <article className="section-card xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Recent transactions</h3>
            <div className="flex items-center gap-3">
              <BarChart3
                aria-hidden="true"
                size={19}
                className="text-[var(--muted)]"
              />
              <a
                href="/transactions"
                className="text-sm font-bold text-[var(--primary)]"
              >
                View all
              </a>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-[var(--border)]">
            {dashboard.recentTransactions.map((transaction) => {
              const category = categoriesById.get(transaction.categoryId);
              const isIncome = transaction.type === "income";

              return (
                <li
                  key={transaction.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-bold">
                      {category?.name ?? "Uncategorized"}
                    </p>
                    <p className="mt-1 truncate text-sm text-[var(--muted)]">
                      {formatTransactionDate(transaction.date)}
                      {transaction.note ? ` - ${transaction.note}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">
                    {isIncome ? "+" : "-"}
                    {formatInr(transaction.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        </article>
      </section>

      {budgetUsage.length > 0 ? (
        <section className="section-card">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Budget watch</h3>
            <a
              href="/advanced"
              className="text-sm font-bold text-[var(--primary)]"
            >
              Manage
            </a>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {budgetUsage.slice(0, 4).map((usage) => (
              <li
                key={usage.budget.id}
                className="subtle-panel grid gap-2"
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold">{usage.categoryName}</span>
                  <span
                    className={
                      usage.isOverLimit
                        ? "font-bold text-[var(--danger)]"
                        : "text-[var(--muted)]"
                    }
                  >
                    {usage.percentUsed}%
                  </span>
                </div>
                <div className="progress-track h-2">
                  <div
                    className="h-full rounded-lg bg-[var(--primary)]"
                    style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {formatInr(usage.spent)} of {formatInr(usage.budget.amount)}
                  {usage.isOverLimit
                    ? " spent, over limit"
                    : ` spent, ${formatInr(usage.remaining)} left`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

interface OverviewDateRange {
  budgetMonthKey: string;
  from: string;
  id: OverviewRangeId;
  label: string;
  to: string;
  trendKind: "daily" | "monthly" | "weekly";
}

interface RangeDashboardSummary {
  categorySpend: CategorySpendSummary[];
  expense: number;
  income: number;
  netSavings: number;
  recentTransactions: Transaction[];
  savingsRate: number;
  topSpendingCategory?: CategorySpendSummary;
  transactionCount: number;
}

interface ExpenseTrendPoint {
  expense: number;
  expenseCount: number;
  key: string;
  label: string;
  longLabel: string;
  topCategoryName?: string;
  topCategoryTotal: number;
}

function getOverviewDateRange(rangeId: OverviewRangeId, today = new Date()): OverviewDateRange {
  const current = startOfDay(today);
  const currentMonthStart = new Date(current.getFullYear(), current.getMonth(), 1);
  const currentMonthKey = getMonthKeyFromDate(currentMonthStart);

  if (rangeId === "this-week") {
    const from = startOfWeek(current);

    return {
      budgetMonthKey: currentMonthKey,
      from: toIsoDate(from),
      id: rangeId,
      label: "This week",
      to: toIsoDate(current),
      trendKind: "daily",
    };
  }

  if (rangeId === "last-month") {
    const from = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const to = new Date(current.getFullYear(), current.getMonth(), 0);

    return {
      budgetMonthKey: getMonthKeyFromDate(from),
      from: toIsoDate(from),
      id: rangeId,
      label: "Last month",
      to: toIsoDate(to),
      trendKind: "weekly",
    };
  }

  if (rangeId === "last-3-months" || rangeId === "last-6-months" || rangeId === "last-12-months") {
    const monthCount =
      rangeId === "last-3-months" ? 3 : rangeId === "last-6-months" ? 6 : 12;
    const from = new Date(current.getFullYear(), current.getMonth() - (monthCount - 1), 1);

    return {
      budgetMonthKey: currentMonthKey,
      from: toIsoDate(from),
      id: rangeId,
      label:
        rangeId === "last-3-months"
          ? "Last 3 months"
          : rangeId === "last-6-months"
            ? "Last 6 months"
            : "Last 1 year",
      to: toIsoDate(current),
      trendKind: "monthly",
    };
  }

  return {
    budgetMonthKey: currentMonthKey,
    from: toIsoDate(currentMonthStart),
    id: rangeId,
    label: "This month",
    to: toIsoDate(current),
    trendKind: "weekly",
  };
}

function summarizeRangeDashboard(
  transactions: Transaction[],
  categories: Category[],
  range: OverviewDateRange,
): RangeDashboardSummary {
  const rangeTransactions = filterTransactionsByRange(transactions, range);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const spendByCategory = new Map<string, CategorySpendSummary>();

  for (const transaction of rangeTransactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const category = categoryById.get(transaction.categoryId);
    const existing = spendByCategory.get(transaction.categoryId);

    spendByCategory.set(transaction.categoryId, {
      categoryId: transaction.categoryId,
      color: category?.color ?? "#64748B",
      count: (existing?.count ?? 0) + 1,
      name: category?.name ?? "Uncategorized",
      total: (existing?.total ?? 0) + transaction.amount,
    });
  }

  const categorySpend = [...spendByCategory.values()].sort((first, second) => {
    if (second.total !== first.total) {
      return second.total - first.total;
    }

    return first.name.localeCompare(second.name);
  });

  return {
    ...summarizeTransactions(rangeTransactions),
    categorySpend,
    recentTransactions: sortTransactionsNewestFirst(rangeTransactions).slice(0, 5),
    topSpendingCategory: categorySpend[0],
    transactionCount: rangeTransactions.length,
  };
}

function filterTransactionsByRange(transactions: Transaction[], range: OverviewDateRange) {
  return transactions.filter(
    (transaction) => transaction.date >= range.from && transaction.date <= range.to,
  );
}

function getExpenseTrend(
  transactions: Transaction[],
  categories: Category[],
  range: OverviewDateRange,
): ExpenseTrendPoint[] {
  if (range.trendKind === "daily") {
    return getDailyExpenseTrend(transactions, categories, range);
  }

  if (range.trendKind === "weekly") {
    return getWeeklyExpenseTrend(transactions, categories, range);
  }

  return getMonthlyExpenseTrendForRange(transactions, categories, range);
}

function getDailyExpenseTrend(
  transactions: Transaction[],
  categories: Category[],
  range: OverviewDateRange,
) {
  const from = parseIsoDate(range.from);
  const to = parseIsoDate(range.to);
  const dayCount = Math.max(1, daysBetween(from, to) + 1);

  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(from, index);
    const isoDate = toIsoDate(date);

    return buildExpenseTrendPoint({
      categories,
      key: isoDate,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      longLabel: formatDisplayDate(isoDate),
      transactions: transactions.filter((transaction) => transaction.date === isoDate),
    });
  });
}

function getWeeklyExpenseTrend(
  transactions: Transaction[],
  categories: Category[],
  range: OverviewDateRange,
) {
  const from = parseIsoDate(range.from);
  const to = parseIsoDate(range.to);
  const points: ExpenseTrendPoint[] = [];
  let weekStart = new Date(from);
  let weekIndex = 1;

  while (weekStart <= to) {
    const weekEnd = new Date(Math.min(addDays(weekStart, 6).getTime(), to.getTime()));
    const fromIso = toIsoDate(weekStart);
    const toIso = toIsoDate(weekEnd);

    points.push(
      buildExpenseTrendPoint({
        categories,
        key: `${fromIso}_${toIso}`,
        label: `W${weekIndex}`,
        longLabel: `${formatDisplayDate(fromIso)} - ${formatDisplayDate(toIso)}`,
        transactions: transactions.filter(
          (transaction) => transaction.date >= fromIso && transaction.date <= toIso,
        ),
      }),
    );

    weekStart = addDays(weekStart, 7);
    weekIndex += 1;
  }

  return points;
}

function getMonthlyExpenseTrendForRange(
  transactions: Transaction[],
  categories: Category[],
  range: OverviewDateRange,
) {
  const from = parseIsoDate(range.from);
  const to = parseIsoDate(range.to);
  const points: ExpenseTrendPoint[] = [];
  let monthCursor = new Date(from.getFullYear(), from.getMonth(), 1);

  while (monthCursor <= to) {
    const monthStart = new Date(monthCursor);
    const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const fromIso = toIsoDate(monthStart);
    const toIso = toIsoDate(new Date(Math.min(monthEnd.getTime(), to.getTime())));
    const monthKey = getMonthKeyFromDate(monthCursor);

    points.push(
      buildExpenseTrendPoint({
        categories,
        key: monthKey,
        label: formatShortMonthLabel(monthKey),
        longLabel: formatMonthLabel(monthKey),
        transactions: transactions.filter(
          (transaction) => transaction.date >= fromIso && transaction.date <= toIso,
        ),
      }),
    );

    monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
  }

  return points;
}

function buildExpenseTrendPoint({
  categories,
  key,
  label,
  longLabel,
  transactions,
}: {
  categories: Category[];
  key: string;
  label: string;
  longLabel: string;
  transactions: Transaction[];
}): ExpenseTrendPoint {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const categorySpend = new Map<string, number>();
  const expense = expenses.reduce((total, transaction) => {
    categorySpend.set(
      transaction.categoryId,
      (categorySpend.get(transaction.categoryId) ?? 0) + transaction.amount,
    );

    return total + transaction.amount;
  }, 0);
  const topCategory = [...categorySpend.entries()].sort(
    (first, second) => second[1] - first[1],
  )[0];

  return {
    expense,
    expenseCount: expenses.length,
    key,
    label,
    longLabel,
    topCategoryName: topCategory
      ? (categoryById.get(topCategory[0])?.name ?? "Uncategorized")
      : undefined,
    topCategoryTotal: topCategory?.[1] ?? 0,
  };
}

function getTrendInsight(trend: ExpenseTrendPoint[], range: OverviewDateRange) {
  const current = trend[trend.length - 1] ?? {
    expense: 0,
    expenseCount: 0,
    key: range.to,
    label: range.label,
    longLabel: range.label,
    topCategoryTotal: 0,
  };
  const previous = trend.length > 1 ? trend[trend.length - 2] : undefined;
  const recordedPointCount = trend.filter((point) => point.expense > 0).length;
  const averageExpense =
    trend.length > 0
      ? Math.round(
          trend.reduce((total, point) => total + point.expense, 0) / trend.length,
        )
      : 0;
  const peak = trend.reduce(
    (highest, point) => (point.expense > highest.expense ? point : highest),
    trend[0] ?? current,
  );

  let comparisonText = "No previous period expense is available yet.";

  if (previous && previous.expense > 0 && current.expense > 0) {
    const difference = current.expense - previous.expense;
    const percent = Math.round((Math.abs(difference) / previous.expense) * 100);

    comparisonText =
      difference === 0
        ? `Same as ${previous.longLabel}.`
        : `${formatInr(Math.abs(difference))} ${difference > 0 ? "higher" : "lower"} than ${previous.longLabel} (${percent}%).`;
  } else if (previous && previous.expense > 0) {
    comparisonText = `No ${current.longLabel} expense yet; ${previous.longLabel} was ${formatInr(previous.expense)}.`;
  } else if (current.expense > 0) {
    comparisonText = "This is the first period in the trend with saved expenses.";
  }

  const driverText = current.topCategoryName
    ? `${formatInr(current.topCategoryTotal)} from ${current.topCategoryName}.`
    : `Add an expense in ${range.label.toLocaleLowerCase("en-IN")} to see what is driving the period.`;
  const storyText =
    current.expense === 0
      ? `${range.label} has no expenses saved, so the chart cannot explain a spending pattern yet.`
      : `${current.longLabel} is ${current.key === peak.key ? "the highest point" : `below the ${peak.label} peak`} and ${current.expense >= averageExpense ? "above" : "below"} the selected-range average. ${driverText}`;
  const accessibleSummary =
    current.expense === 0
      ? `${range.label} has no saved expenses.`
      : `${current.longLabel} expense is ${formatInr(current.expense)} across ${current.expenseCount} entries. Peak is ${peak.longLabel} at ${formatInr(peak.expense)}.`;

  return {
    averageExpense,
    comparisonText,
    current,
    driverText,
    peak,
    recordedPointCount,
    storyText,
    accessibleSummary,
  };
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

function formatMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

function formatShortMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

function formatCompactInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
    style: "currency",
    currency: "INR",
  }).format(value);
}

function buildCategoryPieSlices(
  categories: CategorySpendSummary[],
  total: number,
) {
  if (categories.length === 0 || total <= 0) {
    return [];
  }

  let startPercent = 0;

  return categories.map((category, index) => {
    const percent =
      index === categories.length - 1
        ? 100 - startPercent
        : (category.total / total) * 100;
    const slice = {
      category,
      percent,
      startPercent,
    };

    startPercent += percent;

    return slice;
  });
}

function getCategorySpendInsight(
  categories: CategorySpendSummary[],
  total: number,
) {
  if (categories.length === 0 || total <= 0) {
    return {
      summary: "No expense categories are available for this month yet.",
    };
  }

  const topCategory = categories[0];
  const topThreeTotal = categories
    .slice(0, 3)
    .reduce((categoryTotal, category) => categoryTotal + category.total, 0);
  const topCategoryPercent = Math.round((topCategory.total / total) * 100);
  const topThreePercent = Math.round((topThreeTotal / total) * 100);

  return {
    summary:
      categories.length === 1
        ? `${topCategory.name} explains all of this month's spending.`
        : `${topCategory.name} is the largest category at ${topCategoryPercent}%. Top 3 categories explain ${topThreePercent}% of this month.`,
  };
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function getMonthKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  return addDays(startOfDay(date), mondayOffset);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function daysBetween(from: Date, to: Date) {
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs);
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseIsoDate(value));
}
