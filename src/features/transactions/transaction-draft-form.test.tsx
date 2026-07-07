import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionDraftForm } from "@/features/transactions/transaction-draft-form";
import { addTransaction } from "@/lib/db/repositories/transactions-repository";

vi.mock("@/lib/db/repositories/transactions-repository", () => ({
  addTransaction: vi.fn(),
}));

const mockedAddTransaction = vi.mocked(addTransaction);

describe("TransactionDraftForm", () => {
  beforeEach(() => {
    mockedAddTransaction.mockReset();
  });

  it("saves an expense draft through the transaction repository", async () => {
    mockedAddTransaction.mockResolvedValue({
      id: "transaction-id",
      type: "expense",
      amount: 850,
      categoryId: "expense-food",
      date: "2026-07-07",
      createdAt: "2026-07-07T10:00:00.000Z",
      updatedAt: "2026-07-07T10:00:00.000Z",
    });

    render(<TransactionDraftForm initialType="expense" />);

    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "850" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "expense-food" } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-07-07" } });
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: " lunch " } });
    fireEvent.click(screen.getByRole("button", { name: "Save expense" }));

    await waitFor(() => {
      expect(mockedAddTransaction).toHaveBeenCalledWith({
        type: "expense",
        amount: 850,
        categoryId: "expense-food",
        date: "2026-07-07",
        walletId: undefined,
        note: "lunch",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Expense saved on this device.");
  });

  it("saves an income draft when income mode is active", async () => {
    mockedAddTransaction.mockResolvedValue({
      id: "income-id",
      type: "income",
      amount: 90000,
      categoryId: "income-salary",
      date: "2026-07-07",
      createdAt: "2026-07-07T10:00:00.000Z",
      updatedAt: "2026-07-07T10:00:00.000Z",
    });

    render(<TransactionDraftForm initialType="income" />);

    fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "90000" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "income-salary" } });
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2026-07-07" } });
    fireEvent.click(screen.getByRole("button", { name: "Save income" }));

    await waitFor(() => {
      expect(mockedAddTransaction).toHaveBeenCalledWith({
        type: "income",
        amount: 90000,
        categoryId: "income-salary",
        date: "2026-07-07",
        walletId: undefined,
        note: undefined,
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Income saved on this device.");
  });
});
