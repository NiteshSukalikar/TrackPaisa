"use client";

import { ArrowDownLeft, ArrowUpRight, CalendarDays, ListChecks, PiggyBank, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyOverview } from "@/features/overview/empty-overview";
import { listBudgetLimits } from "@/lib/db/repositories/advanced-tracking-repository";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import type { BudgetLimit, Category, Transaction } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";
import { summarizeBudgetUsage, summarizeMonthlyDashboard } from "@/lib/utils/transactions";

export function OverviewDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextTransactions, nextBudgets] = await Promise.all([
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
  const dashboard = useMemo(
    () => summarizeMonthlyDashboard(transactions, categories),
    [transactions, categories],
  );
  const budgetUsage = useMemo(
    () => summarizeBudgetUsage(transactions, categories, budgets, dashboard.monthKey),
    [transactions, categories, budgets, dashboard.monthKey],
  );
  const monthLabel = formatMonthLabel(dashboard.monthKey);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-bold text-[var(--primary)]">Overview</p>
        <h2 className="mt-2 text-2xl font-bold">Loading your month</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Reading income and expenses saved on this device.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid gap-4">
        <div role="alert" className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">
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
      detail: monthLabel,
      icon: ArrowUpRight,
    },
    {
      label: "Expense",
      value: formatInr(dashboard.expense),
      detail: monthLabel,
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
        : "No expenses this month",
      icon: Wallet,
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Your month at a glance</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{monthLabel}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Totals are calculated from transactions stored locally on this device.
          </p>
        </div>
        <a
          href="/transactions/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
        >
          <ListChecks aria-hidden="true" size={18} />
          Add transaction
        </a>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Monthly dashboard summary">
        {statCards.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[var(--muted)]">{stat.label}</span>
              <stat.icon aria-hidden="true" size={20} className="text-[var(--accent)]" />
            </div>
            <p className="mt-4 break-words text-2xl font-bold">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Where your money went</h3>
            <CalendarDays aria-hidden="true" size={19} className="text-[var(--muted)]" />
          </div>

          {dashboard.categorySpend.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              No expenses saved for this month yet.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {dashboard.categorySpend.slice(0, 5).map((category) => (
                <li key={category.categoryId} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold">{category.name}</span>
                    <span className="text-[var(--muted)]">{formatInr(category.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-lg"
                      style={{
                        width: `${Math.max((category.total / dashboard.expense) * 100, 4)}%`,
                        backgroundColor: category.color,
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
            <h3 className="text-lg font-bold">Recent transactions</h3>
            <a href="/transactions" className="text-sm font-bold text-[var(--primary)]">
              View all
            </a>
          </div>

          <ul className="mt-4 divide-y divide-[var(--border)]">
            {dashboard.recentTransactions.map((transaction) => {
              const category = categoriesById.get(transaction.categoryId);
              const isIncome = transaction.type === "income";

              return (
                <li key={transaction.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-bold">{category?.name ?? "Uncategorized"}</p>
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
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">Budget watch</h3>
            <a href="/advanced" className="text-sm font-bold text-[var(--primary)]">
              Manage
            </a>
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {budgetUsage.slice(0, 4).map((usage) => (
              <li key={usage.budget.id} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold">{usage.categoryName}</span>
                  <span className={usage.isOverLimit ? "font-bold text-[var(--danger)]" : "text-[var(--muted)]"}>
                    {usage.percentUsed}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                  <div
                    className="h-full rounded-lg bg-[var(--primary)]"
                    style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {formatInr(usage.spent)} of {formatInr(usage.budget.amount)}
                  {usage.isOverLimit ? " spent, over limit" : ` spent, ${formatInr(usage.remaining)} left`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function formatMonthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}
