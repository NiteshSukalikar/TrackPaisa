import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/features/common/placeholder-page";

export default function SettingsPage() {
  return (
    <AppShell activePath="/settings" phaseLabel="Phase 0-3" title="Settings">
      <PlaceholderPage
        title="Settings shell"
        description="Theme is already local. Currency, privacy, data reset, and backup preferences will be added in later slices."
      />
    </AppShell>
  );
}
