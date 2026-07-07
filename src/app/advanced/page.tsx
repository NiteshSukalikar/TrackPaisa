import { AppShell } from "@/components/layout/app-shell";
import { AdvancedTrackingManager } from "@/features/advanced/advanced-tracking-manager";

export default function AdvancedPage() {
  return (
    <AppShell activePath="/advanced" phaseLabel="Phase 5" title="Advanced tracking">
      <AdvancedTrackingManager />
    </AppShell>
  );
}
