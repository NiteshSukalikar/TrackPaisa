import { AppShell } from "@/components/layout/app-shell";
import { CategoryManager } from "@/features/categories/category-manager";

export default function CategoriesPage() {
  return (
    <AppShell activePath="/categories" phaseLabel="Phase 1" title="Categories">
      <CategoryManager />
    </AppShell>
  );
}
