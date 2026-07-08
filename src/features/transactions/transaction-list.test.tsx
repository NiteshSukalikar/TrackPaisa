import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import { listWallets } from "@/lib/db/repositories/advanced-tracking-repository";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import {
  cloneTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "@/lib/db/repositories/transactions-repository";
import { TransactionList } from "@/features/transactions/transaction-list";

vi.mock("@/lib/db/repositories/categories-repository", () => ({
  listCategories: vi.fn(),
  seedDefaultCategories: vi.fn(),
}));

vi.mock("@/lib/db/repositories/advanced-tracking-repository", () => ({
  listWallets: vi.fn(),
}));

vi.mock("@/lib/db/repositories/transactions-repository", () => ({
  cloneTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  listTransactions: vi.fn(),
  updateTransaction: vi.fn(),
}));

const mockedCloneTransaction = vi.mocked(cloneTransaction);
const mockedListCategories = vi.mocked(listCategories);
const mockedListWallets = vi.mocked(listWallets);
const mockedListTransactions = vi.mocked(listTransactions);
const mockedSeedDefaultCategories = vi.mocked(seedDefaultCategories);
const mockedUpdateTransaction = vi.mocked(updateTransaction);
const mockedDeleteTransaction = vi.mocked(deleteTransaction);

function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  return {
    dateFrom: `${monthKey}-01`,
    dateTo: `${monthKey}-${String(lastDayOfMonth).padStart(2, "0")}`,
  };
}

describe("TransactionList", () => {
  beforeEach(() => {
    mockedSeedDefaultCategories.mockReset();
    mockedListCategories.mockReset();
    mockedListTransactions.mockReset();
    mockedListWallets.mockReset();
    mockedCloneTransaction.mockReset();
    mockedUpdateTransaction.mockReset();
    mockedDeleteTransaction.mockReset();

    mockedSeedDefaultCategories.mockResolvedValue(false);
    mockedListCategories.mockResolvedValue(defaultCategories);
    mockedListWallets.mockResolvedValue([
      {
        id: "wallet-upi",
        name: "UPI",
        type: "upi",
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    ]);
    mockedListTransactions.mockResolvedValue([
      {
        id: "salary",
        type: "income",
        amount: 90000,
        categoryId: "income-salary",
        date: "2026-07-01",
        note: "July salary",
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
      },
      {
        id: "dinner",
        type: "expense",
        amount: 450,
        categoryId: "expense-food",
        walletId: "UPI",
        date: "2026-07-05",
        note: "Dinner",
        tags: ["food"],
        createdAt: "2026-07-05T20:00:00.000Z",
        updatedAt: "2026-07-05T20:00:00.000Z",
      },
    ]);
    mockedUpdateTransaction.mockResolvedValue({
      id: "dinner",
      type: "expense",
      amount: 500,
      categoryId: "expense-food",
      walletId: "UPI",
      date: "2026-07-05",
      note: "Dinner with tip",
      tags: ["food"],
      createdAt: "2026-07-05T20:00:00.000Z",
      updatedAt: "2026-07-05T21:00:00.000Z",
    });
    mockedDeleteTransaction.mockResolvedValue(undefined);
    mockedCloneTransaction.mockResolvedValue({
      id: "dinner-copy",
      type: "expense",
      amount: 450,
      categoryId: "expense-food",
      walletId: "UPI",
      date: "2026-07-07",
      note: "Dinner",
      tags: ["food"],
      createdAt: "2026-07-07T08:00:00.000Z",
      updatedAt: "2026-07-07T08:00:00.000Z",
    });
  });

  it("renders saved transactions with category, note, wallet, and amount context", async () => {
    render(<TransactionList />);

    expect(await screen.findByText("July salary")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("July salary")).toBeInTheDocument();
    expect(screen.getAllByText(/UPI/).length).toBeGreaterThan(0);
    expect(screen.getByText("#food")).toBeInTheDocument();
    expect(screen.getAllByText("+₹90,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("-₹450").length).toBeGreaterThan(0);
  });

  it("reloads through the repository when filters change", async () => {
    const currentMonthRange = getCurrentMonthRange();

    render(<TransactionList />);

    await screen.findByText("July salary");

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "food" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "expense" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "expense-food" } });

    await waitFor(() => {
      expect(mockedListTransactions).toHaveBeenLastCalledWith({
        type: "expense",
        categoryId: "expense-food",
        dateFrom: currentMonthRange.dateFrom,
        dateTo: currentMonthRange.dateTo,
        search: "food",
        tag: undefined,
        walletId: undefined,
      });
    });
  });

  it("shows an empty state when no transactions match", async () => {
    mockedListTransactions.mockResolvedValue([]);

    render(<TransactionList />);

    expect(await screen.findByText("No transactions found")).toBeInTheDocument();
  });

  it("updates an existing transaction from the inline edit form", async () => {
    render(<TransactionList />);

    await screen.findByText("Dinner");

    fireEvent.click(screen.getByRole("button", { name: "Open actions for Dinner transaction" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Dinner transaction" }));
    fireEvent.change(screen.getByLabelText("Edit amount"), { target: { value: "500" } });
    fireEvent.change(screen.getByLabelText("Edit note"), { target: { value: " Dinner with tip " } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockedUpdateTransaction).toHaveBeenCalledWith("dinner", {
        type: "expense",
        amount: 500,
        categoryId: "expense-food",
        date: "2026-07-05",
        walletId: "UPI",
        note: "Dinner with tip",
        tags: ["food"],
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Transaction updated.");
  });

  it("deletes a transaction after confirmation", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<TransactionList />);

    await screen.findByText("Dinner");

    fireEvent.click(screen.getByRole("button", { name: "Open actions for Dinner transaction" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Dinner transaction" }));

    await waitFor(() => {
      expect(mockedDeleteTransaction).toHaveBeenCalledWith("dinner");
    });

    expect(confirmSpy).toHaveBeenCalledWith("Delete this transaction? This cannot be undone.");
    expect(await screen.findByRole("status")).toHaveTextContent("Transaction deleted.");

    confirmSpy.mockRestore();
  });

  it("clones an existing transaction", async () => {
    render(<TransactionList />);

    await screen.findByText("Dinner");

    fireEvent.click(screen.getByRole("button", { name: "Open actions for Dinner transaction" }));
    fireEvent.click(screen.getByRole("button", { name: "Clone Dinner transaction" }));

    await waitFor(() => {
      expect(mockedCloneTransaction).toHaveBeenCalledWith("dinner");
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Transaction cloned for today.");
  });
});
