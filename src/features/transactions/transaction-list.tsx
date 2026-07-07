"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { listWallets } from "@/lib/db/repositories/advanced-tracking-repository";
import { seedDefaultCategories, listCategories } from "@/lib/db/repositories/categories-repository";
import {
  cloneTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/lib/db/repositories/transactions-repository";
import type { Category, Transaction, TransactionType, Wallet } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";
import type { TransactionDraft } from "@/lib/utils/validation";
import { validateTransactionDraft } from "@/lib/utils/validation";

type TypeFilter = TransactionType | "all";

interface Filters {
  search: string;
  type: TypeFilter;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
  tag: string;
  walletId: string;
}

const initialFilters: Filters = {
  search: "",
  type: "all",
  categoryId: "",
  dateFrom: "",
  dateTo: "",
  tag: "",
  walletId: "",
};

interface EditDraft {
  type: TransactionType;
  amount: string;
  categoryId: string;
  date: string;
  walletId: string;
  note: string;
  tagsText: string;
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadTransactions() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextWallets, nextTransactions] = await Promise.all([
          listCategories(),
          listWallets(),
          listTransactions({
            type: filters.type,
            categoryId: filters.categoryId || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            search: filters.search || undefined,
            tag: filters.tag || undefined,
            walletId: filters.walletId || undefined,
          }),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setWallets(nextWallets);
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
  }, [filters, reloadKey]);

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

  function refreshTransactions() {
    setReloadKey((current) => current + 1);
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setEditDraft({
      type: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId,
      date: transaction.date,
      walletId: transaction.walletId ?? "",
      note: transaction.note ?? "",
      tagsText: transaction.tags?.join(", ") ?? "",
    });
    setActionError("");
    setActionMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setActionError("");
  }

  async function saveEdit(transactionId: string) {
    if (!editDraft) {
      return;
    }

    const draft: TransactionDraft = {
      type: editDraft.type,
      amount: Number(editDraft.amount),
      categoryId: editDraft.categoryId,
      date: editDraft.date,
      walletId: editDraft.walletId.trim() || undefined,
      note: editDraft.note.trim() || undefined,
      tags: parseTags(editDraft.tagsText),
    };
    const result = validateTransactionDraft(draft);

    setActionError(result.errors.join(" "));
    setActionMessage("");

    if (!result.valid) {
      return;
    }

    setPendingActionId(`save-${transactionId}`);

    try {
      await updateTransaction(transactionId, draft);
      setEditingId(null);
      setEditDraft(null);
      setActionMessage("Transaction updated.");
      refreshTransactions();
    } catch {
      setActionError("Transaction could not be updated. Please try again.");
    } finally {
      setPendingActionId(null);
    }
  }

  async function removeTransaction(transaction: Transaction) {
    const confirmed = window.confirm("Delete this transaction? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    setPendingActionId(`delete-${transaction.id}`);
    setActionError("");
    setActionMessage("");

    try {
      await deleteTransaction(transaction.id);
      if (editingId === transaction.id) {
        setEditingId(null);
        setEditDraft(null);
      }
      setActionMessage("Transaction deleted.");
      refreshTransactions();
    } catch {
      setActionError("Transaction could not be deleted. Please try again.");
    } finally {
      setPendingActionId(null);
    }
  }

  async function duplicateTransaction(transaction: Transaction) {
    setPendingActionId(`clone-${transaction.id}`);
    setActionError("");
    setActionMessage("");

    try {
      await cloneTransaction(transaction.id);
      setActionMessage("Transaction cloned for today.");
      refreshTransactions();
    } catch {
      setActionError("Transaction could not be cloned. Please try again.");
    } finally {
      setPendingActionId(null);
    }
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Wallet / Source
            <select
              value={filters.walletId}
              onChange={(event) => updateFilter("walletId", event.target.value)}
              className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
            >
              <option value="">All wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.name}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Tag
            <input
              value={filters.tag}
              onChange={(event) => updateFilter("tag", event.target.value)}
              placeholder="monthly"
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

      {actionError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {actionError}
        </div>
      ) : null}

      {actionMessage ? (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
        >
          {actionMessage}
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
                categories={categories}
                isEditing={editingId === transaction.id}
                editDraft={editingId === transaction.id ? editDraft : null}
                pendingActionId={pendingActionId}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onDraftChange={setEditDraft}
                onSaveEdit={saveEdit}
                onClone={duplicateTransaction}
                onDelete={removeTransaction}
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
  categories,
  isEditing,
  editDraft,
  pendingActionId,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onSaveEdit,
  onClone,
  onDelete,
}: {
  transaction: Transaction;
  category?: Category;
  categories: Category[];
  isEditing: boolean;
  editDraft: EditDraft | null;
  pendingActionId: string | null;
  onStartEdit: (transaction: Transaction) => void;
  onCancelEdit: () => void;
  onDraftChange: (draft: EditDraft) => void;
  onSaveEdit: (transactionId: string) => void;
  onClone: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  const isIncome = transaction.type === "income";
  const editCategories = editDraft
    ? categories.filter((candidate) => candidate.type === editDraft.type)
    : [];

  function updateDraft<Key extends keyof EditDraft>(key: Key, value: EditDraft[Key]) {
    if (!editDraft) {
      return;
    }

    onDraftChange({
      ...editDraft,
      [key]: value,
      ...(key === "type" ? { categoryId: "" } : {}),
    });
  }

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
          {transaction.tags && transaction.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {transaction.tags.map((tag) => (
                <span key={tag} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--muted)]">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <p className="mr-auto text-left text-lg font-bold md:mr-2 md:text-right">
          <span className="sr-only">{isIncome ? "Income amount" : "Expense amount"}</span>
          {isIncome ? "+" : "-"}
          {formatInr(transaction.amount)}
        </p>
        <button
          type="button"
          onClick={() => onClone(transaction)}
          disabled={pendingActionId === `clone-${transaction.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)]"
          aria-label={`Clone ${transaction.note ?? category?.name ?? "transaction"} transaction`}
        >
          <Copy aria-hidden="true" size={17} />
        </button>
        <button
          type="button"
          onClick={() => onStartEdit(transaction)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)]"
          aria-label={`Edit ${transaction.note ?? category?.name ?? "transaction"} transaction`}
        >
          <Pencil aria-hidden="true" size={17} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(transaction)}
          disabled={pendingActionId === `delete-${transaction.id}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-700 disabled:opacity-60"
          aria-label={`Delete ${transaction.note ?? category?.name ?? "transaction"} transaction`}
        >
          <Trash2 aria-hidden="true" size={17} />
        </button>
      </div>

      {isEditing && editDraft ? (
        <form
          className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4 md:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveEdit(transaction.id);
          }}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold">
              Edit type
              <select
                value={editDraft.type}
                onChange={(event) => updateDraft("type", event.target.value as TransactionType)}
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit amount
              <input
                value={editDraft.amount}
                onChange={(event) => updateDraft("amount", event.target.value)}
                inputMode="decimal"
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base font-semibold outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit date
              <input
                value={editDraft.date}
                onChange={(event) => updateDraft("date", event.target.value)}
                type="date"
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit category
              <select
                value={editDraft.categoryId}
                onChange={(event) => updateDraft("categoryId", event.target.value)}
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              >
                <option value="">Select category</option>
                {editCategories.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit wallet / source
              <input
                value={editDraft.walletId}
                onChange={(event) => updateDraft("walletId", event.target.value)}
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit note
              <input
                value={editDraft.note}
                onChange={(event) => updateDraft("note", event.target.value)}
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Edit tags
              <input
                value={editDraft.tagsText}
                onChange={(event) => updateDraft("tagsText", event.target.value)}
                placeholder="monthly, work"
                className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pendingActionId === `save-${transaction.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              <Save aria-hidden="true" size={17} />
              {pendingActionId === `save-${transaction.id}` ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold"
            >
              <X aria-hidden="true" size={17} />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
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

function parseTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}
