import { defaultSettings } from "@/lib/constants/default-settings";
import { getTrackPaisaDb } from "@/lib/db/database";
import type { AppSettings } from "@/lib/types/finance";

export async function getSettings(): Promise<AppSettings> {
  const rows = await getTrackPaisaDb().settings.toArray();
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    ...defaultSettings,
    ...stored,
  };
}

export async function updateSettings(settings: Partial<AppSettings>) {
  const db = getTrackPaisaDb();
  const current = await getSettings();
  const next = {
    ...current,
    ...settings,
  };

  await db.settings.bulkPut(
    Object.entries(next).map(([key, value]) => ({
      key: key as keyof AppSettings,
      value,
    })),
  );

  return next;
}
