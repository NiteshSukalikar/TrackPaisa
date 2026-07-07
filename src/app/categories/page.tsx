import { AppShell } from "@/components/layout/app-shell";
import { PlaceholderPage } from "@/features/common/placeholder-page";

export default function CategoriesPage() {
  return (
    <AppShell activePath="/categories" phaseLabel="Phase 1" title="Categories">
      <PlaceholderPage
        title="Category management"
        description="Default categories are seeded. Custom category add, edit, color, icon, and safe deletion workflows come next."
      />
    </AppShell>
  );
}
