export const dbName = "trackpaisa-db";
export const dbVersion = 2;

export const stores = {
  transactions: "id, type, categoryId, walletId, date, createdAt",
  categories: "id, type, name, sortOrder",
  wallets: "id, name, type, createdAt",
  recurringTemplates: "id, type, categoryId, walletId, nextDate, isActive, createdAt",
  budgetLimits: "id, categoryId, monthKey, createdAt",
  settings: "key",
  backups: "id, createdAt",
} as const;
