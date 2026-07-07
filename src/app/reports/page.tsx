import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/features/common/placeholder-page";

export default function ReportsPage() {
  return (
    <AppShell activePath="/reports" phaseLabel="Phase 2" title="Reports">
      <PlaceholderPage
        title="Reports and analytics"
        description="Category breakdowns, income vs expense trends, and period comparisons will follow once transactions persist locally."
      />
    </AppShell>
  );
}
