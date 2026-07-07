import { AppShell } from "@/components/layout/app-shell";
import { TransactionList } from "@/features/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <AppShell activePath="/transactions" phaseLabel="Phase 1" title="Transactions">
      <TransactionList />
    </AppShell>
  );
}
