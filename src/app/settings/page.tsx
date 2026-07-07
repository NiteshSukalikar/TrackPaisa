import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/features/settings/settings-panel";

export default function SettingsPage() {
  return (
    <AppShell activePath="/settings" phaseLabel="Phase 4" title="Settings">
      <SettingsPanel />
    </AppShell>
  );
}
