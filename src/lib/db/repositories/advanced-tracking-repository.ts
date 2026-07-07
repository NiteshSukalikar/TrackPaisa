import { getTrackPaisaDb } from "@/lib/db/database";
import { addTransaction } from "@/lib/db/repositories/transactions-repository";
import type { BudgetLimit, RecurringTemplate, TransactionType, Wallet } from "@/lib/types/finance";
import { isValidIsoDate } from "@/lib/utils/transactions";
import type { TransactionDraft } from "@/lib/utils/validation";
import { validateTransactionDraft } from "@/lib/utils/validation";

type IdFactory = () => string;

const createId: IdFactory = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `advanced-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export interface WalletDraft {
  name: string;
  type: Wallet["type"];
  openingBalance?: number;
}

export interface BudgetLimitDraft {
  categoryId: string;
  amount: number;
  monthKey: string;
}

export interface RecurringTemplateDraft extends TransactionDraft {
  frequency: RecurringTemplate["frequency"];
  nextDate: string;
  isActive?: boolean;
}

export async function listWallets() {
  return getTrackPaisaDb().wallets.orderBy("name").toArray();
}

export async function saveWallet(draft: WalletDraft, idFactory: IdFactory = createId) {
  const name = draft.name.trim();

  if (!name) {
    throw new Error("Wallet name is required.");
  }

  if (!["cash", "bank", "upi", "other"].includes(draft.type)) {
    throw new Error("Wallet type is required.");
  }

  const wallet: Wallet = {
    id: idFactory(),
    name,
    type: draft.type,
    ...(typeof draft.openingBalance === "number" && Number.isFinite(draft.openingBalance)
      ? { openingBalance: draft.openingBalance }
      : {}),
    createdAt: new Date().toISOString(),
  };

  await getTrackPaisaDb().wallets.add(wallet);

  return wallet;
}

export async function deleteWallet(id: string) {
  await getTrackPaisaDb().wallets.delete(id);
}

export async function listBudgetLimits(monthKey?: string) {
  const rows = await getTrackPaisaDb().budgetLimits.toArray();

  return rows
    .filter((budget) => !monthKey || budget.monthKey === monthKey)
    .sort((first, second) => first.monthKey.localeCompare(second.monthKey));
}

export async function saveBudgetLimit(draft: BudgetLimitDraft, idFactory: IdFactory = createId) {
  const budget = createBudgetLimit(draft, new Date(), idFactory);
  await getTrackPaisaDb().budgetLimits.put(budget);

  return budget;
}

export async function deleteBudgetLimit(id: string) {
  await getTrackPaisaDb().budgetLimits.delete(id);
}

export function createBudgetLimit(
  draft: BudgetLimitDraft,
  now = new Date(),
  idFactory: IdFactory = createId,
): BudgetLimit {
  if (!draft.categoryId.trim()) {
    throw new Error("Category is required.");
  }

  if (typeof draft.amount !== "number" || !Number.isFinite(draft.amount) || draft.amount <= 0) {
    throw new Error("Budget amount must be greater than 0.");
  }

  if (!/^\d{4}-\d{2}$/.test(draft.monthKey)) {
    throw new Error("Budget month is required.");
  }

  const timestamp = now.toISOString();

  return {
    id: `${draft.monthKey}-${draft.categoryId.trim()}`,
    categoryId: draft.categoryId.trim(),
    amount: draft.amount,
    monthKey: draft.monthKey,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function listRecurringTemplates() {
  return getTrackPaisaDb().recurringTemplates.orderBy("nextDate").toArray();
}

export async function saveRecurringTemplate(
  draft: RecurringTemplateDraft,
  idFactory: IdFactory = createId,
) {
  const template = createRecurringTemplate(draft, new Date(), idFactory);
  await getTrackPaisaDb().recurringTemplates.add(template);

  return template;
}

export async function deleteRecurringTemplate(id: string) {
  await getTrackPaisaDb().recurringTemplates.delete(id);
}

export async function createTransactionFromTemplate(template: RecurringTemplate) {
  const transaction = await addTransaction({
    type: template.type,
    amount: template.amount,
    categoryId: template.categoryId,
    date: template.nextDate,
    walletId: template.walletId,
    note: template.note,
    tags: template.tags,
  });
  const next = {
    ...template,
    nextDate: getNextRecurringDate(template.nextDate, template.frequency),
    updatedAt: new Date().toISOString(),
  };

  await getTrackPaisaDb().recurringTemplates.put(next);

  return { transaction, template: next };
}

export function createRecurringTemplate(
  draft: RecurringTemplateDraft,
  now = new Date(),
  idFactory: IdFactory = createId,
): RecurringTemplate {
  const result = validateTransactionDraft({ ...draft, date: draft.nextDate });

  if (!result.valid) {
    throw new Error(result.errors.join(" "));
  }

  if (draft.frequency !== "weekly" && draft.frequency !== "monthly") {
    throw new Error("Frequency is required.");
  }

  if (!isValidIsoDate(draft.nextDate)) {
    throw new Error("Next date is required.");
  }

  const timestamp = now.toISOString();
  const tags = normalizeTags(draft.tags);

  return {
    id: idFactory(),
    type: draft.type as TransactionType,
    amount: draft.amount as number,
    categoryId: draft.categoryId?.trim() ?? "",
    frequency: draft.frequency,
    nextDate: draft.nextDate,
    isActive: draft.isActive ?? true,
    ...(draft.walletId?.trim() ? { walletId: draft.walletId.trim() } : {}),
    ...(draft.note?.trim() ? { note: draft.note.trim() } : {}),
    ...(tags.length > 0 ? { tags } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getNextRecurringDate(value: string, frequency: RecurringTemplate["frequency"]) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function normalizeTags(tags?: string[]) {
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
}
