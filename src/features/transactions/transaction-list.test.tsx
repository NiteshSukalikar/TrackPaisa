import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultCategories } from "@/lib/constants/default-categories";
import { listCategories, seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import { listTransactions } from "@/lib/db/repositories/transactions-repository";
import { TransactionList } from "@/features/transactions/transaction-list";

vi.mock("@/lib/db/repositories/categories-repository", () => ({
  listCategories: vi.fn(),
  seedDefaultCategories: vi.fn(),
}));

vi.mock("@/lib/db/repositories/transactions-repository", () => ({
  listTransactions: vi.fn(),
}));

const mockedListCategories = vi.mocked(listCategories);
const mockedListTransactions = vi.mocked(listTransactions);
const mockedSeedDefaultCategories = vi.mocked(seedDefaultCategories);

describe("TransactionList", () => {
  beforeEach(() => {
    mockedSeedDefaultCategories.mockReset();
    mockedListCategories.mockReset();
    mockedListTransactions.mockReset();

    mockedSeedDefaultCategories.mockResolvedValue(false);
    mockedListCategories.mockResolvedValue(defaultCategories);
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
        createdAt: "2026-07-05T20:00:00.000Z",
        updatedAt: "2026-07-05T20:00:00.000Z",
      },
    ]);
  });

  it("renders saved transactions with category, note, wallet, and amount context", async () => {
    render(<TransactionList />);

    expect(await screen.findByText("July salary")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("July salary")).toBeInTheDocument();
    expect(screen.getByText(/UPI/)).toBeInTheDocument();
    expect(screen.getByText("+₹90,000")).toBeInTheDocument();
    expect(screen.getByText("-₹450")).toBeInTheDocument();
  });

  it("reloads through the repository when filters change", async () => {
    render(<TransactionList />);

    await screen.findByText("July salary");

    fireEvent.change(screen.getByLabelText("Search"), { target: { value: "food" } });
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "expense" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "expense-food" } });

    await waitFor(() => {
      expect(mockedListTransactions).toHaveBeenLastCalledWith({
        type: "expense",
        categoryId: "expense-food",
        dateFrom: undefined,
        dateTo: undefined,
        search: "food",
      });
    });
  });

  it("shows an empty state when no transactions match", async () => {
    mockedListTransactions.mockResolvedValue([]);

    render(<TransactionList />);

    expect(await screen.findByText("No transactions found")).toBeInTheDocument();
  });
});
