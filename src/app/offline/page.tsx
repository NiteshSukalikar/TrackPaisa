import { AppShell } from "@/components/layout/app-shell";

export default function OfflinePage() {
  return (
    <AppShell activePath="/settings" phaseLabel="Phase 4" title="Offline mode">
      <section className="section-card">
        <p className="eyebrow">Offline-ready shell</p>
        <h2 className="heading-lg">You are offline</h2>
        <p className="copy">
          TrackPaisa keeps your money records on this device. When the app shell is
          cached, you can reopen core pages without a network connection and continue
          using local data already stored in IndexedDB.
        </p>
        <a
          href="/"
          className="primary-action mt-5"
        >
          Back to overview
        </a>
      </section>
    </AppShell>
  );
}
