import { defaultSettings } from "@/lib/constants/default-settings";
import type {
  AppSettings,
  BudgetLimit,
  Category,
  RecurringTemplate,
  Transaction,
  Wallet,
} from "@/lib/types/finance";

export const backupFormat = "trackpaisa-backup";
export const backupVersion = 1;

export interface TrackPaisaBackupData {
  budgetLimits?: BudgetLimit[];
  categories: Category[];
  recurringTemplates?: RecurringTemplate[];
  settings: AppSettings;
  transactions: Transaction[];
  wallets: Wallet[];
}

export interface TrackPaisaBackup {
  app: "TrackPaisa";
  exportedAt: string;
  format: typeof backupFormat;
  version: typeof backupVersion;
  data: TrackPaisaBackupData;
}

export interface BackupPreview {
  backup: TrackPaisaBackup;
  duplicateCategoryIds: string[];
  duplicateBudgetLimitIds: string[];
  duplicateRecurringTemplateIds: string[];
  duplicateTransactionIds: string[];
  duplicateWalletIds: string[];
  invalidReasons: string[];
  summary: {
    categories: number;
    budgetLimits: number;
    recurringTemplates: number;
    transactions: number;
    wallets: number;
  };
}

export type ImportMode = "skip" | "overwrite" | "replace";

export function createBackup(data: TrackPaisaBackupData, exportedAt = new Date().toISOString()): TrackPaisaBackup {
  return {
    app: "TrackPaisa",
    exportedAt,
    format: backupFormat,
    version: backupVersion,
    data: {
      categories: [...data.categories],
      budgetLimits: [...(data.budgetLimits ?? [])],
      recurringTemplates: [...(data.recurringTemplates ?? [])],
      settings: { ...defaultSettings, ...data.settings },
      transactions: [...data.transactions],
      wallets: [...data.wallets],
    },
  };
}

export function parseBackupJson(value: string): TrackPaisaBackup {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Backup file is not valid JSON.");
  }

  const reasons = validateBackup(parsed);

  if (reasons.length > 0) {
    throw new Error(reasons.join(" "));
  }

  return parsed as TrackPaisaBackup;
}

export function createBackupPreview(
  backup: TrackPaisaBackup,
  existing: Pick<TrackPaisaBackupData, "categories" | "transactions" | "wallets">,
  extraExisting: Partial<Pick<TrackPaisaBackupData, "budgetLimits" | "recurringTemplates">> = {},
): BackupPreview {
  const existingCategoryIds = new Set(existing.categories.map((category) => category.id));
  const existingTransactionIds = new Set(existing.transactions.map((transaction) => transaction.id));
  const existingWalletIds = new Set(existing.wallets.map((wallet) => wallet.id));
  const existingBudgetLimitIds = new Set((extraExisting.budgetLimits ?? []).map((budget) => budget.id));
  const existingRecurringTemplateIds = new Set((extraExisting.recurringTemplates ?? []).map((template) => template.id));

  return {
    backup,
    duplicateBudgetLimitIds: (backup.data.budgetLimits ?? [])
      .filter((budget) => existingBudgetLimitIds.has(budget.id))
      .map((budget) => budget.id),
    duplicateCategoryIds: backup.data.categories
      .filter((category) => existingCategoryIds.has(category.id))
      .map((category) => category.id),
    duplicateRecurringTemplateIds: (backup.data.recurringTemplates ?? [])
      .filter((template) => existingRecurringTemplateIds.has(template.id))
      .map((template) => template.id),
    duplicateTransactionIds: backup.data.transactions
      .filter((transaction) => existingTransactionIds.has(transaction.id))
      .map((transaction) => transaction.id),
    duplicateWalletIds: backup.data.wallets
      .filter((wallet) => existingWalletIds.has(wallet.id))
      .map((wallet) => wallet.id),
    invalidReasons: validateBackup(backup),
    summary: {
      budgetLimits: (backup.data.budgetLimits ?? []).length,
      categories: backup.data.categories.length,
      recurringTemplates: (backup.data.recurringTemplates ?? []).length,
      transactions: backup.data.transactions.length,
      wallets: backup.data.wallets.length,
    },
  };
}

export function mergeBackupData(
  backup: TrackPaisaBackup,
  existing: Pick<TrackPaisaBackupData, "categories" | "transactions" | "wallets">,
  mode: ImportMode,
  extraExisting: Partial<Pick<TrackPaisaBackupData, "budgetLimits" | "recurringTemplates">> = {},
) {
  if (mode === "replace") {
    return {
      budgetLimits: backup.data.budgetLimits ?? [],
      categories: backup.data.categories,
      recurringTemplates: backup.data.recurringTemplates ?? [],
      transactions: backup.data.transactions,
      wallets: backup.data.wallets,
    };
  }

  return {
    budgetLimits: mergeById(extraExisting.budgetLimits ?? [], backup.data.budgetLimits ?? [], mode),
    categories: mergeById(existing.categories, backup.data.categories, mode),
    recurringTemplates: mergeById(
      extraExisting.recurringTemplates ?? [],
      backup.data.recurringTemplates ?? [],
      mode,
    ),
    transactions: mergeById(existing.transactions, backup.data.transactions, mode),
    wallets: mergeById(existing.wallets, backup.data.wallets, mode),
  };
}

function mergeById<T extends { id: string }>(existing: T[], incoming: T[], mode: Exclude<ImportMode, "replace">) {
  const rowsById = new Map(existing.map((row) => [row.id, row]));

  for (const row of incoming) {
    if (mode === "overwrite" || !rowsById.has(row.id)) {
      rowsById.set(row.id, row);
    }
  }

  return Array.from(rowsById.values());
}

function validateBackup(value: unknown) {
  const reasons: string[] = [];

  if (!isRecord(value)) {
    return ["Backup file has an unsupported shape."];
  }

  if (value.format !== backupFormat || value.version !== backupVersion) {
    reasons.push("Backup file is not a supported TrackPaisa backup.");
  }

  if (typeof value.exportedAt !== "string" || Number.isNaN(Date.parse(value.exportedAt))) {
    reasons.push("Backup export date is missing or invalid.");
  }

  if (!isRecord(value.data)) {
    reasons.push("Backup data is missing.");
    return reasons;
  }

  if (!Array.isArray(value.data.transactions)) {
    reasons.push("Backup transactions are missing.");
  } else {
    reasons.push(...value.data.transactions.flatMap(validateTransaction));
  }

  if (value.data.budgetLimits !== undefined) {
    if (!Array.isArray(value.data.budgetLimits)) {
      reasons.push("Backup budget limits are invalid.");
    } else {
      reasons.push(...value.data.budgetLimits.flatMap(validateBudgetLimit));
    }
  }

  if (value.data.recurringTemplates !== undefined) {
    if (!Array.isArray(value.data.recurringTemplates)) {
      reasons.push("Backup recurring templates are invalid.");
    } else {
      reasons.push(...value.data.recurringTemplates.flatMap(validateRecurringTemplate));
    }
  }

  if (!Array.isArray(value.data.categories)) {
    reasons.push("Backup categories are missing.");
  } else {
    reasons.push(...value.data.categories.flatMap(validateCategory));
  }

  if (!Array.isArray(value.data.wallets)) {
    reasons.push("Backup wallets are missing.");
  } else {
    reasons.push(...value.data.wallets.flatMap(validateWallet));
  }

  if (!isRecord(value.data.settings)) {
    reasons.push("Backup settings are missing.");
  } else {
    reasons.push(...validateSettings(value.data.settings));
  }

  return reasons;
}

function validateTransaction(value: unknown) {
  if (!isRecord(value)) {
    return ["A transaction has an unsupported shape."];
  }

  const reasons = requireStringFields(value, ["id", "categoryId", "date", "createdAt", "updatedAt"], "transaction");

  if (value.type !== "income" && value.type !== "expense") {
    reasons.push("A transaction has an invalid type.");
  }

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount) || value.amount <= 0) {
    reasons.push("A transaction has an invalid amount.");
  }

  if (Number.isNaN(Date.parse(`${value.date}T00:00:00`))) {
    reasons.push("A transaction has an invalid date.");
  }

  return reasons;
}

function validateCategory(value: unknown) {
  if (!isRecord(value)) {
    return ["A category has an unsupported shape."];
  }

  const reasons = requireStringFields(value, ["id", "name", "icon", "color", "createdAt"], "category");

  if (value.type !== "income" && value.type !== "expense") {
    reasons.push("A category has an invalid type.");
  }

  if (typeof value.sortOrder !== "number" || !Number.isFinite(value.sortOrder)) {
    reasons.push("A category has an invalid sort order.");
  }

  if (typeof value.isDefault !== "boolean") {
    reasons.push("A category has an invalid default flag.");
  }

  return reasons;
}

function validateWallet(value: unknown) {
  if (!isRecord(value)) {
    return ["A wallet has an unsupported shape."];
  }

  const reasons = requireStringFields(value, ["id", "name", "type", "createdAt"], "wallet");

  if (!["cash", "bank", "upi", "other"].includes(String(value.type))) {
    reasons.push("A wallet has an invalid type.");
  }

  return reasons;
}

function validateBudgetLimit(value: unknown) {
  if (!isRecord(value)) {
    return ["A budget limit has an unsupported shape."];
  }

  const reasons = requireStringFields(value, ["id", "categoryId", "monthKey", "createdAt", "updatedAt"], "budget limit");

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount) || value.amount <= 0) {
    reasons.push("A budget limit has an invalid amount.");
  }

  if (typeof value.monthKey === "string" && !/^\d{4}-\d{2}$/.test(value.monthKey)) {
    reasons.push("A budget limit has an invalid month.");
  }

  return reasons;
}

function validateRecurringTemplate(value: unknown) {
  if (!isRecord(value)) {
    return ["A recurring template has an unsupported shape."];
  }

  const reasons = requireStringFields(value, ["id", "categoryId", "nextDate", "createdAt", "updatedAt"], "recurring template");

  if (value.type !== "income" && value.type !== "expense") {
    reasons.push("A recurring template has an invalid type.");
  }

  if (value.frequency !== "weekly" && value.frequency !== "monthly") {
    reasons.push("A recurring template has an invalid frequency.");
  }

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount) || value.amount <= 0) {
    reasons.push("A recurring template has an invalid amount.");
  }

  if (typeof value.isActive !== "boolean") {
    reasons.push("A recurring template has an invalid active flag.");
  }

  return reasons;
}

function validateSettings(value: Record<string, unknown>) {
  const reasons: string[] = [];

  if (value.currency !== "INR") {
    reasons.push("Backup settings must use INR currency.");
  }

  if (!["light", "dark", "system"].includes(String(value.theme))) {
    reasons.push("Backup settings have an invalid theme.");
  }

  if (!["green-blue", "colorful"].includes(String(value.colorTheme))) {
    reasons.push("Backup settings have an invalid color theme.");
  }

  return reasons;
}

function requireStringFields(value: Record<string, unknown>, fields: string[], label: string) {
  return fields.flatMap((field) =>
    typeof value[field] === "string" && value[field] ? [] : [`A ${label} is missing ${field}.`],
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
