export const dbName = "trackpaisa-db";
export const dbVersion = 1;

export const stores = {
  transactions: "id, type, categoryId, walletId, date, createdAt",
  categories: "id, type, name, sortOrder",
  wallets: "id, name, type, createdAt",
  settings: "key",
  backups: "id, createdAt",
} as const;
