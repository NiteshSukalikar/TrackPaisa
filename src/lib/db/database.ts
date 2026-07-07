import Dexie, { type Table } from "dexie";
import { dbName, dbVersion, stores } from "@/lib/db/schema";
import type { AppSettings, Category, Transaction, Wallet } from "@/lib/types/finance";

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
  settings!: Table<StoredSetting, keyof AppSettings>;
  backups!: Table<BackupRecord, string>;

  constructor() {
    super(dbName);
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
