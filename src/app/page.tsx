import { AppShell } from "@/components/layout/app-shell";
import { OverviewDashboard } from "@/features/overview/overview-dashboard";

export default function Home() {
  return (
    <AppShell>
      <OverviewDashboard />
    </AppShell>
  );
}
