"use client";

import { Download, HardDrive, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function SettingsPanel() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsOnline(window.navigator.onLine);
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  async function handleInstallClick() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--primary)]">PWA install</p>
            <h2 className="mt-2 text-2xl font-bold">Install TrackPaisa</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Add TrackPaisa to your home screen for a focused app window and faster
              access to your local money journal.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!installPrompt || isInstalled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download aria-hidden="true" size={18} />
            {isInstalled ? "Installed" : "Install"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          {isOnline ? (
            <Wifi aria-hidden="true" className="text-[var(--primary)]" size={22} />
          ) : (
            <WifiOff aria-hidden="true" className="text-[var(--accent)]" size={22} />
          )}
          <h3 className="mt-3 font-bold">Connection</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {isOnline ? "Online now. Offline shell caching is active after install." : "Offline now. Cached pages and local data remain available."}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <HardDrive aria-hidden="true" className="text-[var(--primary)]" size={22} />
          <h3 className="mt-3 font-bold">Local data</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Transactions, categories, reports, and backups stay in IndexedDB on this
            device.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <ShieldCheck aria-hidden="true" className="text-[var(--primary)]" size={22} />
          <h3 className="mt-3 font-bold">Privacy</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            No login, cloud sync, or AI data sharing is required for the current app.
          </p>
        </div>
      </section>
    </div>
  );
}
