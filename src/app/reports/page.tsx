import { AppShell } from "@/components/layout/app-shell";
import { ReportsDashboard } from "@/features/reports/reports-dashboard";

export default function ReportsPage() {
  return (
    <AppShell activePath="/reports" phaseLabel="Phase 2" title="Reports">
      <ReportsDashboard />
    </AppShell>
  );
}
