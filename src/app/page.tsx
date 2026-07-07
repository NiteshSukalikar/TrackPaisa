import { AppShell } from "@/components/layout/app-shell";
import { EmptyOverview } from "@/features/overview/empty-overview";

export default function Home() {
  return (
    <AppShell>
      <EmptyOverview />
    </AppShell>
  );
}
