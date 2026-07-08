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
    <div className="page-stack">
      <section className="section-card overflow-hidden">
        <div className="max-w-3xl">
          <p className="eyebrow">Appearance</p>
          <h2 className="heading-lg">Theme settings</h2>
        </div>

        <div className="mt-6 grid gap-5">
          <fieldset className="min-w-0">
            <legend className="flex items-center gap-2 text-sm font-bold">
              <Sun aria-hidden="true" size={18} />
              <span>Mode</span>
            </legend>
            <div className="mt-3 grid min-h-16 gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2 sm:grid-cols-2 xl:grid-cols-4">
              {(["light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleThemeModeChange(mode)}
                  aria-pressed={themeMode === mode}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold text-[var(--muted)] transition aria-pressed:bg-[var(--surface)] aria-pressed:text-[var(--primary)] aria-pressed:shadow-sm"
                >
                  {mode === "light" ? (
                    <Sun aria-hidden="true" size={18} />
                  ) : (
                    <Moon aria-hidden="true" size={18} />
                  )}
                  {mode === "light" ? "Light" : "Dark"}
                </button>
              ))}
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
          </fieldset>
        </div>
      </section>

      <section className="premium-card overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="max-w-2xl">
            <p className="eyebrow">PWA install</p>
            <h2 className="heading-lg">Install TrackPaisa</h2>
            <p className="copy">
              Add TrackPaisa to your home screen for a focused app window and faster
              access to your local money journal.
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-[var(--border)] bg-[var(--bg)]/45 p-5 sm:px-6">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!installPrompt || isInstalled}
            className="primary-action w-full sm:w-auto sm:min-w-32"
          >
            <Download aria-hidden="true" size={18} />
            {isInstalled ? "Installed" : "Install"}
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="stat-card">
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

        <div className="stat-card">
          <HardDrive aria-hidden="true" className="text-[var(--primary)]" size={22} />
          <h3 className="mt-3 font-bold">Local data</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Transactions, categories, reports, and backups stay in IndexedDB on this
            device.
          </p>
        </div>

        <div className="stat-card">
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
      aria-label={label}
      title={label}
      className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-[var(--muted)] transition aria-pressed:bg-[var(--surface)] aria-pressed:text-[var(--primary)] aria-pressed:shadow-sm"
    >
      <Palette aria-hidden="true" size={17} />
      <span className="flex gap-1">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            aria-hidden="true"
            className="h-5 w-5 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: swatch }}
          />
        ))}
      </span>
      {isSelected ? <Check aria-hidden="true" className="absolute right-3" size={17} /> : null}
    </button>
  );
}
