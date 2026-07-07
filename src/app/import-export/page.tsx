import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/features/common/placeholder-page";

export default function ImportExportPage() {
  return (
    <AppShell activePath="/import-export" phaseLabel="Phase 3" title="Import / Export">
      <PlaceholderPage
        title="Backup and restore"
        description="JSON backup, restore previews, duplicate handling, and CSV movement are planned after the core tracker is stable."
      />
    </AppShell>
  );
}
