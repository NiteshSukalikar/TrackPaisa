"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const defaultWalletOptions = ["Cash", "Bank", "UPI"];
const predefinedTags = ["monthly", "fixed", "work", "food", "travel", "rent", "salary"];
const pageSize = 10;

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
  const [page, setPage] = useState(1);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

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
  const walletOptions = useMemo(
    () => [...new Set([...wallets.map((wallet) => wallet.name), ...defaultWalletOptions])],
    [wallets],
  );
  const tagOptions = useMemo(
    () => [
      ...new Set([
        ...predefinedTags,
        ...transactions.flatMap((transaction) => transaction.tags ?? []),
        ...(filters.tag ? [filters.tag] : []),
      ]),
    ],
    [filters.tag, transactions],
  );
  const analytics = useMemo(() => summarizeTransactions(transactions), [transactions]);
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const pagedTransactions = useMemo(
    () => transactions.slice((page - 1) * pageSize, page * pageSize),
    [page, transactions],
  );
  const pageStart = transactions.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = Math.min(transactions.length, page * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setPage(1);
    setOpenActionId(null);
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "type" ? { categoryId: "" } : {}),
    }));
  }

  function refreshTransactions() {
    setOpenActionId(null);
    setReloadKey((current) => current + 1);
  }

  function startEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setOpenActionId(null);
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
    <section className="page-stack">
      <div className="page-hero">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="heading-lg">Transactions</h2>
          <p className="copy">
            Review income and expenses saved on this device.
          </p>
        </div>
        <a
          href="/transactions/new"
          className="primary-action"
        >
          <Plus aria-hidden="true" size={18} />
          Add transaction
        </a>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Transaction analytics">
        <AnalyticsCard
          icon={ArrowUpRight}
          label="Income"
          value={formatSignedInr(analytics.income, "income")}
          detail={`${analytics.incomeCount} income ${analytics.incomeCount === 1 ? "entry" : "entries"}`}
        />
        <AnalyticsCard
          icon={ArrowDownLeft}
          label="Expense"
          value={formatSignedInr(analytics.expense, "expense")}
          detail={`${analytics.expenseCount} expense ${analytics.expenseCount === 1 ? "entry" : "entries"}`}
        />
        <AnalyticsCard
          icon={analytics.net >= 0 ? ArrowUpRight : ArrowDownLeft}
          label="Net flow"
          value={formatSignedInr(Math.abs(analytics.net), analytics.net >= 0 ? "income" : "expense")}
          detail={analytics.net >= 0 ? "Positive balance in this view" : "Spending exceeds income here"}
        />
        <AnalyticsCard
          icon={SlidersHorizontal}
          label="Records"
          value={transactions.length.toLocaleString("en-IN")}
          detail={`Average expense ${formatInr(analytics.averageExpense)}`}
        />
      </section>

      <form className="section-card grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <SlidersHorizontal aria-hidden="true" size={18} />
            Filters
          </div>
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              setPage(1);
              setOpenActionId(null);
            }}
            className="secondary-action min-h-10 px-3 text-xs text-[var(--muted)]"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
          <label className="grid gap-2 text-sm font-bold xl:col-span-3">
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
                className="field-control py-2 pl-10 pr-3"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold xl:col-span-2">
            Type
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value as TypeFilter)}
              className="field-control"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold xl:col-span-3">
            Category
            <select
              value={filters.categoryId}
              onChange={(event) => updateFilter("categoryId", event.target.value)}
              className="field-control"
            >
              <option value="">All categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold xl:col-span-2">
            From
            <input
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              type="date"
              className="field-control"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold xl:col-span-2">
            To
            <input
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              type="date"
              className="field-control"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold xl:col-span-6">
            Wallet / Source
            <select
              value={filters.walletId}
              onChange={(event) => updateFilter("walletId", event.target.value)}
              className="field-control"
            >
              <option value="">All wallets</option>
              {walletOptions.map((walletName) => (
                <option key={walletName} value={walletName}>
                  {walletName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold xl:col-span-6">
            Tag
            <select
              value={filters.tag}
              onChange={(event) => updateFilter("tag", event.target.value)}
              className="field-control"
            >
              <option value="">All tags</option>
              {tagOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {error ? (
        <div role="alert" className="status-alert border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div role="alert" className="status-alert border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]">
          {actionError}
        </div>
      ) : null}

      {actionMessage ? (
        <div
          role="status"
          className="status-alert border-[var(--success-border)] bg-[var(--success-bg)] font-semibold text-[var(--success)]"
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="premium-card overflow-visible">
        <div className="card-header">
          <div>
            <p className="text-sm font-bold">Saved transactions</p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
              Analytics first, filters second, table for action.
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]" aria-live="polite">
            {isLoading ? "Loading..." : `${pageStart}-${pageEnd} of ${transactions.length}`}
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
          <>
            <div>
              <table className="w-full border-collapse text-sm">
                <thead className="hidden bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.12em] text-[var(--muted)] md:table-header-group">
                  <tr>
                    <Th>Transaction</Th>
                    <Th>Type</Th>
                    <Th>Date</Th>
                    <Th>Wallet</Th>
                    <Th align="right">Amount</Th>
                    <Th align="right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="grid gap-3 p-3 md:table-row-group md:divide-y md:divide-[var(--border)] md:p-0">
                  {pagedTransactions.map((transaction) => (
                    <TransactionTableRow
                      key={transaction.id}
                      transaction={transaction}
                      category={categoriesById.get(transaction.categoryId)}
                      categories={categories}
                      walletOptions={walletOptions}
                      isEditing={editingId === transaction.id}
                      editDraft={editingId === transaction.id ? editDraft : null}
                      pendingActionId={pendingActionId}
                      openActionId={openActionId}
                      onActionToggle={setOpenActionId}
                      onStartEdit={startEdit}
                      onCancelEdit={cancelEdit}
                      onDraftChange={setEditDraft}
                      onSaveEdit={saveEdit}
                      onClone={duplicateTransaction}
                      onDelete={removeTransaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              count={transactions.length}
              page={page}
              pageEnd={pageEnd}
              pageStart={pageStart}
              totalPages={totalPages}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setOpenActionId(null);
              }}
            />
          </>
        )}
      </div>
    </section>
  );
}

function AnalyticsCard({
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
    <article className="stat-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-[var(--muted)]">{label}</span>
        <Icon aria-hidden="true" size={20} className="text-[var(--accent)]" />
      </div>
      <p className="mt-4 break-words text-2xl font-extrabold tracking-[-0.02em]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </article>
  );
}

function TransactionTableRow({
  transaction,
  category,
  categories,
  walletOptions,
  isEditing,
  editDraft,
  pendingActionId,
  openActionId,
  onActionToggle,
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
  walletOptions: string[];
  isEditing: boolean;
  editDraft: EditDraft | null;
  pendingActionId: string | null;
  openActionId: string | null;
  onActionToggle: (id: string | null) => void;
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
    <>
      <tr className="block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:bg-[var(--surface-muted)]/45 md:table-row md:rounded-none md:border-0 md:bg-transparent md:shadow-none">
        <Td label="Transaction">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] shadow-sm"
              style={{ backgroundColor: category ? `${category.color}18` : undefined }}
              aria-hidden="true"
            >
              {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
            </span>
            <div className="min-w-0">
              <p className="font-bold">{transaction.note || category?.name || "Uncategorized"}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                {category?.name ?? "Uncategorized"}
              </p>
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
        </Td>
        <Td label="Type">
          <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-bold capitalize text-[var(--muted)]">
            {transaction.type}
          </span>
        </Td>
        <Td label="Date">{formatTransactionDate(transaction.date)}</Td>
        <Td label="Wallet">{transaction.walletId ?? "No wallet"}</Td>
        <Td align="right" label="Amount" strong>
          <span className={isIncome ? "text-[var(--primary)]" : "text-[var(--text)]"}>
            {isIncome ? "+" : "-"}
            {formatInr(transaction.amount)}
          </span>
        </Td>
        <Td align="right" label="Actions">
          <RowActions
            id={`transaction-${transaction.id}`}
            isOpen={openActionId === `transaction-${transaction.id}`}
            transaction={transaction}
            category={category}
            pendingActionId={pendingActionId}
            onToggle={onActionToggle}
            onStartEdit={onStartEdit}
            onClone={onClone}
            onDelete={onDelete}
          />
        </Td>
      </tr>

      {isEditing && editDraft ? (
        <tr className="block md:table-row">
          <td colSpan={6} className="block bg-[var(--surface-muted)]/45 p-3 md:table-cell md:p-4">
            <form
              className="subtle-panel grid gap-4"
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
                    className="field-control bg-[var(--surface)]"
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
                    className="field-control bg-[var(--surface)] font-semibold"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  Edit date
                  <input
                    value={editDraft.date}
                    onChange={(event) => updateDraft("date", event.target.value)}
                    type="date"
                    className="field-control bg-[var(--surface)]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  Edit category
                  <select
                    value={editDraft.categoryId}
                    onChange={(event) => updateDraft("categoryId", event.target.value)}
                    className="field-control bg-[var(--surface)]"
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
                  <select
                    value={editDraft.walletId}
                    onChange={(event) => updateDraft("walletId", event.target.value)}
                    className="field-control bg-[var(--surface)]"
                  >
                    <option value="">No wallet</option>
                    {walletOptions.map((walletName) => (
                      <option key={walletName} value={walletName}>
                        {walletName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  Edit note
                  <input
                    value={editDraft.note}
                    onChange={(event) => updateDraft("note", event.target.value)}
                    className="field-control bg-[var(--surface)]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  Edit tags
                  <input
                    value={editDraft.tagsText}
                    onChange={(event) => updateDraft("tagsText", event.target.value)}
                    placeholder="monthly, work"
                    className="field-control bg-[var(--surface)]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={pendingActionId === `save-${transaction.id}`}
                  className="primary-action"
                >
                  <Save aria-hidden="true" size={17} />
                  {pendingActionId === `save-${transaction.id}` ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="secondary-action"
                >
                  <X aria-hidden="true" size={17} />
                  Cancel
                </button>
              </div>
            </form>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RowActions({
  category,
  id,
  isOpen,
  onClone,
  onDelete,
  onStartEdit,
  onToggle,
  pendingActionId,
  transaction,
}: {
  category?: Category;
  id: string;
  isOpen: boolean;
  onClone: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onStartEdit: (transaction: Transaction) => void;
  onToggle: (id: string | null) => void;
  pendingActionId: string | null;
  transaction: Transaction;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ right: 0, top: 0 });
  const label = transaction.note ?? category?.name ?? "transaction";

  function toggleMenu() {
    const button = buttonRef.current;

    if (button) {
      const rect = button.getBoundingClientRect();
      const menuHeight = 136;

      setMenuPosition({
        right: Math.max(12, window.innerWidth - rect.right),
        top: Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - menuHeight - 12)),
      });
    }

    onToggle(isOpen ? null : id);
  }

  function runAction(action: () => void) {
    onToggle(null);
    action();
  }

  return (
    <div className="inline-flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="icon-action"
        aria-label={`Open actions for ${label} transaction`}
        aria-expanded={isOpen}
      >
        <MoreVertical aria-hidden="true" size={18} />
      </button>
      {isOpen ? (
        <div
          className="fixed z-[80] min-w-48 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left shadow-soft backdrop-blur-xl"
          style={{ right: menuPosition.right, top: menuPosition.top }}
        >
          <button
            type="button"
            onClick={() => runAction(() => onClone(transaction))}
            disabled={pendingActionId === `clone-${transaction.id}`}
            className="flex min-h-11 w-full items-center gap-2 px-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:opacity-60"
            aria-label={`Clone ${label} transaction`}
          >
            <Copy aria-hidden="true" size={16} />
            Clone
          </button>
          <button
            type="button"
            onClick={() => runAction(() => onStartEdit(transaction))}
            className="flex min-h-11 w-full items-center gap-2 px-3 text-sm font-bold text-[var(--text)] hover:bg-[var(--surface-muted)]"
            aria-label={`Edit ${label} transaction`}
          >
            <Pencil aria-hidden="true" size={16} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => runAction(() => void onDelete(transaction))}
            disabled={pendingActionId === `delete-${transaction.id}`}
            className="flex min-h-11 w-full items-center gap-2 px-3 text-sm font-bold text-[var(--danger)] hover:bg-[var(--danger-bg)] disabled:opacity-60"
            aria-label={`Delete ${label} transaction`}
          >
            <Trash2 aria-hidden="true" size={16} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Th({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <th className={`px-4 py-3 font-bold ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({
  align = "left",
  children,
  label,
  strong = false,
}: {
  align?: "left" | "right";
  children: React.ReactNode;
  label?: string;
  strong?: boolean;
}) {
  return (
    <td
      className={`block border-t border-[var(--border)] px-4 py-3 align-top first:border-t-0 md:table-cell md:border-t-0 md:py-4 ${
        align === "right" ? "md:text-right" : "text-left"
      } ${strong ? "font-bold" : ""}`}
    >
      <div className={`${align === "right" ? "md:text-right" : ""}`}>
        {label ? (
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)] md:hidden">
            {label}
          </span>
        ) : null}
        <div className={`${align === "right" ? "text-right" : "text-left"} min-w-0`}>
          {children}
        </div>
      </div>
    </td>
  );
}

function Pagination({
  count,
  onPageChange,
  page,
  pageEnd,
  pageStart,
  totalPages,
}: {
  count: number;
  onPageChange: (page: number) => void;
  page: number;
  pageEnd: number;
  pageStart: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
      <span>
        {pageStart}-{pageEnd} of {count}, 10 per page
      </span>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="secondary-action min-h-10 px-3 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="secondary-action min-h-10 px-3 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function formatTransactionDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatSignedInr(value: number, type: TransactionType) {
  return `${type === "income" ? "+" : "-"}${formatInr(value)}`;
}

function summarizeTransactions(transactions: Transaction[]) {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const expense = expenseTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  return {
    averageExpense:
      expenseTransactions.length === 0
        ? 0
        : Math.round(expense / expenseTransactions.length),
    expense,
    expenseCount: expenseTransactions.length,
    income,
    incomeCount: transactions.length - expenseTransactions.length,
    net: income - expense,
  };
}

function parseTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}
