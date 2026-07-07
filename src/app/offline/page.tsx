import { AppShell } from "@/components/layout/app-shell";

export default function OfflinePage() {
  return (
    <AppShell activePath="/settings" phaseLabel="Phase 4" title="Offline mode">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-bold text-[var(--primary)]">Offline-ready shell</p>
        <h2 className="mt-2 text-2xl font-bold">You are offline</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          TrackPaisa keeps your money records on this device. When the app shell is
          cached, you can reopen core pages without a network connection and continue
          using local data already stored in IndexedDB.
        </p>
        <a
          href="/"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
        >
          Back to overview
        </a>
      </section>
    </AppShell>
  );
}
