import { defaultCategories } from "@/lib/constants/default-categories";
import { getTrackPaisaDb } from "@/lib/db/database";
import type { Category, TransactionType } from "@/lib/types/finance";

export async function seedDefaultCategories() {
  const db = getTrackPaisaDb();
  const existingCount = await db.categories.count();

  if (existingCount > 0) {
    return false;
  }

  await db.categories.bulkAdd(defaultCategories);

  return true;
}

export async function listCategories(type?: TransactionType) {
  const db = getTrackPaisaDb();
  const categories = type
    ? await db.categories.where("type").equals(type).sortBy("sortOrder")
    : await db.categories.orderBy("sortOrder").toArray();

  return categories;
}

export async function upsertCategory(category: Category) {
  await getTrackPaisaDb().categories.put(category);

  return category;
}

export async function deleteCategory(id: string) {
  const db = getTrackPaisaDb();
  const usageCount = await db.transactions.where("categoryId").equals(id).count();

  if (usageCount > 0) {
    throw new Error("Category is used by transactions and cannot be deleted yet.");
  }

  await db.categories.delete(id);
}
