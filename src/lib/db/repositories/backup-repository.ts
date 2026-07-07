import { getTrackPaisaDb } from "@/lib/db/database";
import type { AppSettings } from "@/lib/types/finance";
import {
  createBackup,
  createBackupPreview,
  mergeBackupData,
  type ImportMode,
  type TrackPaisaBackup,
} from "@/lib/utils/backup";

export async function exportBackup() {
  const db = getTrackPaisaDb();
  const [categories, settingsRows, transactions, wallets] = await Promise.all([
    db.categories.toArray(),
    db.settings.toArray(),
    db.transactions.toArray(),
    db.wallets.toArray(),
  ]);
  const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value])) as Partial<AppSettings>;

  return createBackup({
    categories,
    settings: settings as AppSettings,
    transactions,
    wallets,
  });
}

export async function previewBackupImport(backup: TrackPaisaBackup) {
  const db = getTrackPaisaDb();
  const [categories, transactions, wallets] = await Promise.all([
    db.categories.toArray(),
    db.transactions.toArray(),
    db.wallets.toArray(),
  ]);

  return createBackupPreview(backup, {
    categories,
    transactions,
    wallets,
  });
}

export async function importBackup(backup: TrackPaisaBackup, mode: ImportMode) {
  const db = getTrackPaisaDb();
  const [categories, transactions, wallets] = await Promise.all([
    db.categories.toArray(),
    db.transactions.toArray(),
    db.wallets.toArray(),
  ]);
  const safetyBackup = await exportBackup();
  const nextData = mergeBackupData(
    backup,
    {
      categories,
      transactions,
      wallets,
    },
    mode,
  );

  await db.transaction("rw", db.backups, db.categories, db.settings, db.transactions, db.wallets, async () => {
    await db.backups.add({
      id: `backup-${Date.now()}`,
      createdAt: safetyBackup.exportedAt,
      version: safetyBackup.version,
      payload: safetyBackup,
    });

    await Promise.all([
      db.categories.clear(),
      db.transactions.clear(),
      db.wallets.clear(),
      db.settings.clear(),
    ]);

    await Promise.all([
      nextData.categories.length ? db.categories.bulkPut(nextData.categories) : Promise.resolve(),
      nextData.transactions.length ? db.transactions.bulkPut(nextData.transactions) : Promise.resolve(),
      nextData.wallets.length ? db.wallets.bulkPut(nextData.wallets) : Promise.resolve(),
      db.settings.bulkPut(
        Object.entries(backup.data.settings).map(([key, value]) => ({
          key: key as keyof AppSettings,
          value,
        })),
      ),
    ]);
  });

  return {
    categories: nextData.categories.length,
    safetyBackupId: safetyBackup.exportedAt,
    transactions: nextData.transactions.length,
    wallets: nextData.wallets.length,
  };
}
