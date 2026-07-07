import { getTrackPaisaDb } from "@/lib/db/database";
import { seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import type { Category, Transaction, TransactionType } from "@/lib/types/finance";
import type { TransactionDraft } from "@/lib/utils/validation";
import { validateTransactionDraft } from "@/lib/utils/validation";

export interface TransactionFilters {
  type?: TransactionType | "all";
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  tag?: string;
  walletId?: string;
}

type IdFactory = () => string;

const createId: IdFactory = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `transaction-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function createTransactionFromDraft(
  draft: TransactionDraft,
  now = new Date(),
  idFactory: IdFactory = createId,
): Transaction {
  const result = validateTransactionDraft(draft);

  if (!result.valid) {
    throw new Error(result.errors.join(" "));
  }

  const { type, amount, categoryId, date } = draft;

  if (!type || amount === undefined || !categoryId || !date) {
    throw new Error("Transaction draft is incomplete.");
  }

  const timestamp = now.toISOString();
  const note = draft.note?.trim();
  const walletId = draft.walletId?.trim();
  const tags = normalizeTags(draft.tags);

  return {
    id: idFactory(),
    type,
    amount,
    categoryId: categoryId.trim(),
    date,
    ...(walletId ? { walletId } : {}),
    ...(note ? { note } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function sortTransactionsNewestFirst(transactions: Transaction[]) {
  return [...transactions].sort((first, second) => {
    const dateComparison = second.date.localeCompare(first.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return second.createdAt.localeCompare(first.createdAt);
  });
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters = {},
  categories: Category[] = [],
) {
  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name.toLocaleLowerCase("en-IN")]),
  );
  const search = filters.search?.trim().toLocaleLowerCase("en-IN");

  return sortTransactionsNewestFirst(
    transactions.filter((transaction) => {
      if (filters.type && filters.type !== "all" && transaction.type !== filters.type) {
        return false;
      }

      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.walletId && transaction.walletId !== filters.walletId) {
        return false;
      }

      if (filters.tag && !transaction.tags?.some((tag) => tag.toLocaleLowerCase("en-IN") === filters.tag?.toLocaleLowerCase("en-IN"))) {
        return false;
      }

      if (filters.dateFrom && transaction.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && transaction.date > filters.dateTo) {
        return false;
      }

      if (!search) {
        return true;
      }

      const note = transaction.note?.toLocaleLowerCase("en-IN") ?? "";
      const categoryName = categoryNamesById.get(transaction.categoryId) ?? "";
      const wallet = transaction.walletId?.toLocaleLowerCase("en-IN") ?? "";
      const tags = transaction.tags?.join(" ").toLocaleLowerCase("en-IN") ?? "";

      return note.includes(search) || categoryName.includes(search) || wallet.includes(search) || tags.includes(search);
    }),
  );
}

export async function addTransaction(draft: TransactionDraft) {
  const db = getTrackPaisaDb();
  const transaction = createTransactionFromDraft(draft);

  await seedDefaultCategories();
  await db.transactions.add(transaction);

  return transaction;
}

export async function getTransaction(id: string) {
  return getTrackPaisaDb().transactions.get(id);
}

export async function listTransactions(filters: TransactionFilters = {}) {
  const db = getTrackPaisaDb();
  const [transactions, categories] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
  ]);

  return filterTransactions(transactions, filters, categories);
}

export async function updateTransaction(id: string, draft: TransactionDraft) {
  const db = getTrackPaisaDb();
  const existing = await db.transactions.get(id);

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  const nextDraft = {
    type: draft.type ?? existing.type,
    amount: draft.amount ?? existing.amount,
    categoryId: draft.categoryId ?? existing.categoryId,
    date: draft.date ?? existing.date,
    note: draft.note ?? existing.note,
    tags: draft.tags ?? existing.tags,
    walletId: draft.walletId ?? existing.walletId,
  };
  const result = validateTransactionDraft(nextDraft);

  if (!result.valid) {
    throw new Error(result.errors.join(" "));
  }

  const next: Transaction = {
    ...existing,
    type: nextDraft.type,
    amount: nextDraft.amount,
    categoryId: nextDraft.categoryId.trim(),
    date: nextDraft.date,
    note: nextDraft.note?.trim() || undefined,
    tags: normalizeTags(nextDraft.tags),
    walletId: nextDraft.walletId?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  await db.transactions.put(next);

  return next;
}

export async function deleteTransaction(id: string) {
  await getTrackPaisaDb().transactions.delete(id);
}

export async function cloneTransaction(id: string, overrides: Partial<TransactionDraft> = {}) {
  const existing = await getTransaction(id);

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  return addTransaction({
    type: overrides.type ?? existing.type,
    amount: overrides.amount ?? existing.amount,
    categoryId: overrides.categoryId ?? existing.categoryId,
    date: overrides.date ?? new Date().toISOString().slice(0, 10),
    walletId: overrides.walletId ?? existing.walletId,
    note: overrides.note ?? existing.note,
    tags: overrides.tags ?? existing.tags,
  });
}

function normalizeTags(tags?: string[]) {
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
}
