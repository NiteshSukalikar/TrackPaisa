"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCategoryFromDraft,
  deleteCategory,
  getCategoryUsageCounts,
  listCategories,
  seedDefaultCategories,
  updateCategoryFromDraft,
  upsertCategory,
  type CategoryDraft,
} from "@/lib/db/repositories/categories-repository";
import type { Category, TransactionType } from "@/lib/types/finance";

const colorOptions = ["#16A34A", "#2563EB", "#F59E0B", "#DC2626", "#8B5CF6", "#14B8A6", "#64748B"];
const iconOptions = [
  "briefcase",
  "laptop",
  "sparkles",
  "gift",
  "utensils",
  "home",
  "train",
  "shopping-bag",
  "heart-pulse",
  "receipt",
];

const emptyDraft: CategoryDraft = {
  name: "",
  type: "expense",
  icon: iconOptions[0],
  color: colorOptions[0],
};

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CategoryDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoading(true);
      setError("");

      try {
        await seedDefaultCategories();

        const [nextCategories, nextUsageCounts] = await Promise.all([
          listCategories(),
          getCategoryUsageCounts(),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setUsageCounts(nextUsageCounts);
        }
      } catch {
        if (isMounted) {
          setError("Categories could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const groupedCategories = useMemo(
    () => ({
      income: categories.filter((category) => category.type === "income"),
      expense: categories.filter((category) => category.type === "expense"),
    }),
    [categories],
  );

  function refreshCategories() {
    setReloadKey((current) => current + 1);
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const nextCategory = createCategoryFromDraft(draft, categories);

      setPendingActionId("add");
      await upsertCategory(nextCategory);
      setDraft({ ...emptyDraft, type: draft.type });
      setMessage("Category added.");
      refreshCategories();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Category could not be added.");
    } finally {
      setPendingActionId(null);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditDraft({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
    setError("");
  }

  async function saveEdit(category: Category) {
    if (!editDraft) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const nextCategory = updateCategoryFromDraft(category, editDraft);

      setPendingActionId(`save-${category.id}`);
      await upsertCategory(nextCategory);
      setEditingId(null);
      setEditDraft(null);
      setMessage("Category updated.");
      refreshCategories();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Category could not be updated.");
    } finally {
      setPendingActionId(null);
    }
  }

  async function removeCategory(category: Category) {
    const usageCount = usageCounts[category.id] ?? 0;

    if (usageCount > 0) {
      setError("Category is used by transactions and cannot be deleted yet.");
      setMessage("");
      return;
    }

    const confirmed = window.confirm(`Delete ${category.name}? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setPendingActionId(`delete-${category.id}`);
    setError("");
    setMessage("");

    try {
      await deleteCategory(category.id);
      setMessage("Category deleted.");
      refreshCategories();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Category could not be deleted.");
    } finally {
      setPendingActionId(null);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Money labels</p>
          <h2 className="mt-2 text-2xl font-bold">Categories</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Create income and expense categories for the way you actually track money.
          </p>
        </div>
      </div>

      <form
        onSubmit={addCategory}
        className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold">
          <Plus aria-hidden="true" size={18} />
          Add category
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
          <CategoryDraftFields draft={draft} onChange={setDraft} nameLabel="Name" />
          <button
            type="submit"
            disabled={pendingActionId === "add"}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            <Plus aria-hidden="true" size={17} />
            {pendingActionId === "add" ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <CategorySection
          title="Expense categories"
          type="expense"
          categories={groupedCategories.expense}
          isLoading={isLoading}
          usageCounts={usageCounts}
          editingId={editingId}
          editDraft={editDraft}
          pendingActionId={pendingActionId}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onDraftChange={setEditDraft}
          onSaveEdit={saveEdit}
          onDelete={removeCategory}
        />
        <CategorySection
          title="Income categories"
          type="income"
          categories={groupedCategories.income}
          isLoading={isLoading}
          usageCounts={usageCounts}
          editingId={editingId}
          editDraft={editDraft}
          pendingActionId={pendingActionId}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onDraftChange={setEditDraft}
          onSaveEdit={saveEdit}
          onDelete={removeCategory}
        />
      </div>
    </section>
  );
}

function CategorySection({
  title,
  type,
  categories,
  isLoading,
  usageCounts,
  editingId,
  editDraft,
  pendingActionId,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onSaveEdit,
  onDelete,
}: {
  title: string;
  type: TransactionType;
  categories: Category[];
  isLoading: boolean;
  usageCounts: Record<string, number>;
  editingId: string | null;
  editDraft: CategoryDraft | null;
  pendingActionId: string | null;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onDraftChange: (draft: CategoryDraft) => void;
  onSaveEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const Icon = type === "income" ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Icon aria-hidden="true" size={18} />
          {title}
        </div>
        <p className="text-sm text-[var(--muted)]" aria-live="polite">
          {isLoading ? "Loading..." : `${categories.length} saved`}
        </p>
      </div>

      {isLoading ? (
        <div className="p-5 text-sm text-[var(--muted)]">Loading categories from this device.</div>
      ) : categories.length === 0 ? (
        <div className="p-5 text-sm text-[var(--muted)]">No categories saved yet.</div>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              usageCount={usageCounts[category.id] ?? 0}
              isEditing={editingId === category.id}
              editDraft={editingId === category.id ? editDraft : null}
              pendingActionId={pendingActionId}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onDraftChange={onDraftChange}
              onSaveEdit={onSaveEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  usageCount,
  isEditing,
  editDraft,
  pendingActionId,
  onStartEdit,
  onCancelEdit,
  onDraftChange,
  onSaveEdit,
  onDelete,
}: {
  category: Category;
  usageCount: number;
  isEditing: boolean;
  editDraft: CategoryDraft | null;
  pendingActionId: string | null;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onDraftChange: (draft: CategoryDraft) => void;
  onSaveEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <li className="grid gap-3 px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-sm font-bold"
          style={{ backgroundColor: `${category.color}18`, color: category.color }}
          aria-hidden="true"
        >
          {category.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words font-bold">{category.name}</p>
            <span className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-bold text-[var(--muted)]">
              {category.isDefault ? "Default" : "Custom"}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {category.icon} / {usageCount} {usageCount === 1 ? "transaction" : "transactions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStartEdit(category)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)]"
            aria-label={`Edit ${category.name} category`}
          >
            <Pencil aria-hidden="true" size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            disabled={pendingActionId === `delete-${category.id}` || usageCount > 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Delete ${category.name} category`}
            title={usageCount > 0 ? "Used categories cannot be deleted" : "Delete category"}
          >
            <Trash2 aria-hidden="true" size={17} />
          </button>
        </div>
      </div>

      {isEditing && editDraft ? (
        <form
          className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSaveEdit(category);
          }}
        >
          <div className="grid gap-4 lg:grid-cols-4">
            <CategoryDraftFields draft={editDraft} onChange={onDraftChange} nameLabel="Edit name" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pendingActionId === `save-${category.id}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              <Save aria-hidden="true" size={17} />
              {pendingActionId === `save-${category.id}` ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold"
            >
              <X aria-hidden="true" size={17} />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </li>
  );
}

function CategoryDraftFields({
  draft,
  nameLabel,
  onChange,
}: {
  draft: CategoryDraft;
  nameLabel: string;
  onChange: (draft: CategoryDraft) => void;
}) {
  function updateDraft<Key extends keyof CategoryDraft>(key: Key, value: CategoryDraft[Key]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <>
      <label className="grid gap-2 text-sm font-bold">
        {nameLabel}
        <input
          value={draft.name}
          onChange={(event) => updateDraft("name", event.target.value)}
          placeholder="Groceries"
          className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Type
        <select
          value={draft.type}
          onChange={(event) => updateDraft("type", event.target.value as TransactionType)}
          className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Icon
        <select
          value={draft.icon}
          onChange={(event) => updateDraft("icon", event.target.value)}
          className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
        >
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Color
        <span className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3">
          <span
            aria-hidden="true"
            className="h-5 w-5 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: draft.color }}
          />
          <select
            value={draft.color}
            onChange={(event) => updateDraft("color", event.target.value)}
            className="min-h-9 flex-1 bg-transparent text-base outline-none"
            aria-label="Color"
          >
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </span>
      </label>
    </>
  );
}
