"use client";

import {
  CalendarClock,
  CheckCircle2,
  CopyPlus,
  Landmark,
  PiggyBank,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  createTransactionFromTemplate,
  deleteBudgetLimit,
  deleteRecurringTemplate,
  deleteWallet,
  listBudgetLimits,
  listRecurringTemplates,
  listWallets,
  saveBudgetLimit,
  saveRecurringTemplate,
  saveWallet,
} from "@/lib/db/repositories/advanced-tracking-repository";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import type { BudgetLimit, Category, RecurringTemplate, TransactionType, Wallet } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";

export function AdvancedTrackingManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState<Wallet["type"]>("upi");
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [templateType, setTemplateType] = useState<TransactionType>("expense");
  const [templateAmount, setTemplateAmount] = useState("");
  const [templateCategoryId, setTemplateCategoryId] = useState("");
  const [templateWalletId, setTemplateWalletId] = useState("");
  const [templateFrequency, setTemplateFrequency] = useState<RecurringTemplate["frequency"]>("monthly");
  const [templateNextDate, setTemplateNextDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [templateNote, setTemplateNote] = useState("");
  const [templateTags, setTemplateTags] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAdvancedData() {
      setIsBusy(true);
      setError("");

      try {
        await seedDefaultCategories();
        const [nextCategories, nextWallets, nextBudgets, nextTemplates] = await Promise.all([
          listCategories(),
          listWallets(),
          listBudgetLimits(),
          listRecurringTemplates(),
        ]);

        if (isMounted) {
          setCategories(nextCategories);
          setWallets(nextWallets);
          setBudgets(nextBudgets);
          setTemplates(nextTemplates);
        }
      } catch {
        if (isMounted) {
          setError("Advanced tracking data could not be loaded from this device.");
        }
      } finally {
        if (isMounted) {
          setIsBusy(false);
        }
      }
    }

    void loadAdvancedData();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );
  const templateCategories = useMemo(
    () => categories.filter((category) => category.type === templateType),
    [categories, templateType],
  );
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  function refresh() {
    setReloadKey((current) => current + 1);
  }

  async function handleWalletSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await saveWallet({ name: walletName, type: walletType });
      setWalletName("");
      setMessage("Wallet saved.");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Wallet could not be saved.");
    }
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await saveBudgetLimit({
        categoryId: budgetCategoryId,
        amount: Number(budgetAmount),
        monthKey: budgetMonth,
      });
      setBudgetAmount("");
      setMessage("Budget limit saved.");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Budget could not be saved.");
    }
  }

  async function handleTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await saveRecurringTemplate({
        type: templateType,
        amount: Number(templateAmount),
        categoryId: templateCategoryId,
        walletId: templateWalletId || undefined,
        frequency: templateFrequency,
        nextDate: templateNextDate,
        note: templateNote || undefined,
        tags: parseTags(templateTags),
      });
      setTemplateAmount("");
      setTemplateNote("");
      setTemplateTags("");
      setMessage("Recurring template saved.");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Template could not be saved.");
    }
  }

  async function runTemplate(template: RecurringTemplate) {
    setMessage("");
    setError("");

    try {
      await createTransactionFromTemplate(template);
      setMessage("Template added as a transaction and moved to the next date.");
      refresh();
    } catch {
      setError("Template could not create a transaction.");
    }
  }

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-bold text-[var(--primary)]">Advanced tracking</p>
        <h2 className="mt-2 text-2xl font-bold">Budgets, wallets, and recurring templates</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Add optional structure for regular payments and category limits while keeping quick entry simple.
        </p>
      </div>

      {error ? <Alert icon={XCircle} tone="error">{error}</Alert> : null}
      {message ? <Alert icon={CheckCircle2} tone="success">{message}</Alert> : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <form onSubmit={handleWalletSubmit} className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <Header icon={Landmark} title="Wallets / sources" />
          <label className="grid gap-2 text-sm font-bold">
            Name
            <input value={walletName} onChange={(event) => setWalletName(event.target.value)} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Type
            <select value={walletType} onChange={(event) => setWalletType(event.target.value as Wallet["type"])} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white">
            <Plus aria-hidden="true" size={17} />
            Add wallet
          </button>
          <ItemList empty="No wallets saved yet.">
            {wallets.map((wallet) => (
              <SavedItem key={wallet.id} primary={wallet.name} secondary={wallet.type} onDelete={() => void deleteWallet(wallet.id).then(refresh)} />
            ))}
          </ItemList>
        </form>

        <form onSubmit={handleBudgetSubmit} className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <Header icon={PiggyBank} title="Category budgets" />
          <label className="grid gap-2 text-sm font-bold">
            Month
            <input value={budgetMonth} onChange={(event) => setBudgetMonth(event.target.value)} type="month" className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Category
            <select value={budgetCategoryId} onChange={(event) => setBudgetCategoryId(event.target.value)} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
              <option value="">Select expense category</option>
              {expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Limit
            <input value={budgetAmount} onChange={(event) => setBudgetAmount(event.target.value)} inputMode="decimal" className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white">
            <Plus aria-hidden="true" size={17} />
            Save budget
          </button>
          <ItemList empty="No category budgets saved yet.">
            {budgets.map((budget) => (
              <SavedItem
                key={budget.id}
                primary={categoriesById.get(budget.categoryId)?.name ?? "Category"}
                secondary={`${budget.monthKey} - ${formatInr(budget.amount)}`}
                onDelete={() => void deleteBudgetLimit(budget.id).then(refresh)}
              />
            ))}
          </ItemList>
        </form>

        <form onSubmit={handleTemplateSubmit} className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <Header icon={CalendarClock} title="Recurring templates" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Type
              <select value={templateType} onChange={(event) => { setTemplateType(event.target.value as TransactionType); setTemplateCategoryId(""); }} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Amount
              <input value={templateAmount} onChange={(event) => setTemplateAmount(event.target.value)} inputMode="decimal" className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Category
            <select value={templateCategoryId} onChange={(event) => setTemplateCategoryId(event.target.value)} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
              <option value="">Select category</option>
              {templateCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Frequency
              <select value={templateFrequency} onChange={(event) => setTemplateFrequency(event.target.value as RecurringTemplate["frequency"])} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Next date
              <input value={templateNextDate} onChange={(event) => setTemplateNextDate(event.target.value)} type="date" className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Wallet / Source
            <select value={templateWalletId} onChange={(event) => setTemplateWalletId(event.target.value)} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none">
              <option value="">No wallet</option>
              {wallets.map((wallet) => <option key={wallet.id} value={wallet.name}>{wallet.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Note
            <input value={templateNote} onChange={(event) => setTemplateNote(event.target.value)} className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Tags
            <input value={templateTags} onChange={(event) => setTemplateTags(event.target.value)} placeholder="fixed, monthly" className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none" />
          </label>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white">
            <Plus aria-hidden="true" size={17} />
            Save template
          </button>
          <ItemList empty={isBusy ? "Loading templates." : "No recurring templates saved yet."}>
            {templates.map((template) => (
              <SavedItem
                key={template.id}
                primary={`${categoriesById.get(template.categoryId)?.name ?? "Category"} - ${formatInr(template.amount)}`}
                secondary={`${template.frequency}, next ${template.nextDate}`}
                actionLabel="Add transaction"
                actionIcon={CopyPlus}
                onAction={() => void runTemplate(template)}
                onDelete={() => void deleteRecurringTemplate(template.id).then(refresh)}
              />
            ))}
          </ItemList>
        </form>
      </section>
    </section>
  );
}

function Header({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <Icon aria-hidden="true" size={20} className="text-[var(--muted)]" />
    </div>
  );
}

function Alert({ children, icon: Icon, tone }: { children: string; icon: LucideIcon; tone: "error" | "success" }) {
  const classes =
    tone === "error"
      ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]"
      : "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]";

  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-2 rounded-lg border p-4 text-sm font-semibold ${classes}`}>
      <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
      {children}
    </div>
  );
}

function ItemList({ children, empty }: { children: ReactNode; empty: string }) {
  return (
    <div className="grid gap-2 border-t border-[var(--border)] pt-4">
      {Array.isArray(children) && children.length === 0 ? (
        <p className="text-sm leading-6 text-[var(--muted)]">{empty}</p>
      ) : (
        children
      )}
    </div>
  );
}

function SavedItem({
  actionIcon: ActionIcon,
  actionLabel,
  onAction,
  onDelete,
  primary,
  secondary,
}: {
  actionIcon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  onDelete: () => void;
  primary: string;
  secondary: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{primary}</p>
        <p className="mt-1 truncate text-xs text-[var(--muted)]">{secondary}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        {onAction && ActionIcon ? (
          <button type="button" onClick={onAction} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)]" aria-label={actionLabel}>
            <ActionIcon aria-hidden="true" size={16} />
          </button>
        ) : null}
        <button type="button" onClick={onDelete} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--danger-border)] text-[var(--danger)]" aria-label={`Delete ${primary}`}>
          <Trash2 aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
}

function parseTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}
