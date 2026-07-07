"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyColorTheme,
  appearanceChangeEvent,
  getStoredColorTheme,
  getStoredThemeMode,
  saveThemeMode,
  type ThemeMode,
} from "@/lib/utils/appearance";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    function syncTheme() {
      const storedTheme = getStoredThemeMode();
      setTheme(storedTheme);
      applyColorTheme(getStoredColorTheme());
    }

    syncTheme();
    window.addEventListener(appearanceChangeEvent, syncTheme);

    return () => {
      window.removeEventListener(appearanceChangeEvent, syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    saveThemeMode(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--text)]"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
