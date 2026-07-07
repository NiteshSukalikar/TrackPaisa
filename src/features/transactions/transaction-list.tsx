"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { seedDefaultCategories, listCategories } from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import type { Category, Transaction, TransactionType } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";

type TypeFilter = TransactionType | "all";

interface Filters {
  search: string;
  type: TypeFilter;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
}

const initialFilters: Filters = {
  search: "",
  type: "all",
  categoryId: "",
  dateFrom: "",
  dateTo: "",
};

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextTransactions] = await Promise.all([
          listCategories(),
          listTransactions({
            type: filters.type,
            categoryId: filters.categoryId || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            search: filters.search || undefined,
          }),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setTransactions(nextTransactions);
        }
      } catch {
        if (isMounted) {
          setError("Transactions could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const filteredCategories =
    filters.type === "all"
      ? categories
      : categories.filter((category) => category.type === filters.type);

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "type" ? { categoryId: "" } : {}),
    }));
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">History</p>
          <h2 className="mt-2 text-2xl font-bold">Transactions</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Review income and expenses saved on this device.
          </p>
        </div>
        <a
          href="/transactions/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
        >
          <Plus aria-hidden="true" size={18} />
          Add transaction
        </a>
      </div>

      <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <SlidersHorizontal aria-hidden="true" size={18} />
          Filters
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_1fr_0.8fr_0.8fr]">
          <label className="grid gap-2 text-sm font-bold">
            Search
            <span className="relative">
              <Search
                aria-hidden="true"
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Note or category"
                className="min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-3 text-base outline-none"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Type
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value as TypeFilter)}
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Category
            <select
              value={filters.categoryId}
              onChange={(event) => updateFilter("categoryId", event.target.value)}
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            >
              <option value="">All categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            From
            <input
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              type="date"
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            To
            <input
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
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

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <p className="text-sm font-bold">Saved transactions</p>
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            {isLoading ? "Loading..." : `${transactions.length} shown`}
          </p>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-[var(--muted)]">Loading transactions from this device.</div>
        ) : transactions.length === 0 ? (
          <div className="grid gap-3 p-6 text-center">
            <p className="text-lg font-bold">No transactions found</p>
            <p className="mx-auto max-w-md text-sm leading-6 text-[var(--muted)]">
              Add your first income or expense, or clear filters to see saved records.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                category={categoriesById.get(transaction.categoryId)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  category,
}: {
  transaction: Transaction;
  category?: Category;
}) {
  const isIncome = transaction.type === "income";

  return (
    <li className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)]"
          style={{ backgroundColor: category ? `${category.color}18` : undefined }}
          aria-hidden="true"
        >
          {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold">{category?.name ?? "Uncategorized"}</p>
            <span className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold capitalize text-[var(--muted)]">
              {transaction.type}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {formatTransactionDate(transaction.date)}
            {transaction.walletId ? ` • ${transaction.walletId}` : ""}
          </p>
          {transaction.note ? (
            <p className="mt-2 break-words text-sm leading-6">{transaction.note}</p>
          ) : null}
        </div>
      </div>

      <p className="text-left text-lg font-bold md:text-right">
        <span className="sr-only">{isIncome ? "Income amount" : "Expense amount"}</span>
        {isIncome ? "+" : "-"}
        {formatInr(transaction.amount)}
      </p>
    </li>
  );
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
