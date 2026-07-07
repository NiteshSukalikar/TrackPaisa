import { defaultCategories } from "@/lib/constants/default-categories";
import { getTrackPaisaDb } from "@/lib/db/database";
import type { Category, TransactionType } from "@/lib/types/finance";

export interface CategoryDraft {
  color: string;
  icon: string;
  name: string;
  type: TransactionType;
}

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

export async function getCategoryUsageCounts() {
  const transactions = await getTrackPaisaDb().transactions.toArray();

  return transactions.reduce<Record<string, number>>((counts, transaction) => {
    counts[transaction.categoryId] = (counts[transaction.categoryId] ?? 0) + 1;
    return counts;
  }, {});
}

export function createCategoryFromDraft(
  draft: Partial<CategoryDraft>,
  existingCategories: Category[] = [],
  now = new Date(),
  idFactory: () => string = () => crypto.randomUUID(),
): Category {
  const errors = validateCategoryDraft(draft);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  const type = draft.type as TransactionType;
  const sameTypeCategories = existingCategories.filter((category) => category.type === type);
  const maxSortOrder = Math.max(0, ...sameTypeCategories.map((category) => category.sortOrder));

  return {
    id: idFactory(),
    name: draft.name!.trim(),
    type,
    icon: draft.icon!.trim(),
    color: draft.color!.trim(),
    sortOrder: maxSortOrder + 1,
    isDefault: false,
    createdAt: now.toISOString(),
  };
}

export function updateCategoryFromDraft(category: Category, draft: Partial<CategoryDraft>): Category {
  const errors = validateCategoryDraft(draft);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  return {
    ...category,
    name: draft.name!.trim(),
    type: draft.type as TransactionType,
    icon: draft.icon!.trim(),
    color: draft.color!.trim(),
  };
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

function validateCategoryDraft(draft: Partial<CategoryDraft>) {
  const errors: string[] = [];

  if (draft.type !== "income" && draft.type !== "expense") {
    errors.push("Type is required.");
  }

  if (!draft.name?.trim()) {
    errors.push("Name is required.");
  }

  if (!draft.icon?.trim()) {
    errors.push("Icon is required.");
  }

  if (!draft.color?.trim() || !/^#[0-9a-f]{6}$/i.test(draft.color.trim())) {
    errors.push("Color must be a valid hex value.");
  }

  return errors;
}
