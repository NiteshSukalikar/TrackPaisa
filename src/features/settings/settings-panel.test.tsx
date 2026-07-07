import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "@/features/settings/settings-panel";
import { saveColorTheme, saveThemeMode } from "@/lib/utils/appearance";

describe("SettingsPanel appearance sync", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-palette");
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("keeps selected appearance controls in sync with global theme changes", async () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.palette = "green";

    render(<SettingsPanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "White, blue, green" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    act(() => {
      saveThemeMode("dark");
      saveColorTheme("colorful");
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "Colorful" })).toHaveAttribute("aria-pressed", "true");
    });
  });
});
