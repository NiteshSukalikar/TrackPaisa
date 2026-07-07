import Dexie, { type Table } from "dexie";
import { dbName, dbVersion, stores } from "@/lib/db/schema";
import type {
  AppSettings,
  BudgetLimit,
  Category,
  RecurringTemplate,
  Transaction,
  Wallet,
} from "@/lib/types/finance";

export interface StoredSetting {
  key: keyof AppSettings;
  value: AppSettings[keyof AppSettings];
}

export interface BackupRecord {
  id: string;
  createdAt: string;
  version: number;
  payload: unknown;
}

class TrackPaisaDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  wallets!: Table<Wallet, string>;
  recurringTemplates!: Table<RecurringTemplate, string>;
  budgetLimits!: Table<BudgetLimit, string>;
  settings!: Table<StoredSetting, keyof AppSettings>;
  backups!: Table<BackupRecord, string>;

  constructor() {
    super(dbName);
    this.version(1).stores({
      transactions: "id, type, categoryId, walletId, date, createdAt",
      categories: "id, type, name, sortOrder",
      wallets: "id, name, type, createdAt",
      settings: "key",
      backups: "id, createdAt",
    });
    this.version(dbVersion).stores(stores);
  }
}

let db: TrackPaisaDatabase | null = null;

export function getTrackPaisaDb() {
  if (typeof window === "undefined") {
    throw new Error("TrackPaisa IndexedDB can only be opened in the browser.");
  }

  db ??= new TrackPaisaDatabase();
  return db;
}
