"use client";

import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import React from "react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { defaultCategories } from "@/lib/constants/default-categories";
import { addTransaction } from "@/lib/db/repositories/transactions-repository";
import type { TransactionType } from "@/lib/types/finance";
import { validateTransactionDraft } from "@/lib/utils/validation";

interface TransactionDraftFormProps {
  initialType?: TransactionType;
}

export function TransactionDraftForm({ initialType = "expense" }: TransactionDraftFormProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [walletId, setWalletId] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categories = useMemo(
    () => defaultCategories.filter((category) => category.type === type),
    [type],
  );

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    setCategoryId("");
    setSavedMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const draft = {
      type,
      amount: Number(amount),
      categoryId,
      date,
      walletId: walletId.trim() || undefined,
      note: note.trim() || undefined,
    };
    const result = validateTransactionDraft(draft);

    setErrors(result.errors);
    setSavedMessage("");

    if (!result.valid) {
      return;
    }

    setIsSaving(true);

    try {
      const savedTransaction = await addTransaction(draft);

      setAmount("");
      setCategoryId("");
      setWalletId("");
      setNote("");
      setSavedMessage(
        `${savedTransaction.type === "income" ? "Income" : "Expense"} saved on this device.`,
      );
    } catch {
      setErrors(["Transaction could not be saved. Please try again."]);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div>
        <p className="text-sm font-bold text-[var(--primary)]">Fast entry</p>
        <h2 className="mt-2 text-2xl font-bold">Add income or expense</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Save income and expenses locally. No account needed; your data stays on this device.
        </p>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Transaction type</legend>
        <TypeButton active={type === "income"} onClick={() => handleTypeChange("income")}>
          <ArrowUpRight aria-hidden="true" size={18} />
          Income
        </TypeButton>
        <TypeButton active={type === "expense"} onClick={() => handleTypeChange("expense")}>
          <ArrowDownLeft aria-hidden="true" size={18} />
          Expense
        </TypeButton>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="850"
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base font-semibold outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Category
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Date
          <input
            value={date}
            onChange={(event) => setDate(event.target.value)}
            type="date"
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Wallet / Source
          <input
            value={walletId}
            onChange={(event) => setWalletId(event.target.value)}
            placeholder="Cash, Bank, UPI"
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-base outline-none"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold">
        Note
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Lunch, salary, groceries..."
          className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-base outline-none"
        />
      </label>

      {errors.length > 0 ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">Fix these fields</p>
          <ul className="mt-2 grid gap-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {savedMessage ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          {savedMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="min-h-11 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
      >
        {isSaving ? "Saving..." : `Save ${type}`}
      </button>
    </form>
  );
}

function TypeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold aria-pressed:bg-[var(--surface-muted)] aria-pressed:text-[var(--text)]"
    >
      {children}
    </button>
  );
}
