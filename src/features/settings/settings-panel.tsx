"use client";

import {
  Check,
  Download,
  HardDrive,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import {
  applyColorTheme,
  applyThemeMode,
  appearanceChangeEvent,
  getAppliedColorTheme,
  getAppliedThemeMode,
  saveColorTheme,
  saveThemeMode,
  type ColorTheme,
  type ThemeMode,
} from "@/lib/utils/appearance";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function SettingsPanel() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getAppliedThemeMode());
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => getAppliedColorTheme());

  useEffect(() => {
    function syncAppearance() {
      const storedThemeMode = getAppliedThemeMode();
      const storedColorTheme = getAppliedColorTheme();

      setThemeMode(storedThemeMode);
      setColorTheme(storedColorTheme);
      applyThemeMode(storedThemeMode);
      applyColorTheme(storedColorTheme);
    }

    syncAppearance();

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
    window.addEventListener(appearanceChangeEvent, syncAppearance);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(appearanceChangeEvent, syncAppearance);
    };
  }, []);

  async function handleInstallClick() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  function handleThemeModeChange(nextThemeMode: ThemeMode) {
    setThemeMode(nextThemeMode);
    saveThemeMode(nextThemeMode);
  }

  function handleColorThemeChange(nextColorTheme: ColorTheme) {
    setColorTheme(nextColorTheme);
    saveColorTheme(nextColorTheme);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-bold text-[var(--primary)]">Appearance</p>
        <h2 className="mt-2 text-2xl font-bold">Theme settings</h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sun aria-hidden="true" size={18} />
              <span>Mode</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2">
              {(["light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleThemeModeChange(mode)}
                  aria-pressed={themeMode === mode}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-[var(--muted)] aria-pressed:bg-[var(--surface)] aria-pressed:text-[var(--text)] aria-pressed:shadow-sm"
                >
                  {mode === "light" ? (
                    <Sun aria-hidden="true" size={18} />
                  ) : (
                    <Moon aria-hidden="true" size={18} />
                  )}
                  {mode === "light" ? "Light" : "Dark"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-bold">
              <Palette aria-hidden="true" size={18} />
              <span>Color theme</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ColorThemeButton
                colorTheme="green-blue"
                isSelected={colorTheme === "green-blue"}
                label="White, blue, green"
                onSelect={handleColorThemeChange}
                swatches={["#ffffff", "#166534", "#1d4ed8"]}
              />
              <ColorThemeButton
                colorTheme="colorful"
                isSelected={colorTheme === "colorful"}
                label="Colorful"
                onSelect={handleColorThemeChange}
                swatches={["#8b5cf6", "#10b981", "#f59e0b"]}
              />
            </div>
          </div>
        </div>
      </section>

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

interface ColorThemeButtonProps {
  colorTheme: ColorTheme;
  isSelected: boolean;
  label: string;
  onSelect: (colorTheme: ColorTheme) => void;
  swatches: string[];
}

function ColorThemeButton({
  colorTheme,
  isSelected,
  label,
  onSelect,
  swatches,
}: ColorThemeButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(colorTheme)}
      aria-pressed={isSelected}
      className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-left aria-pressed:border-[var(--primary)] aria-pressed:bg-[var(--surface-muted)]"
    >
      <span>
        <span className="block text-sm font-bold text-[var(--text)]">{label}</span>
        <span className="mt-2 flex gap-1">
          {swatches.map((swatch) => (
            <span
              key={swatch}
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-[var(--border)]"
              style={{ backgroundColor: swatch }}
            />
          ))}
        </span>
      </span>
      {isSelected ? <Check aria-hidden="true" size={18} /> : null}
    </button>
  );
}
