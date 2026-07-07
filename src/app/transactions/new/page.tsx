import { AppShell } from "@/components/layout/app-shell";
import { TransactionDraftForm } from "@/features/transactions/transaction-draft-form";
import type { TransactionType } from "@/lib/types/finance";

interface AddTransactionPageProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function AddTransactionPage({ searchParams }: AddTransactionPageProps) {
  const params = await searchParams;
  const initialType: TransactionType = params.type === "income" ? "income" : "expense";

  return (
    <AppShell activePath="/transactions/new" phaseLabel="Phase 1" title="Add transaction">
      <TransactionDraftForm initialType={initialType} />
    </AppShell>
  );
}
