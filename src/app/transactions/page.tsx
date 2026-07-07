import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/features/common/placeholder-page";

export default function TransactionsPage() {
  return (
    <AppShell activePath="/transactions" phaseLabel="Phase 1" title="Transactions">
      <PlaceholderPage
        title="Transactions list"
        description="Search, filters, edit, delete, and IndexedDB-backed history will land after the add-transaction persistence slice."
      />
    </AppShell>
  );
}
