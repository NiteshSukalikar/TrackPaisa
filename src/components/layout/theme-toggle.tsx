"use client";

import { Moon, Palette, Sun } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";
import {
  applyColorTheme,
  applyThemeMode,
  appearanceChangeEvent,
  getAppliedColorTheme,
  getAppliedThemeMode,
  getColorThemeLabel,
  saveColorTheme,
  saveThemeMode,
  type ColorTheme,
  type ThemeMode,
} from "@/lib/utils/appearance";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getAppliedThemeMode());
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => getAppliedColorTheme());

  useEffect(() => {
    function syncTheme() {
      const storedTheme = getAppliedThemeMode();
      const storedColorTheme = getAppliedColorTheme();

      setTheme(storedTheme);
      setColorTheme(storedColorTheme);
      applyThemeMode(storedTheme);
      applyColorTheme(storedColorTheme);
    }

    syncTheme();
    window.addEventListener(appearanceChangeEvent, syncTheme);

    return () => {
      window.removeEventListener(appearanceChangeEvent, syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveThemeMode(nextTheme);
  }

  function togglePalette() {
    const nextColorTheme = colorTheme === "colorful" ? "green-blue" : "colorful";
    setColorTheme(nextColorTheme);
    saveColorTheme(nextColorTheme);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="secondary-action rounded-full px-4 text-[var(--text)]"
      >
        {theme === "dark" ? (
          <Sun aria-hidden="true" size={18} />
        ) : (
          <Moon aria-hidden="true" size={18} />
        )}
        <span className="hidden sm:inline">Light / Dark</span>
      </button>

      <button
        type="button"
        onClick={togglePalette}
        aria-label={`Switch to ${colorTheme === "colorful" ? "green-blue" : "colorful"} theme`}
        title={getColorThemeLabel(colorTheme)}
        className="secondary-action rounded-full px-4 text-[var(--text)]"
      >
        <Palette aria-hidden="true" size={18} />
        <span className="hidden sm:inline">Theme</span>
        <span
          aria-hidden="true"
          className="h-4 w-4 rounded-full border border-[var(--border)]"
          style={{
            background:
              colorTheme === "colorful"
                ? "linear-gradient(135deg, #8b5cf6, #10b981, #f59e0b)"
                : "linear-gradient(135deg, #166534, #1d4ed8)",
          }}
        />
      </button>
    </div>
  );
}
