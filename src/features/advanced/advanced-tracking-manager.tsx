"use client";

import {
  CalendarClock,
  CheckCircle2,
  CopyPlus,
  Eye,
  Landmark,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
  updateRecurringTemplate,
  updateWallet,
} from "@/lib/db/repositories/advanced-tracking-repository";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import type { BudgetLimit, Category, RecurringTemplate, TransactionType, Wallet } from "@/lib/types/finance";
import { formatInr } from "@/lib/utils/currency";

type ActiveTab = "wallets" | "budgets" | "templates";
type ViewItem =
  | { kind: "wallet"; item: Wallet }
  | { kind: "budget"; item: BudgetLimit }
  | { kind: "template"; item: RecurringTemplate }
  | null;

const pageSize = 25;
const tabs: Array<{ id: ActiveTab; label: string; icon: LucideIcon }> = [
  { id: "wallets", label: "Wallet", icon: Landmark },
  { id: "budgets", label: "Category", icon: PiggyBank },
  { id: "templates", label: "Templates", icon: CalendarClock },
];

const initialWalletFilters = { search: "", type: "all" as Wallet["type"] | "all" };
const initialBudgetFilters = { categoryId: "", monthKey: "", search: "" };
const initialTemplateFilters = {
  categoryId: "",
  frequency: "all" as RecurringTemplate["frequency"] | "all",
  search: "",
  type: "all" as TransactionType | "all",
};

export function AdvancedTrackingManager() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("wallets");
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<ViewItem>(null);

  const [walletName, setWalletName] = useState("");
  const [walletType, setWalletType] = useState<Wallet["type"]>("upi");
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [walletFilterDraft, setWalletFilterDraft] = useState(initialWalletFilters);
  const [walletFilters, setWalletFilters] = useState(initialWalletFilters);
  const [walletPage, setWalletPage] = useState(1);

  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetFilterDraft, setBudgetFilterDraft] = useState(initialBudgetFilters);
  const [budgetFilters, setBudgetFilters] = useState(initialBudgetFilters);
  const [budgetPage, setBudgetPage] = useState(1);

  const [templateType, setTemplateType] = useState<TransactionType>("expense");
  const [templateAmount, setTemplateAmount] = useState("");
  const [templateCategoryId, setTemplateCategoryId] = useState("");
  const [templateWalletId, setTemplateWalletId] = useState("");
  const [templateFrequency, setTemplateFrequency] = useState<RecurringTemplate["frequency"]>("monthly");
  const [templateNextDate, setTemplateNextDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [templateNote, setTemplateNote] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateFilterDraft, setTemplateFilterDraft] = useState(initialTemplateFilters);
  const [templateFilters, setTemplateFilters] = useState(initialTemplateFilters);
  const [templatePage, setTemplatePage] = useState(1);

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

  const filteredWallets = useMemo(
    () =>
      wallets.filter((wallet) => {
        const matchesSearch = wallet.name.toLowerCase().includes(walletFilters.search.toLowerCase().trim());
        const matchesType = walletFilters.type === "all" || wallet.type === walletFilters.type;

        return matchesSearch && matchesType;
      }),
    [walletFilters, wallets],
  );

  const filteredBudgets = useMemo(
    () =>
      budgets.filter((budget) => {
        const categoryName = categoriesById.get(budget.categoryId)?.name ?? "";
        const matchesSearch = categoryName.toLowerCase().includes(budgetFilters.search.toLowerCase().trim());
        const matchesCategory = !budgetFilters.categoryId || budget.categoryId === budgetFilters.categoryId;
        const matchesMonth = !budgetFilters.monthKey || budget.monthKey === budgetFilters.monthKey;

        return matchesSearch && matchesCategory && matchesMonth;
      }),
    [budgetFilters, budgets, categoriesById],
  );

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) => {
        const categoryName = categoriesById.get(template.categoryId)?.name ?? "";
        const haystack = `${categoryName} ${template.note ?? ""} ${template.walletId ?? ""} ${
          template.tags?.join(" ") ?? ""
        }`.toLowerCase();
        const matchesSearch = haystack.includes(templateFilters.search.toLowerCase().trim());
        const matchesCategory = !templateFilters.categoryId || template.categoryId === templateFilters.categoryId;
        const matchesFrequency =
          templateFilters.frequency === "all" || template.frequency === templateFilters.frequency;
        const matchesType = templateFilters.type === "all" || template.type === templateFilters.type;

        return matchesSearch && matchesCategory && matchesFrequency && matchesType;
      }),
    [categoriesById, templateFilters, templates],
  );

  const pagedWallets = paginate(filteredWallets, walletPage);
  const pagedBudgets = paginate(filteredBudgets, budgetPage);
  const pagedTemplates = paginate(filteredTemplates, templatePage);

  function refresh() {
    setReloadKey((current) => current + 1);
  }

  function clearFeedback() {
    setError("");
    setMessage("");
  }

  function switchTab(nextTab: ActiveTab) {
    setActiveTab(nextTab);
    setOpenActionId(null);
    setViewItem(null);
  }

  async function handleWalletSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      if (editingWalletId) {
        await updateWallet(editingWalletId, { name: walletName, type: walletType });
        setMessage("Wallet updated.");
      } else {
        await saveWallet({ name: walletName, type: walletType });
        setMessage("Wallet saved.");
      }

      resetWalletEditor();
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Wallet could not be saved.");
    }
  }

  async function handleBudgetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      await saveBudgetLimit({
        categoryId: budgetCategoryId,
        amount: Number(budgetAmount),
        monthKey: budgetMonth,
      });
      setBudgetAmount("");
      setEditingBudgetId(null);
      setMessage(editingBudgetId ? "Budget limit updated." : "Budget limit saved.");
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Budget could not be saved.");
    }
  }

  async function handleTemplateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      const draft = {
        type: templateType,
        amount: Number(templateAmount),
        categoryId: templateCategoryId,
        walletId: templateWalletId || undefined,
        frequency: templateFrequency,
        nextDate: templateNextDate,
        note: templateNote || undefined,
        tags: parseTags(templateTags),
      };

      if (editingTemplateId) {
        await updateRecurringTemplate(editingTemplateId, draft);
        setMessage("Recurring template updated.");
      } else {
        await saveRecurringTemplate(draft);
        setMessage("Recurring template saved.");
      }

      resetTemplateEditor();
      refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Template could not be saved.");
    }
  }

  async function runTemplate(template: RecurringTemplate) {
    clearFeedback();

    try {
      await createTransactionFromTemplate(template);
      setMessage("Template added as a transaction and moved to the next date.");
      refresh();
    } catch {
      setError("Template could not create a transaction.");
    }
  }

  function resetWalletEditor() {
    setWalletName("");
    setWalletType("upi");
    setEditingWalletId(null);
  }

  function resetBudgetEditor() {
    setBudgetCategoryId("");
    setBudgetAmount("");
    setBudgetMonth(new Date().toISOString().slice(0, 7));
    setEditingBudgetId(null);
  }

  function resetTemplateEditor() {
    setTemplateType("expense");
    setTemplateAmount("");
    setTemplateCategoryId("");
    setTemplateWalletId("");
    setTemplateFrequency("monthly");
    setTemplateNextDate(new Date().toISOString().slice(0, 10));
    setTemplateNote("");
    setTemplateTags("");
    setEditingTemplateId(null);
  }

  function editWallet(wallet: Wallet) {
    setWalletName(wallet.name);
    setWalletType(wallet.type);
    setEditingWalletId(wallet.id);
    setOpenActionId(null);
  }

  function editBudget(budget: BudgetLimit) {
    setBudgetCategoryId(budget.categoryId);
    setBudgetAmount(String(budget.amount));
    setBudgetMonth(budget.monthKey);
    setEditingBudgetId(budget.id);
    setOpenActionId(null);
  }

  function editTemplate(template: RecurringTemplate) {
    setTemplateType(template.type);
    setTemplateAmount(String(template.amount));
    setTemplateCategoryId(template.categoryId);
    setTemplateWalletId(template.walletId ?? "");
    setTemplateFrequency(template.frequency);
    setTemplateNextDate(template.nextDate);
    setTemplateNote(template.note ?? "");
    setTemplateTags(template.tags?.join(", ") ?? "");
    setEditingTemplateId(template.id);
    setOpenActionId(null);
  }

  async function removeWallet(wallet: Wallet) {
    if (!window.confirm(`Delete ${wallet.name}? This cannot be undone.`)) {
      return;
    }

    await deleteWallet(wallet.id);
    setMessage("Wallet deleted.");
    refresh();
  }

  async function removeBudget(budget: BudgetLimit) {
    if (!window.confirm("Delete this budget limit? This cannot be undone.")) {
      return;
    }

    await deleteBudgetLimit(budget.id);
    setMessage("Budget limit deleted.");
    refresh();
  }

  async function removeTemplate(template: RecurringTemplate) {
    if (!window.confirm("Delete this recurring template? This cannot be undone.")) {
      return;
    }

    await deleteRecurringTemplate(template.id);
    setMessage("Recurring template deleted.");
    refresh();
  }

  return (
    <section className="page-stack">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Advanced tracking</p>
          <h2 className="heading-lg">Budgets, wallets, and recurring templates</h2>
          <p className="copy">
            Manage optional structure for regular payments and category limits while keeping quick entry simple.
          </p>
        </div>
      </div>

      {error ? <Alert icon={XCircle} tone="error">{error}</Alert> : null}
      {message ? <Alert icon={CheckCircle2} tone="success">{message}</Alert> : null}

      <section className="premium-card overflow-hidden">
        <div className="border-b border-[var(--border)] p-2">
          <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Advanced tracking sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => switchTab(tab.id)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold text-[var(--muted)] transition aria-selected:bg-[var(--surface-muted)] aria-selected:text-[var(--primary)]"
              >
                <tab.icon aria-hidden="true" size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5">
          {activeTab === "wallets" ? (
            <WalletSection
              editingWalletId={editingWalletId}
              filters={walletFilterDraft}
              isBusy={isBusy}
              onCancelEdit={resetWalletEditor}
              onDelete={removeWallet}
              onEdit={editWallet}
              onFilterChange={setWalletFilterDraft}
              onFind={() => {
                setWalletFilters(walletFilterDraft);
                setWalletPage(1);
              }}
              onPageChange={setWalletPage}
              onResetFilters={() => {
                setWalletFilterDraft(initialWalletFilters);
                setWalletFilters(initialWalletFilters);
                setWalletPage(1);
              }}
              onSubmit={handleWalletSubmit}
              onView={(wallet) => {
                setViewItem({ kind: "wallet", item: wallet });
                setOpenActionId(null);
              }}
              openActionId={openActionId}
              page={walletPage}
              pagedWallets={pagedWallets}
              setOpenActionId={setOpenActionId}
              totalCount={filteredWallets.length}
              walletName={walletName}
              walletType={walletType}
              setWalletName={setWalletName}
              setWalletType={setWalletType}
            />
          ) : null}

          {activeTab === "budgets" ? (
            <BudgetSection
              budgetAmount={budgetAmount}
              budgetCategoryId={budgetCategoryId}
              budgetMonth={budgetMonth}
              categoriesById={categoriesById}
              editingBudgetId={editingBudgetId}
              expenseCategories={expenseCategories}
              filters={budgetFilterDraft}
              isBusy={isBusy}
              onCancelEdit={resetBudgetEditor}
              onDelete={removeBudget}
              onEdit={editBudget}
              onFilterChange={setBudgetFilterDraft}
              onFind={() => {
                setBudgetFilters(budgetFilterDraft);
                setBudgetPage(1);
              }}
              onPageChange={setBudgetPage}
              onResetFilters={() => {
                setBudgetFilterDraft(initialBudgetFilters);
                setBudgetFilters(initialBudgetFilters);
                setBudgetPage(1);
              }}
              onSubmit={handleBudgetSubmit}
              onView={(budget) => {
                setViewItem({ kind: "budget", item: budget });
                setOpenActionId(null);
              }}
              openActionId={openActionId}
              page={budgetPage}
              pagedBudgets={pagedBudgets}
              setBudgetAmount={setBudgetAmount}
              setBudgetCategoryId={setBudgetCategoryId}
              setBudgetMonth={setBudgetMonth}
              setOpenActionId={setOpenActionId}
              totalCount={filteredBudgets.length}
            />
          ) : null}

          {activeTab === "templates" ? (
            <TemplateSection
              categoriesById={categoriesById}
              editingTemplateId={editingTemplateId}
              filters={templateFilterDraft}
              isBusy={isBusy}
              onCancelEdit={resetTemplateEditor}
              onDelete={removeTemplate}
              onEdit={editTemplate}
              onFilterChange={setTemplateFilterDraft}
              onFind={() => {
                setTemplateFilters(templateFilterDraft);
                setTemplatePage(1);
              }}
              onPageChange={setTemplatePage}
              onResetFilters={() => {
                setTemplateFilterDraft(initialTemplateFilters);
                setTemplateFilters(initialTemplateFilters);
                setTemplatePage(1);
              }}
              onRun={runTemplate}
              onSubmit={handleTemplateSubmit}
              onView={(template) => {
                setViewItem({ kind: "template", item: template });
                setOpenActionId(null);
              }}
              openActionId={openActionId}
              page={templatePage}
              pagedTemplates={pagedTemplates}
              setOpenActionId={setOpenActionId}
              setTemplateAmount={setTemplateAmount}
              setTemplateCategoryId={setTemplateCategoryId}
              setTemplateFrequency={setTemplateFrequency}
              setTemplateNextDate={setTemplateNextDate}
              setTemplateNote={setTemplateNote}
              setTemplateTags={setTemplateTags}
              setTemplateType={setTemplateType}
              setTemplateWalletId={setTemplateWalletId}
              templateAmount={templateAmount}
              templateCategories={templateCategories}
              templateCategoryId={templateCategoryId}
              templateFrequency={templateFrequency}
              templateNextDate={templateNextDate}
              templateNote={templateNote}
              templateTags={templateTags}
              templateType={templateType}
              templateWalletId={templateWalletId}
              totalCount={filteredTemplates.length}
              wallets={wallets}
            />
          ) : null}
        </div>
      </section>

      {viewItem ? (
        <ViewPanel
          categoriesById={categoriesById}
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
      ) : null}
    </section>
  );
}

function WalletSection({
  editingWalletId,
  filters,
  isBusy,
  onCancelEdit,
  onDelete,
  onEdit,
  onFilterChange,
  onFind,
  onPageChange,
  onResetFilters,
  onSubmit,
  onView,
  openActionId,
  page,
  pagedWallets,
  setOpenActionId,
  setWalletName,
  setWalletType,
  totalCount,
  walletName,
  walletType,
}: {
  editingWalletId: string | null;
  filters: typeof initialWalletFilters;
  isBusy: boolean;
  onCancelEdit: () => void;
  onDelete: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onFilterChange: (filters: typeof initialWalletFilters) => void;
  onFind: () => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onView: (wallet: Wallet) => void;
  openActionId: string | null;
  page: number;
  pagedWallets: Wallet[];
  setOpenActionId: (id: string | null) => void;
  setWalletName: (value: string) => void;
  setWalletType: (value: Wallet["type"]) => void;
  totalCount: number;
  walletName: string;
  walletType: Wallet["type"];
}) {
  return (
    <div className="grid gap-4">
      <FilterCard title="Wallet filters" onFind={onFind} onReset={onResetFilters}>
        <label className="grid gap-2 text-sm font-bold">
          Search
          <SearchInput
            value={filters.search}
            onChange={(value) => onFilterChange({ ...filters, search: value })}
            placeholder="Wallet name"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Type
          <select
            value={filters.type}
            onChange={(event) => onFilterChange({ ...filters, type: event.target.value as Wallet["type"] | "all" })}
            className="field-control min-h-11 w-full"
          >
            <option value="all">All types</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>
        </label>
      </FilterCard>

      <EditorCard title={editingWalletId ? "Edit wallet" : "Add wallet"} onCancel={editingWalletId ? onCancelEdit : undefined}>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr_0.7fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-bold">
            Name
            <input
              value={walletName}
              onChange={(event) => setWalletName(event.target.value)}
              className="field-control min-h-11 w-full"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Type
            <select
              value={walletType}
              onChange={(event) => setWalletType(event.target.value as Wallet["type"])}
              className="field-control min-h-11 w-full"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button type="submit" className="primary-action md:min-w-36 md:justify-self-end">
            <Plus aria-hidden="true" size={17} />
            {editingWalletId ? "Update wallet" : "Add wallet"}
          </button>
        </form>
      </EditorCard>

      <DataTable
        empty={isBusy ? "Loading wallets." : "No wallets match these filters."}
        footer={<Pagination count={totalCount} page={page} onPageChange={onPageChange} />}
        title="Wallets"
        count={totalCount}
      >
        <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Created</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {pagedWallets.map((wallet) => (
            <tr key={wallet.id} className="transition hover:bg-[var(--surface-muted)]/45">
              <Td strong>{wallet.name}</Td>
              <Td className="capitalize">{wallet.type}</Td>
              <Td>{formatDateTime(wallet.createdAt)}</Td>
              <Td align="right">
                <RowActions
                  id={`wallet-${wallet.id}`}
                  isOpen={openActionId === `wallet-${wallet.id}`}
                  onToggle={setOpenActionId}
                  actions={[
                    { label: "View", icon: Eye, onClick: () => onView(wallet) },
                    { label: "Edit", icon: Pencil, onClick: () => onEdit(wallet) },
                    { label: "Delete", icon: Trash2, tone: "danger", onClick: () => void onDelete(wallet) },
                  ]}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function BudgetSection({
  budgetAmount,
  budgetCategoryId,
  budgetMonth,
  categoriesById,
  editingBudgetId,
  expenseCategories,
  filters,
  isBusy,
  onCancelEdit,
  onDelete,
  onEdit,
  onFilterChange,
  onFind,
  onPageChange,
  onResetFilters,
  onSubmit,
  onView,
  openActionId,
  page,
  pagedBudgets,
  setBudgetAmount,
  setBudgetCategoryId,
  setBudgetMonth,
  setOpenActionId,
  totalCount,
}: {
  budgetAmount: string;
  budgetCategoryId: string;
  budgetMonth: string;
  categoriesById: Map<string, Category>;
  editingBudgetId: string | null;
  expenseCategories: Category[];
  filters: typeof initialBudgetFilters;
  isBusy: boolean;
  onCancelEdit: () => void;
  onDelete: (budget: BudgetLimit) => void;
  onEdit: (budget: BudgetLimit) => void;
  onFilterChange: (filters: typeof initialBudgetFilters) => void;
  onFind: () => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onView: (budget: BudgetLimit) => void;
  openActionId: string | null;
  page: number;
  pagedBudgets: BudgetLimit[];
  setBudgetAmount: (value: string) => void;
  setBudgetCategoryId: (value: string) => void;
  setBudgetMonth: (value: string) => void;
  setOpenActionId: (id: string | null) => void;
  totalCount: number;
}) {
  return (
    <div className="grid gap-4">
      <FilterCard title="Budget filters" onFind={onFind} onReset={onResetFilters}>
        <label className="grid gap-2 text-sm font-bold">
          Search
          <SearchInput
            value={filters.search}
            onChange={(value) => onFilterChange({ ...filters, search: value })}
            placeholder="Category name"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Category
          <select
            value={filters.categoryId}
            onChange={(event) => onFilterChange({ ...filters, categoryId: event.target.value })}
            className="field-control min-h-11 w-full"
          >
            <option value="">All categories</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Month
          <input
            value={filters.monthKey}
            onChange={(event) => onFilterChange({ ...filters, monthKey: event.target.value })}
            type="month"
            className="field-control min-h-11 w-full"
          />
        </label>
      </FilterCard>

      <EditorCard title={editingBudgetId ? "Edit budget" : "Add budget"} onCancel={editingBudgetId ? onCancelEdit : undefined}>
        <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[0.8fr_1fr_0.8fr_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-bold">
            Month
            <input
              value={budgetMonth}
              onChange={(event) => setBudgetMonth(event.target.value)}
              type="month"
              className="field-control min-h-11 w-full"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Category
            <select
              value={budgetCategoryId}
              onChange={(event) => setBudgetCategoryId(event.target.value)}
              className="field-control min-h-11 w-full"
            >
              <option value="">Select expense category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Limit
            <input
              value={budgetAmount}
              onChange={(event) => setBudgetAmount(event.target.value)}
              inputMode="decimal"
              className="field-control min-h-11 w-full"
            />
          </label>
          <button type="submit" className="primary-action lg:min-w-36 lg:justify-self-end">
            <Plus aria-hidden="true" size={17} />
            {editingBudgetId ? "Update budget" : "Save budget"}
          </button>
        </form>
      </EditorCard>

      <DataTable
        empty={isBusy ? "Loading budgets." : "No budgets match these filters."}
        footer={<Pagination count={totalCount} page={page} onPageChange={onPageChange} />}
        title="Category budgets"
        count={totalCount}
      >
        <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <tr>
            <Th>Category</Th>
            <Th>Month</Th>
            <Th>Limit</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {pagedBudgets.map((budget) => (
            <tr key={budget.id} className="transition hover:bg-[var(--surface-muted)]/45">
              <Td strong>{categoriesById.get(budget.categoryId)?.name ?? "Category"}</Td>
              <Td>{budget.monthKey}</Td>
              <Td>{formatInr(budget.amount)}</Td>
              <Td align="right">
                <RowActions
                  id={`budget-${budget.id}`}
                  isOpen={openActionId === `budget-${budget.id}`}
                  onToggle={setOpenActionId}
                  actions={[
                    { label: "View", icon: Eye, onClick: () => onView(budget) },
                    { label: "Edit", icon: Pencil, onClick: () => onEdit(budget) },
                    { label: "Delete", icon: Trash2, tone: "danger", onClick: () => void onDelete(budget) },
                  ]}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function TemplateSection({
  categoriesById,
  editingTemplateId,
  filters,
  isBusy,
  onCancelEdit,
  onDelete,
  onEdit,
  onFilterChange,
  onFind,
  onPageChange,
  onResetFilters,
  onRun,
  onSubmit,
  onView,
  openActionId,
  page,
  pagedTemplates,
  setOpenActionId,
  setTemplateAmount,
  setTemplateCategoryId,
  setTemplateFrequency,
  setTemplateNextDate,
  setTemplateNote,
  setTemplateTags,
  setTemplateType,
  setTemplateWalletId,
  templateAmount,
  templateCategories,
  templateCategoryId,
  templateFrequency,
  templateNextDate,
  templateNote,
  templateTags,
  templateType,
  templateWalletId,
  totalCount,
  wallets,
}: {
  categoriesById: Map<string, Category>;
  editingTemplateId: string | null;
  filters: typeof initialTemplateFilters;
  isBusy: boolean;
  onCancelEdit: () => void;
  onDelete: (template: RecurringTemplate) => void;
  onEdit: (template: RecurringTemplate) => void;
  onFilterChange: (filters: typeof initialTemplateFilters) => void;
  onFind: () => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onRun: (template: RecurringTemplate) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onView: (template: RecurringTemplate) => void;
  openActionId: string | null;
  page: number;
  pagedTemplates: RecurringTemplate[];
  setOpenActionId: (id: string | null) => void;
  setTemplateAmount: (value: string) => void;
  setTemplateCategoryId: (value: string) => void;
  setTemplateFrequency: (value: RecurringTemplate["frequency"]) => void;
  setTemplateNextDate: (value: string) => void;
  setTemplateNote: (value: string) => void;
  setTemplateTags: (value: string) => void;
  setTemplateType: (value: TransactionType) => void;
  setTemplateWalletId: (value: string) => void;
  templateAmount: string;
  templateCategories: Category[];
  templateCategoryId: string;
  templateFrequency: RecurringTemplate["frequency"];
  templateNextDate: string;
  templateNote: string;
  templateTags: string;
  templateType: TransactionType;
  templateWalletId: string;
  totalCount: number;
  wallets: Wallet[];
}) {
  return (
    <div className="grid gap-4">
      <FilterCard title="Template filters" onFind={onFind} onReset={onResetFilters}>
        <label className="grid gap-2 text-sm font-bold">
          Search
          <SearchInput
            value={filters.search}
            onChange={(value) => onFilterChange({ ...filters, search: value })}
            placeholder="Category, wallet, note, tag"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Type
          <select
            value={filters.type}
            onChange={(event) => onFilterChange({ ...filters, type: event.target.value as TransactionType | "all" })}
            className="field-control min-h-11 w-full"
          >
            <option value="all">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Frequency
          <select
            value={filters.frequency}
            onChange={(event) =>
              onFilterChange({ ...filters, frequency: event.target.value as RecurringTemplate["frequency"] | "all" })
            }
            className="field-control min-h-11 w-full"
          >
            <option value="all">All frequencies</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </FilterCard>

      <EditorCard
        title={editingTemplateId ? "Edit template" : "Add template"}
        onCancel={editingTemplateId ? onCancelEdit : undefined}
      >
        <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold">
            Type
            <select
              value={templateType}
              onChange={(event) => {
                setTemplateType(event.target.value as TransactionType);
                setTemplateCategoryId("");
              }}
              className="field-control min-h-11 w-full"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Amount
            <input
              value={templateAmount}
              onChange={(event) => setTemplateAmount(event.target.value)}
              inputMode="decimal"
              className="field-control min-h-11 w-full"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Category
            <select
              value={templateCategoryId}
              onChange={(event) => setTemplateCategoryId(event.target.value)}
              className="field-control min-h-11 w-full"
            >
              <option value="">Select category</option>
              {templateCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Frequency
            <select
              value={templateFrequency}
              onChange={(event) => setTemplateFrequency(event.target.value as RecurringTemplate["frequency"])}
              className="field-control min-h-11 w-full"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Next date
            <input
              value={templateNextDate}
              onChange={(event) => setTemplateNextDate(event.target.value)}
              type="date"
              className="field-control min-h-11 w-full"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Wallet / Source
            <select
              value={templateWalletId}
              onChange={(event) => setTemplateWalletId(event.target.value)}
              className="field-control min-h-11 w-full"
            >
              <option value="">No wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.name}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Note
            <input
              value={templateNote}
              onChange={(event) => setTemplateNote(event.target.value)}
              className="field-control min-h-11 w-full"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Tags
            <input
              value={templateTags}
              onChange={(event) => setTemplateTags(event.target.value)}
              placeholder="fixed, monthly"
              className="field-control min-h-11 w-full"
            />
          </label>
          <div className="flex items-end lg:justify-end">
            <button type="submit" className="primary-action lg:min-w-40">
              <Plus aria-hidden="true" size={17} />
              {editingTemplateId ? "Update template" : "Save template"}
            </button>
          </div>
        </form>
      </EditorCard>

      <DataTable
        empty={isBusy ? "Loading templates." : "No templates match these filters."}
        footer={<Pagination count={totalCount} page={page} onPageChange={onPageChange} />}
        title="Recurring templates"
        count={totalCount}
      >
        <thead className="bg-[var(--surface-muted)] text-left text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <tr>
            <Th>Category</Th>
            <Th>Type</Th>
            <Th>Amount</Th>
            <Th>Frequency</Th>
            <Th>Next date</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {pagedTemplates.map((template) => (
            <tr key={template.id} className="transition hover:bg-[var(--surface-muted)]/45">
              <Td strong>{categoriesById.get(template.categoryId)?.name ?? "Category"}</Td>
              <Td className="capitalize">{template.type}</Td>
              <Td>{formatInr(template.amount)}</Td>
              <Td className="capitalize">{template.frequency}</Td>
              <Td>{formatShortDate(template.nextDate)}</Td>
              <Td align="right">
                <RowActions
                  id={`template-${template.id}`}
                  isOpen={openActionId === `template-${template.id}`}
                  onToggle={setOpenActionId}
                  actions={[
                    { label: "View", icon: Eye, onClick: () => onView(template) },
                    { label: "Edit", icon: Pencil, onClick: () => onEdit(template) },
                    { label: "Add transaction", icon: CopyPlus, onClick: () => void onRun(template) },
                    { label: "Delete", icon: Trash2, tone: "danger", onClick: () => void onDelete(template) },
                  ]}
                />
              </Td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function FilterCard({
  children,
  onFind,
  onReset,
  title,
}: {
  children: ReactNode;
  onFind: () => void;
  onReset: () => void;
  title: string;
}) {
  return (
    <section className="subtle-panel">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Search aria-hidden="true" size={18} />
              {title}
            </div>
          </div>
          {children}
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={onReset}
            className="secondary-action px-3 text-[var(--muted)] sm:min-w-24"
          >
            <RotateCcw aria-hidden="true" size={17} />
            Reset
          </button>
          <button
            type="button"
            onClick={onFind}
            className="primary-action px-3 sm:min-w-24"
          >
            <Search aria-hidden="true" size={17} />
            Find
          </button>
        </div>
      </div>
    </section>
  );
}

function SearchInput({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <span className="relative">
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        size={18}
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-control min-h-11 w-full py-2 pl-10 pr-3"
      />
    </span>
  );
}

function EditorCard({
  children,
  onCancel,
  title,
}: {
  children: ReactNode;
  onCancel?: () => void;
  title: string;
}) {
  return (
    <section className="section-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold">{title}</h3>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="secondary-action min-h-10 px-3 text-xs text-[var(--muted)]"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DataTable({
  children,
  count,
  empty,
  footer,
  title,
}: {
  children: ReactNode;
  count: number;
  empty: string;
  footer: ReactNode;
  title: string;
}) {
  return (
    <section className="premium-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-sm text-[var(--muted)]">{count} shown</p>
      </div>
      {count === 0 ? (
        <p className="p-5 text-sm leading-6 text-[var(--muted)]">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">{children}</table>
        </div>
      )}
      {footer}
    </section>
  );
}

function Th({ align = "left", children }: { align?: "left" | "right"; children: ReactNode }) {
  return <th className={`px-4 py-3 font-bold ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({
  align = "left",
  children,
  className = "",
  strong = false,
}: {
  align?: "left" | "right";
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <td className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"} ${strong ? "font-bold" : ""} ${className}`}>
      {children}
    </td>
  );
}

function RowActions({
  actions,
  id,
  isOpen,
  onToggle,
}: {
  actions: Array<{ icon: LucideIcon; label: string; onClick: () => void; tone?: "danger" }>;
  id: string;
  isOpen: boolean;
  onToggle: (id: string | null) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ right: number; top: number }>({ right: 0, top: 0 });

  function toggleMenu() {
    const button = buttonRef.current;

    if (button) {
      const rect = button.getBoundingClientRect();
      const menuHeight = actions.length * 40 + 8;
      setMenuPosition({
        right: Math.max(12, window.innerWidth - rect.right),
        top: Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - menuHeight - 12)),
      });
    }

    onToggle(isOpen ? null : id);
  }

  return (
    <div className="inline-flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="icon-action"
        aria-label="Open row actions"
      >
        <MoreVertical aria-hidden="true" size={18} />
      </button>
      {isOpen ? (
        <div
          className="fixed z-50 min-w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] text-left shadow-soft backdrop-blur-xl"
          style={{ right: menuPosition.right, top: menuPosition.top }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                onToggle(null);
                action.onClick();
              }}
              className={`flex min-h-10 w-full items-center gap-2 px-3 text-sm font-bold hover:bg-[var(--surface-muted)] ${
                action.tone === "danger" ? "text-[var(--danger)]" : "text-[var(--text)]"
              }`}
            >
              <action.icon aria-hidden="true" size={16} />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Pagination({
  count,
  onPageChange,
  page,
}: {
  count: number;
  onPageChange: (page: number) => void;
  page: number;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const start = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(count, page * pageSize);

  return (
    <div className="flex flex-col justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] sm:flex-row sm:items-center">
      <span>
        {start}-{end} of {count}, 25 per page
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="secondary-action min-h-10 px-3 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="secondary-action min-h-10 px-3 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ViewPanel({
  categoriesById,
  item,
  onClose,
}: {
  categoriesById: Map<string, Category>;
  item: ViewItem;
  onClose: () => void;
}) {
  if (!item) {
    return null;
  }

  const rows =
    item.kind === "wallet"
      ? [
          ["Name", item.item.name],
          ["Type", item.item.type],
          ["Created", formatDateTime(item.item.createdAt)],
        ]
      : item.kind === "budget"
        ? [
            ["Category", categoriesById.get(item.item.categoryId)?.name ?? "Category"],
            ["Month", item.item.monthKey],
            ["Limit", formatInr(item.item.amount)],
          ]
        : [
            ["Category", categoriesById.get(item.item.categoryId)?.name ?? "Category"],
            ["Type", item.item.type],
            ["Amount", formatInr(item.item.amount)],
            ["Frequency", item.item.frequency],
            ["Next date", formatShortDate(item.item.nextDate)],
            ["Wallet / Source", item.item.walletId ?? "No wallet"],
            ["Note", item.item.note ?? "No note"],
            ["Tags", item.item.tags?.join(", ") || "No tags"],
          ];

  return (
    <section className="section-card">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">Details</h3>
        <button
          type="button"
          onClick={onClose}
          className="secondary-action min-h-10 px-3 text-[var(--muted)]"
        >
          Close
        </button>
      </div>
      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="subtle-panel p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-bold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Alert({ children, icon: Icon, tone }: { children: string; icon: LucideIcon; tone: "error" | "success" }) {
  const classes =
    tone === "error"
      ? "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)]"
      : "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]";

  return (
    <div role={tone === "error" ? "alert" : "status"} className={`status-alert flex gap-2 font-semibold ${classes}`}>
      <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
      {children}
    </div>
  );
}

function paginate<Item>(items: Item[], page: number) {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function parseTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

