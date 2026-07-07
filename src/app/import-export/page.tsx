import { AppShell } from "@/components/layout/app-shell";
import { ImportExportManager } from "@/features/import-export/import-export-manager";

export default function ImportExportPage() {
  return (
    <AppShell activePath="/import-export" phaseLabel="Phase 3" title="Import / Export">
      <ImportExportManager />
    </AppShell>
  );
}
